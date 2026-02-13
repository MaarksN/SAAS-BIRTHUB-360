# 🔥 IMPLEMENTAÇÃO CRÍTICA - PARTE 2
## Ciclos 18-20 e 21 - Routers AI & Tokenizer

---

## 📦 INSTALAÇÃO DE DEPENDÊNCIAS

```bash
# Python (AI Agents)
cd apps/ai-agents
pip install --break-system-packages anthropic openai pydantic python-dotenv tiktoken

# Node (Core)
cd ../../
npm install --workspace=libs/core tiktoken
```

---

## 🤖 CICLOS 18-20: IMPLEMENTAR ROUTERS AI (BDR, SDR, AE)

### 1️⃣ Schemas Pydantic Compartilhados

**Arquivo:** `apps/ai-agents/schemas/common.py`

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class BaseResponse(BaseModel):
    """Response base para todas as APIs"""
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

class ErrorResponse(BaseResponse):
    """Response de erro padronizado"""
    success: bool = False
    error: str
    error_code: str
    details: Optional[dict] = None
```

---

### 2️⃣ BDR ROUTER - Outbound Hunter

**Arquivo:** `apps/ai-agents/routers/bdr.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import os
from anthropic import Anthropic

router = APIRouter()

# Inicializar cliente Anthropic
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ============================================================================
# SCHEMAS
# ============================================================================

class ColdEmailRequest(BaseModel):
    lead_name: str = Field(..., description="Nome do lead")
    company_name: str = Field(..., description="Nome da empresa")
    industry: str = Field(..., description="Indústria/setor")
    pain_points: List[str] = Field(default_factory=list, description="Dores identificadas")
    value_proposition: str = Field(..., description="Proposta de valor")
    tone: Literal["professional", "casual", "friendly"] = "professional"

class ColdEmailResponse(BaseModel):
    subject: str
    body: str
    personalization_score: float = Field(ge=0, le=100)
    reasoning: str

class BuyingCommitteeRequest(BaseModel):
    company_name: str
    industry: str
    company_size: int = Field(..., gt=0)
    target_role: Optional[str] = None

class Persona(BaseModel):
    role: str
    seniority: str
    influence_level: Literal["high", "medium", "low"]
    key_concerns: List[str]
    messaging_tips: str

class BuyingCommitteeResponse(BaseModel):
    personas: List[Persona]
    total_count: int

class SequenceRequest(BaseModel):
    goal: Literal["book_demo", "qualify_lead", "nurture"]
    target_persona: str
    touchpoints_count: int = Field(default=7, ge=3, le=15)

class SequenceStep(BaseModel):
    day: int
    channel: Literal["email", "linkedin", "call", "whatsapp"]
    template: str
    objective: str

class SequenceResponse(BaseModel):
    sequence: List[SequenceStep]
    total_duration_days: int
    success_probability: float

class ICPRequest(BaseModel):
    current_customers: List[dict]
    closed_lost_reasons: Optional[List[str]] = None

class ICPProfile(BaseModel):
    industries: List[str]
    company_size_range: dict
    key_attributes: List[str]
    anti_patterns: List[str]

class ICPResponse(BaseModel):
    icp_profile: ICPProfile
    lookalike_score_threshold: float
    confidence: float

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/bdr/generate-cold-email", response_model=ColdEmailResponse)
async def generate_cold_email(request: ColdEmailRequest):
    """
    Gera um cold email personalizado usando Claude
    """
    try:
        # Construir prompt contextual
        pain_points_text = "\n".join([f"- {p}" for p in request.pain_points]) if request.pain_points else "Não especificadas"
        
        tone_instructions = {
            "professional": "Tom profissional e formal, adequado para executivos C-Level",
            "casual": "Tom casual mas respeitoso, adequado para startups e tech",
            "friendly": "Tom amigável e conversacional, como se fosse de um colega"
        }

        prompt = f"""Você é um especialista em cold email para vendas B2B.

CONTEXTO:
- Lead: {request.lead_name}
- Empresa: {request.company_name}
- Indústria: {request.industry}
- Dores identificadas:
{pain_points_text}
- Proposta de valor: {request.value_proposition}
- Tom desejado: {tone_instructions[request.tone]}

TAREFA:
Crie um cold email que:
1. Tenha subject line curiosa (máximo 50 caracteres)
2. Abra com algo relevante para o lead (NOT genérico)
3. Mencione UMA dor específica
4. Apresente a solução de forma concisa
5. Tenha CTA claro e de baixo compromisso
6. Seja curto (máximo 150 palavras no body)

IMPORTANTE:
- NÃO use clichês ("espero que este email te encontre bem", "gostaria de apresentar", etc)
- NÃO faça vendas agressivas
- Foque em VALOR, não em features
- Use parágrafos curtos (2-3 linhas máximo)

Retorne em JSON:
{{
  "subject": "subject line aqui",
  "body": "corpo do email aqui (HTML simples, use <br> para quebras)",
  "personalization_score": número de 0-100,
  "reasoning": "breve explicação de 1 linha da estratégia usada"
}}"""

        # Chamar Claude
        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.7,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Extrair resposta
        response_text = message.content[0].text
        
        # Parse JSON (Claude geralmente retorna JSON bem formatado)
        import json
        # Tentar extrair JSON do texto
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            response_data = json.loads(response_text[json_start:json_end])
        else:
            # Fallback se não conseguir parsear
            response_data = {
                "subject": "Assunto não gerado",
                "body": response_text,
                "personalization_score": 50,
                "reasoning": "Erro no parsing da resposta"
            }

        return ColdEmailResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar email: {str(e)}")


