from fastapi import APIRouter

router = APIRouter()

@router.get("/bdr")
async def bdr_root():
    return {"message": "BDR Router"}
