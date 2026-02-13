from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict
import os
from anthropic import Anthropic

router = APIRouter()
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ============================================================================
# SCHEMAS
# ============================================================================

class LeadData(BaseModel):
    name: str
    email: str
    company_name: Optional[str] = None
    company_size: Optional[int] = None
    industry: Optional[str] = None
    job_title: Optional[str] = None

class LeadQualificationRequest(BaseModel):
    lead: LeadData
    qualification_framework: Literal["BANT", "MEDDIC", "CHAMP"] = "BANT"

class FrameworkScores(BaseModel):
    budget: float
    authority: float
    need: float
    timing: float

class LeadQualificationResponse(BaseModel):
    is_qualified: bool
    score: float = Field(ge=0, le=100)
    framework_scores: FrameworkScores
    recommendation: str
    next_steps: List[str]

class LeadScoringRequest(BaseModel):
    lead: LeadData
    engagement_data: Optional[Dict] = None

class LeadScoringResponse(BaseModel):
    score: float = Field(ge=0, le=100)
    breakdown: Dict[str, float]
    tier: Literal["hot", "warm", "cold"]
    priority: int = Field(ge=1, le=5)

class ResponseSuggestionRequest(BaseModel):
    inbound_email_body: str
    sender_info: Optional[LeadData] = None
    context: Optional[str] = None

class ResponseSuggestionResponse(BaseModel):
    suggested_response: str
    tone: str
    key_points: List[str]
    urgency: Literal["high", "medium", "low"]

class IntentDetectionRequest(BaseModel):
    content: str
    source: Literal["email", "chat", "linkedin"]

class IntentDetectionResponse(BaseModel):
    intent_level: Literal["high_intent", "medium_intent", "low_intent", "no_intent"]
    confidence: float
    signals: List[str]
    recommended_action: str

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/sdr/qualify-lead", response_model=LeadQualificationResponse)
async def qualify_lead(request: LeadQualificationRequest):
    """
    Qualifica um lead usando framework BANT/MEDDIC/CHAMP
    """
    try:
        lead = request.lead
        framework = request.qualification_framework

        # Prompt para Claude qualificar
        prompt = f"""Você é um SDR experiente. Qualifique este lead usando o framework {framework}:

LEAD:
- Nome: {lead.name}
- Email: {lead.email}
- Empresa: {lead.company_name or 'Desconhecida'}
- Tamanho: {lead.company_size or 'Desconhecido'} funcionários
- Indústria: {lead.industry or 'Desconhecida'}
- Cargo: {lead.job_title or 'Desconhecido'}

FRAMEWORK {framework}:
{"- Budget: Tem orçamento aprovado ou capacidade de investimento?" if framework == "BANT" else ""}
{"- Authority: É decision maker ou influencer?" if framework == "BANT" else ""}
{"- Need: Tem dor/necessidade clara que o produto resolve?" if framework == "BANT" else ""}
{"- Timing: Quando pretende implementar solução?" if framework == "BANT" else ""}

Com base nas informações disponíveis, retorne em JSON:
{{
  "is_qualified": true/false,
  "score": 0-100,
  "framework_scores": {{
    "budget": 0-100,
    "authority": 0-100,
    "need": 0-100,
    "timing": 0-100
  }},
  "recommendation": "texto explicando se é qualificado e por quê",
  "next_steps": ["ação 1", "ação 2", "ação 3"]
}}

IMPORTANTE: Base a qualificação apenas nos dados fornecidos. Se faltam informações, assuma scores conservadores."""

        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=800,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        response_text = message.content[0].text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        response_data = json.loads(response_text[json_start:json_end])

        return LeadQualificationResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao qualificar lead: {str(e)}")


