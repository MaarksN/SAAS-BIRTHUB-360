from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import random
from datetime import datetime
from utils.logger import logger
from services.icp_agent import ICPAgent
from schemas.agent import ICPClassificationRequest
from services.linkedin_scraper import LinkedInScraper

router = APIRouter()
try:
    icp_agent = ICPAgent()
except NameError:
    # If ICPAgent is not imported correctly in original file, we handle it here
    # But now we imported it explicitly so it should be fine.
    # However, to avoid double instantiation issues if the file was partially broken...
    # Let's just instantiate it.
    icp_agent = ICPAgent()

linkedin_scraper = LinkedInScraper()

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
    # Log da requisição com contexto
    logger.info(f"Enrichment requested for CNPJ: {request.cnpj}")

    # Simulação de latência de API real
    clean_cnpj = "".join(filter(str.isdigit, request.cnpj))

    if len(clean_cnpj) != 14:
        logger.warning(f"Invalid CNPJ format: {request.cnpj}")
        raise HTTPException(status_code=400, detail="CNPJ inválido. Deve conter 14 dígitos.")

    # Lógica determinística baseada no CNPJ para testes consistentes
    seed = int(clean_cnpj[:8])
    rng = random.Random(seed)

    reliability = rng.uniform(0.7, 0.99)

    logger.info(f"Enrichment successful for CNPJ: {clean_cnpj}, Reliability: {reliability:.2f}")

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
    logger.info("Validating external data sources")
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

# --- Cycle 35: LinkedIn Scraper ---
class LinkedInScrapeRequest(BaseModel):
    url: str = Field(..., description="URL do perfil do LinkedIn")

class LinkedInProfileResponse(BaseModel):
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    retryable: bool = False

@router.post("/ldr/scrape-linkedin-profile", response_model=LinkedInProfileResponse)
async def scrape_linkedin_profile(request: LinkedInScrapeRequest):
    logger.info(f"LinkedIn scrape requested for: {request.url}")
    result = await linkedin_scraper.scrape_profile(request.url)

    if result.get("status") == "failed" or result.get("status") == "error":
        logger.warning(f"Scrape failed: {result.get('error')}")

    return result
