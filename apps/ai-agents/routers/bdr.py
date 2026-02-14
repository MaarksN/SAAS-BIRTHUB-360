from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import os
from anthropic import AsyncAnthropic
from utils.prompts import COLD_EMAIL_PROMPT

router = APIRouter()

# Inicializar cliente Anthropic
anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

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

        prompt = COLD_EMAIL_PROMPT.format(
            lead_name=request.lead_name,
            company_name=request.company_name,
            industry=request.industry,
            pain_points_text=pain_points_text,
            value_proposition=request.value_proposition,
            tone_instruction=tone_instructions[request.tone]
        )

        # Chamar Claude (Async)
        message = await anthropic_client.messages.create(
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