@router.post("/bdr/analyze-buying-committee", response_model=BuyingCommitteeResponse)
async def analyze_buying_committee(request: BuyingCommitteeRequest):
    """
    Analisa e retorna os membros típicos do buying committee para a empresa
    """
    try:
        # Template de buying committee baseado em indústria e tamanho
        # Simplificado - em produção, usar LLM para análise mais sofisticada
        
        personas_map = {
            "tech": [
                Persona(
                    role="CTO / VP Engineering",
                    seniority="C-Level",
                    influence_level="high",
                    key_concerns=["Escalabilidade", "Segurança", "Time to market"],
                    messaging_tips="Foque em arquitetura, performance e ROI técnico"
                ),
                Persona(
                    role="Engineering Manager",
                    seniority="Manager",
                    influence_level="medium",
                    key_concerns=["Developer experience", "Produtividade do time", "Manutenibilidade"],
                    messaging_tips="Mostre como facilita o dia a dia do time"
                ),
                Persona(
                    role="DevOps Lead",
                    seniority="Senior",
                    influence_level="medium",
                    key_concerns=["Confiabilidade", "Observabilidade", "Custos de infra"],
                    messaging_tips="Demonstre estabilidade e eficiência operacional"
                )
            ],
            "sales": [
                Persona(
                    role="VP Sales / CRO",
                    seniority="C-Level",
                    influence_level="high",
                    key_concerns=["Revenue growth", "Pipeline visibility", "Rep productivity"],
                    messaging_tips="Fale sobre números: conversão, velocidade de fechamento, ARR"
                ),
                Persona(
                    role="Sales Operations",
                    seniority="Manager",
                    influence_level="high",
                    key_concerns=["Data accuracy", "Process efficiency", "Tool integration"],
                    messaging_tips="Mostre facilidade de implementação e dados confiáveis"
                ),
                Persona(
                    role="SDR Manager",
                    seniority="Manager",
                    influence_level="medium",
                    key_concerns=["Lead quality", "Activity tracking", "Team enablement"],
                    messaging_tips="Demonstre impacto no volume e qualidade de pipeline"
                )
            ]
        }

        # Determinar categoria (simplificado)
        industry_lower = request.industry.lower()
        if any(word in industry_lower for word in ["tech", "software", "saas", "tecnologia"]):
            personas = personas_map.get("tech", personas_map["sales"])
        else:
            personas = personas_map.get("sales", personas_map["tech"])

        # Filtrar por target_role se especificado
        if request.target_role:
            personas = [p for p in personas if request.target_role.lower() in p.role.lower()]

        return BuyingCommitteeResponse(
            personas=personas,
            total_count=len(personas)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar buying committee: {str(e)}")


@router.post("/bdr/suggest-sequence", response_model=SequenceResponse)
async def suggest_sequence(request: SequenceRequest):
    """
    Sugere uma sequência de outbound multi-touch
    """
    try:
        # Templates de sequência baseados no objetivo
        sequences_map = {
            "book_demo": [
                SequenceStep(day=0, channel="email", template="Email inicial introdutório", objective="Despertar curiosidade"),
                SequenceStep(day=2, channel="linkedin", template="Conexão + mensagem curta", objective="Abrir outro canal"),
                SequenceStep(day=4, channel="email", template="Email de valor (case study)", objective="Provar resultados"),
                SequenceStep(day=7, channel="call", template="Ligação de follow-up", objective="Conversar ao vivo"),
                SequenceStep(day=10, channel="email", template="Último toque (scarcity/urgency)", objective="Criar senso de urgência"),
                SequenceStep(day=14, channel="linkedin", template="Mensagem de breakup", objective="Dar última chance"),
                SequenceStep(day=21, channel="email", template="Breakup email final", objective="Encerrar sequência"),
            ],
            "qualify_lead": [
                SequenceStep(day=0, channel="email", template="Email perguntando sobre fit", objective="Iniciar qualificação"),
                SequenceStep(day=3, channel="email", template="Compartilhar conteúdo relevante", objective="Educar e nutrir"),
                SequenceStep(day=7, channel="call", template="Ligação de descoberta", objective="Entender dores profundamente"),
                SequenceStep(day=14, channel="email", template="Recap da call + próximos passos", objective="Avançar no funil"),
            ],
            "nurture": [
                SequenceStep(day=0, channel="email", template="Conteúdo educativo (blog/ebook)", objective="Agregar valor"),
                SequenceStep(day=7, channel="linkedin", template="Comentar post do lead", objective="Construir relacionamento"),
                SequenceStep(day=14, channel="email", template="Case study relevante", objective="Mostrar prova social"),
                SequenceStep(day=30, channel="email", template="Check-in soft", objective="Manter top of mind"),
                SequenceStep(day=60, channel="email", template="Novidade/feature relevante", objective="Reengajar"),
            ]
        }

        sequence = sequences_map.get(request.goal, sequences_map["book_demo"])
        
        # Ajustar quantidade de touchpoints
        if len(sequence) > request.touchpoints_count:
            sequence = sequence[:request.touchpoints_count]
        
        total_days = max([step.day for step in sequence]) if sequence else 0
        
        # Calcular probabilidade de sucesso (mockado - em produção usar dados reais)
        success_probability = 0.15 if request.goal == "book_demo" else 0.25

        return SequenceResponse(
            sequence=sequence,
            total_duration_days=total_days,
            success_probability=success_probability
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sugerir sequência: {str(e)}")


@router.post("/bdr/analyze-icp", response_model=ICPResponse)
async def analyze_icp(request: ICPRequest):
    """
    Analisa clientes atuais e retorna o Ideal Customer Profile
    """
    try:
        # Análise simplificada - em produção usar clustering/ML
        
        # Extrair indústrias
        industries = list(set([c.get("industry", "Unknown") for c in request.current_customers]))
        
        # Calcular range de tamanho de empresa
        sizes = [c.get("size", 0) for c in request.current_customers if c.get("size")]
        if sizes:
            min_size = min(sizes)
            max_size = max(sizes)
        else:
            min_size, max_size = 10, 500
        
        # Atributos chave (mockado)
        key_attributes = [
            "Alto crescimento (>30% YoY)",
            "Equipe de vendas estruturada (>5 pessoas)",
            "Usa ferramentas modernas (CRM, Marketing Automation)",
            "Orçamento aprovado para otimização de processos"
        ]
        
        # Anti-patterns baseado em closed-lost
        anti_patterns = []
        if request.closed_lost_reasons:
            if "preço" in str(request.closed_lost_reasons).lower():
                anti_patterns.append("Empresas em early stage sem budget definido")
            if "complexo" in str(request.closed_lost_reasons).lower():
                anti_patterns.append("Empresas que preferem processos manuais simples")
        
        if not anti_patterns:
            anti_patterns = ["Empresas sem processos de vendas estruturados"]

        icp_profile = ICPProfile(
            industries=industries,
            company_size_range={"min": min_size, "max": max_size},
            key_attributes=key_attributes,
            anti_patterns=anti_patterns
        )

        return ICPResponse(
            icp_profile=icp_profile,
            lookalike_score_threshold=0.75,
            confidence=0.85
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar ICP: {str(e)}")
```

---

### 3️⃣ SDR ROUTER - Inbound Response

**Arquivo:** `apps/ai-agents/routers/sdr.py`

```python
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
```

---

### 4️⃣ AE ROUTER - Account Executive / Closer

**Arquivo:** `apps/ai-agents/routers/ae.py`

```python
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
```

---

Continua no próximo arquivo com CICLO 21 e 31...
