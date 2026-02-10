from fastapi import APIRouter

router = APIRouter()

@router.get("/ae")
async def ae_root():
    return {"message": "AE Router"}
