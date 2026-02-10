from fastapi import APIRouter, HTTPException
from schemas.agent import EmailGenerationRequest, EmailGenerationResponse
from services.sdr_agent import SDRAgent

router = APIRouter()
sdr_agent = SDRAgent()

@router.post("/sdr/generate-email", response_model=EmailGenerationResponse)
async def generate_email(request: EmailGenerationRequest):
    try:
        response = await sdr_agent.generate_email(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
