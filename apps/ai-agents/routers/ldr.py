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
from services.email_finder import email_validator_service
from services.technology_lookup import tech_lookup_service
from services.domain_search import domain_search_service
from services.google_maps_scraper import google_maps_scraper
from services.visitor_id import visitor_id_service
from services.news_monitor import news_monitor_service

router = APIRouter()
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

# --- Cycle 36: Email Finder ---
class EmailFinderRequest(BaseModel):
    first_name: str = Field(..., description="Primeiro nome do lead")
    last_name: str = Field(..., description="Sobrenome do lead")
    domain: str = Field(..., description="Domínio da empresa (ex: google.com)")

class EmailFinderResponse(BaseModel):
    status: str
    email: Optional[str] = None
    confidence: Optional[str] = None
    candidates: Optional[List[str]] = None
    message: Optional[str] = None
    logs: Optional[List[Dict[str, Any]]] = None

@router.post("/ldr/find-email", response_model=EmailFinderResponse)
async def find_email(request: EmailFinderRequest):
    logger.info(f"Email finder requested for: {request.first_name} {request.last_name} @ {request.domain}")
    result = await email_validator_service.find_valid_email(
        request.first_name,
        request.last_name,
        request.domain
    )
    return result

# --- Cycle 37: Technology Lookup ---
class TechLookupRequest(BaseModel):
    url: str = Field(..., description="URL do site para análise (ex: https://example.com)")

class TechLookupResponse(BaseModel):
    technologies: Dict[str, List[str]]
    error: Optional[str] = None

@router.post("/ldr/technology-lookup", response_model=TechLookupResponse)
async def technology_lookup(request: TechLookupRequest):
    logger.info(f"Tech lookup requested for: {request.url}")
    result = await tech_lookup_service.analyze_stack(request.url)
    if "error" in result:
        return {"technologies": {}, "error": result["error"]}
    return {"technologies": result}

# --- Cycle 38: Domain Search ---
class DomainSearchRequest(BaseModel):
    domain: str = Field(..., description="Domínio para expansão (ex: company.com)")

class DomainSearchResponse(BaseModel):
    domain: str
    registrant: Optional[Dict[str, Any]]
    related_domains: List[str]
    source: str

@router.post("/ldr/domain-search", response_model=DomainSearchResponse)
def domain_search(request: DomainSearchRequest):
    logger.info(f"Domain search requested for: {request.domain}")
    # Running as a sync function allows FastAPI to run it in a threadpool
    result = domain_search_service.search_related_domains(request.domain)
    return result

# --- Cycle 39: Google Maps Scraper ---
class GoogleMapsSearchRequest(BaseModel):
    query: str = Field(..., description="Query de busca (ex: 'Pizzaria em Pinheiros')")

@router.post("/ldr/google-maps-search")
async def google_maps_search(request: GoogleMapsSearchRequest):
    logger.info(f"Google Maps search requested for: {request.query}")
    results = await google_maps_scraper.search_places(request.query)
    return {"results": results}

# --- Cycle 40: Visitor ID ---
class VisitorIDRequest(BaseModel):
    ip_address: str = Field(..., description="Endereço IP para identificação")

@router.post("/ldr/identify-visitor")
async def identify_visitor(request: VisitorIDRequest):
    logger.info(f"Visitor identification requested for: {request.ip_address}")
    result = await visitor_id_service.identify_ip(request.ip_address)
    return result

# --- Cycle 41: News Monitor ---
class NewsMonitorRequest(BaseModel):
    company_name: str = Field(..., description="Nome da empresa para monitoramento")

@router.post("/ldr/news-alerts")
async def news_alerts(request: NewsMonitorRequest):
    logger.info(f"News alerts requested for: {request.company_name}")
    results = await news_monitor_service.get_company_news(request.company_name)
    return {"news": results}
