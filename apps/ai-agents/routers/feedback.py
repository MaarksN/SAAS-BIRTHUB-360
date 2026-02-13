from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()

class FeedbackRequest(BaseModel):
    agent_run_id: str
    rating: int = Field(..., ge=1, le=5)
    correction: Optional[str] = None
    original_output: Optional[str] = None
    improved_output: Optional[str] = None

@router.post("/feedback/submit")
async def submit_feedback(request: FeedbackRequest):
    # In production, save to Postgres via Prisma or raw SQL
    # For now, just log it or send to analytics (Cycle 30)

    print(f"Received Feedback for run {request.agent_run_id}: Rating {request.rating}")
    if request.correction:
        print(f"Correction: {request.correction}")

    # TODO: Push to 'rlhf-dataset' queue for fine-tuning

    return {"status": "recorded", "id": "fb_123"}
