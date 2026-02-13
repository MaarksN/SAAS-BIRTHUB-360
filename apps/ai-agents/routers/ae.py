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

class CallAnalysisRequest(BaseModel):
    transcript: str
    call_duration_minutes: int
    call_type: Literal["discovery", "demo", "closing", "negotiation"]

class CallAnalysisResponse(BaseModel):
    sentiment: Literal["positive", "neutral", "negative"]
    talk_listen_ratio: float
    key_topics: List[str]
    objections_raised: List[str]
    next_steps_mentioned: List[str]
    coaching_tips: List[str]
    summary: str

class ProposalRequest(BaseModel):
    company_name: str
    deal_value: float
    deal_stage: str
    pain_points: List[str]
    solution_features: List[str]

class ProposalResponse(BaseModel):
    proposal_html: str
    executive_summary: str
    pricing_breakdown: Dict
    implementation_timeline: str

class NextActionRequest(BaseModel):
    deal_id: str
    deal_stage: str
    last_interaction_days_ago: int
    engagement_level: Literal["high", "medium", "low"]

class NextActionResponse(BaseModel):
    recommended_action: str
    urgency: Literal["high", "medium", "low"]
    suggested_message: str
    rationale: str

class RiskScoreRequest(BaseModel):
    deal_id: str
    deal_stage: str
    days_in_stage: int
    last_contact_days_ago: int
    competitive_pressure: bool
    budget_confirmed: bool

class RiskScoreResponse(BaseModel):
    risk_level: Literal["low", "medium", "high"]
    risk_score: float = Field(ge=0, le=100)
    risk_factors: List[str]
    mitigation_steps: List[str]

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/ae")
async def ae_root():
    return {"message": "AE Router"}

@router.post("/ae/analyze-call", response_model=CallAnalysisResponse)
async def analyze_call(request: CallAnalysisRequest):
    """
    Analisa transcrição de call de vendas
    """
    try:
        prompt = f"""Analise esta transcrição de uma call de vendas:

TIPO: {request.call_type}
DURAÇÃO: {request.call_duration_minutes} minutos

TRANSCRIÇÃO:
{request.transcript[:3000]}  # Limitar para evitar exceder tokens

Retorne análise em JSON:
{{
  "sentiment": "positive/neutral/negative",
  "talk_listen_ratio": 0.0-1.0 (quanto o seller falou vs ouviu),
  "key_topics": ["tópico 1", "tópico 2", ...],
  "objections_raised": ["objeção 1", "objeção 2", ...],
  "next_steps_mentioned": ["próximo passo 1", ...],
  "coaching_tips": ["dica 1 para melhorar performance", ...],
  "summary": "resumo executivo da call em 2-3 frases"
}}"""

        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1200,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        response_text = message.content[0].text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        response_data = json.loads(response_text[json_start:json_end])

        return CallAnalysisResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar call: {str(e)}")


@router.post("/ae/generate-proposal", response_model=ProposalResponse)
async def generate_proposal(request: ProposalRequest):
    """
    Gera uma proposta comercial
    """
    try:
        prompt = f"""Crie uma proposta comercial para:

EMPRESA: {request.company_name}
VALOR DO DEAL: ${request.deal_value:,.2f}
STAGE: {request.deal_stage}

DORES IDENTIFICADAS:
{chr(10).join([f"- {p}" for p in request.pain_points])}

FEATURES DA SOLUÇÃO:
{chr(10).join([f"- {f}" for f in request.solution_features])}

Retorne em JSON:
{{
  "proposal_html": "HTML completo da proposta (use tags HTML semânticas)",
  "executive_summary": "resumo executivo de 1 parágrafo",
  "pricing_breakdown": {{"monthly": X, "setup": Y, "annual_discount": Z}},
  "implementation_timeline": "X weeks para implementação completa"
}}

A proposta deve:
1. Ter seção executiva clara
2. Conectar features às dores
3. Incluir case study relevante
4. Mostrar ROI estimado
5. Ter CTA forte para próximo passo"""

        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            temperature=0.6,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        response_text = message.content[0].text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        response_data = json.loads(response_text[json_start:json_end])

        return ProposalResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar proposta: {str(e)}")


@router.post("/ae/next-best-action", response_model=NextActionResponse)
async def next_best_action(request: NextActionRequest):
    """
    Sugere próxima melhor ação para um deal
    """
    try:
        # Lógica baseada em regras (em produção, usar ML)

        urgency = "low"
        action = ""
        message = ""
        rationale = ""

        if request.last_interaction_days_ago > 7:
            urgency = "high"
            action = "Reengajar imediatamente"
            message = f"Faz tempo que não falamos! Como andam as coisas aí?"
            rationale = "Deal esfriando - sem contato há >7 dias"

        elif request.deal_stage == "negotiation" and request.engagement_level == "high":
            urgency = "high"
            action = "Enviar proposta final com desconto limitado"
            message = "Preparei uma proposta especial válida até sexta. Podemos revisar juntos?"
            rationale = "Deal quente em negociação - hora de fechar"

        elif request.deal_stage == "demo" and request.engagement_level == "medium":
            urgency = "medium"
            action = "Follow-up pós-demo com próximos passos"
            message = "Que tal marcarmos uma call rápida para discutir próximos passos?"
            rationale = "Manter momentum após demo"

        else:
            urgency = "low"
            action = "Nutrir com conteúdo relevante"
            message = "Vi este case study e pensei em você. Faz sentido?"
            rationale = "Deal em progresso normal"

        return NextActionResponse(
            recommended_action=action,
            urgency=urgency,
            suggested_message=message,
            rationale=rationale
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sugerir ação: {str(e)}")


@router.post("/ae/risk-score", response_model=RiskScoreResponse)
async def risk_score(request: RiskScoreRequest):
    """
    Calcula risco de perder o deal
    """
    try:
        risk_factors = []
        risk_score = 0

        # Fatores de risco
        if request.days_in_stage > 30:
            risk_factors.append("Deal parado há mais de 30 dias no stage")
            risk_score += 30

        if request.last_contact_days_ago > 14:
            risk_factors.append("Sem contato há mais de 2 semanas")
            risk_score += 25

        if request.competitive_pressure:
            risk_factors.append("Competidor ativo na conta")
            risk_score += 20

        if not request.budget_confirmed:
            risk_factors.append("Budget não confirmado")
            risk_score += 15

        if request.deal_stage in ["negotiation", "closing"] and request.days_in_stage > 14:
            risk_factors.append("Deal travado em stage final")
            risk_score += 10

        # Determinar nível
        if risk_score >= 60:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Sugerir mitigação
        mitigation_steps = []
        if "parado" in str(risk_factors):
            mitigation_steps.append("Fazer executive call para reativar interesse")
        if "contato" in str(risk_factors):
            mitigation_steps.append("Ligar HOJE para reengajar")
        if "competidor" in str(risk_factors):
            mitigation_steps.append("Preparar battle card e reforçar diferenciais")
        if "budget" in str(risk_factors):
            mitigation_steps.append("Agendar call com finance/procurement")

        if not mitigation_steps:
            mitigation_steps = ["Continuar acompanhando de perto"]

        return RiskScoreResponse(
            risk_level=risk_level,
            risk_score=min(risk_score, 100),
            risk_factors=risk_factors if risk_factors else ["Nenhum fator de risco crítico"],
            mitigation_steps=mitigation_steps
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular risco: {str(e)}")
