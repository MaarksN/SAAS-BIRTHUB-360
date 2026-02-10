from fastapi import APIRouter

router = APIRouter()

@router.get("/sdr")
async def sdr_root():
    return {"message": "SDR Router"}