@router.post("/sdr/score-lead", response_model=LeadScoringResponse)
async def score_lead(request: LeadScoringRequest):
    """
    Calcula score do lead baseado em fit e engagement
    """
    try:
        lead = request.lead
        engagement = request.engagement_data or {}

        # Cálculo de score (simplificado - em produção usar ML)
        scores = {}

        # Fit score (40% do total)
        fit_score = 0
        if lead.company_size:
            if 50 <= lead.company_size <= 500:
                fit_score += 25
            elif lead.company_size > 500:
                fit_score += 15

        if lead.industry and lead.industry.lower() in ["tech", "saas", "software"]:
            fit_score += 15

        scores["fit"] = min(fit_score, 40)

        # Engagement score (60% do total)
        engagement_score = 0
        email_opens = engagement.get("email_opens", 0)
        page_views = engagement.get("page_views", 0)
        demo_requested = engagement.get("demo_requested", False)

        engagement_score += min(email_opens * 5, 20)
        engagement_score += min(page_views * 3, 20)
        if demo_requested:
            engagement_score += 20

        scores["engagement"] = min(engagement_score, 60)

        # Score total
        total_score = scores["fit"] + scores["engagement"]

        # Determinar tier
        if total_score >= 70:
            tier = "hot"
            priority = 1
        elif total_score >= 40:
            tier = "warm"
            priority = 2
        else:
            tier = "cold"
            priority = 3

        return LeadScoringResponse(
            score=total_score,
            breakdown=scores,
            tier=tier,
            priority=priority
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular score: {str(e)}")


@router.post("/sdr/suggest-response", response_model=ResponseSuggestionResponse)
async def suggest_response(request: ResponseSuggestionRequest):
    """
    Sugere resposta para um email inbound
    """
    try:
        sender_name = request.sender_info.name if request.sender_info else "Cliente"

        prompt = f"""Você é um SDR experiente. Um lead enviou este email:

EMAIL RECEBIDO:
{request.inbound_email_body}

INFORMAÇÕES DO SENDER:
{f"Nome: {request.sender_info.name}" if request.sender_info else "Desconhecido"}
{f"Empresa: {request.sender_info.company_name}" if request.sender_info and request.sender_info.company_name else ""}

CONTEXTO ADICIONAL:
{request.context or "Nenhum"}

Sugira uma resposta que:
1. Seja personalizada e natural
2. Responda às perguntas/dores levantadas
3. Mova o lead para próxima etapa (demo/call)
4. Seja concisa (máx 100 palavras)

Retorne em JSON:
{{
  "suggested_response": "texto da resposta sugerida",
  "tone": "descrição do tom usado",
  "key_points": ["ponto 1", "ponto 2"],
  "urgency": "high/medium/low"
}}"""

        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=800,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        response_text = message.content[0].text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        response_data = json.loads(response_text[json_start:json_end])

        return ResponseSuggestionResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sugerir resposta: {str(e)}")


@router.post("/sdr/detect-intent", response_model=IntentDetectionResponse)
async def detect_intent(request: IntentDetectionRequest):
    """
    Detecta nível de intenção de compra no conteúdo
    """
    try:
        # Palavras-chave de alta intenção
        high_intent_signals = ["preço", "custo", "demo", "trial", "implementar", "contratar", "quando", "prazo"]
        medium_intent_signals = ["interessado", "gostaria", "conhecer", "entender", "saber mais"]

        content_lower = request.content.lower()

        # Detectar sinais
        signals = []
        high_count = sum(1 for word in high_intent_signals if word in content_lower)
        medium_count = sum(1 for word in medium_intent_signals if word in content_lower)

        if high_count > 0:
            signals.append(f"Mencionou {high_count} termo(s) de alta intenção")
        if medium_count > 0:
            signals.append(f"Mencionou {medium_count} termo(s) de interesse")

        # Determinar intent level
        if high_count >= 2:
            intent_level = "high_intent"
            confidence = 0.85
            action = "Agendar demo/call imediatamente"
        elif high_count == 1 or medium_count >= 2:
            intent_level = "medium_intent"
            confidence = 0.65
            action = "Enviar material relevante e propor conversa"
        elif medium_count == 1:
            intent_level = "low_intent"
            confidence = 0.45
            action = "Nutrir com conteúdo educativo"
        else:
            intent_level = "no_intent"
            confidence = 0.25
            action = "Continuar nurturing passivo"

        return IntentDetectionResponse(
            intent_level=intent_level,
            confidence=confidence,
            signals=signals if signals else ["Nenhum sinal claro detectado"],
            recommended_action=action
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao detectar intenção: {str(e)}")
