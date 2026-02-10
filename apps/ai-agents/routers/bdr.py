from fastapi import APIRouter, HTTPException
from schemas.agent import AgentRunRequest, AgentResponse
from services.bdr_agent import BDRAgent

router = APIRouter()
bdr_agent = BDRAgent()

@router.post("/bdr/agent-run", response_model=AgentResponse)
async def run_agent(request: AgentRunRequest):
    try:
        response = await bdr_agent.run(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
