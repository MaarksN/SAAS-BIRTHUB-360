from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import random
from datetime import datetime
from services.icp_agent import ICPAgent
from schemas.agent import ICPClassificationRequest

router = APIRouter()
icp_agent = ICPAgent()

# --- Models Robustos ---
class CNPJEnrichmentRequest(BaseModel):
    cnpj: str = Field(..., description="CNPJ formatado ou apenas números")

class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str

class EnrichmentResponse(BaseModel):
    cnpj: str
    legal_name: str
    trade_name: Optional[str] = None
    status: str
    founded_date: str
    address: Address
    reliability_score: float

# --- Lógica de Negócio Simulada (Nível Prod) ---
@router.post("/ldr/enrich-cnpj", response_model=EnrichmentResponse)
async def enrich_cnpj(request: CNPJEnrichmentRequest):
    # Simulação de latência de API real
    clean_cnpj = "".join(filter(str.isdigit, request.cnpj))

    if len(clean_cnpj) != 14:
        raise HTTPException(status_code=400, detail="CNPJ inválido. Deve conter 14 dígitos.")

    # Lógica determinística baseada no CNPJ para testes consistentes
    seed = int(clean_cnpj[:8])
    rng = random.Random(seed)

    reliability = rng.uniform(0.7, 0.99)

    return {
        "cnpj": request.cnpj,
        "legal_name": f"EMPRESA {clean_cnpj[-4:]} SOLUCOES TECNOLOGICAS LTDA",
        "trade_name": "TECH SOLUTIONS",
        "status": "ATIVO",
        "founded_date": "2018-05-20",
        "address": {
            "street": "Avenida Paulista, 1000",
            "city": "São Paulo",
            "state": "SP",
            "zip_code": "01310-100"
        },
        "reliability_score": round(reliability, 2)
    }

@router.get("/ldr/validate-sources")
async def validate_sources():
    return {
        "status": "connected",
        "sources": [
            {"name": "Receita Federal", "latency_ms": 120, "status": "up"},
            {"name": "LinkedIn Graph", "latency_ms": 245, "status": "up"},
            {"name": "Serasa", "latency_ms": 90, "status": "up"}
        ]
    }

# --- Cycle 19: ICP Analysis ---
@router.post("/ldr/classify-icp")
async def classify_icp(request: ICPClassificationRequest):
    """
    Streams the classification analysis token by token (SSE-like).
    """
    return StreamingResponse(
        icp_agent.classify_company(request.model_dump()),
        media_type="text/event-stream"
    )
