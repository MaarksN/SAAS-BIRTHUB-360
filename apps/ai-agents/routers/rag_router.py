from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from rag import RAGService
from utils.logger import logger

router = APIRouter()

# Dependency
async def get_rag_service():
    service = RAGService()
    try:
        yield service
    finally:
        service.close()

class RAGSearchRequest(BaseModel):
    query: str = Field(..., description="The search query")
    limit: int = Field(5, ge=1, le=20, description="Number of results to return")
    advanced: bool = Field(True, description="Whether to use advanced RAG (expansion + reranking)")

class RAGResult(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    rank: Optional[int] = None
    rerank_score: Optional[float] = None

class RAGSearchResponse(BaseModel):
    results: List[RAGResult]
    total_results: int

@router.post("/rag/search", response_model=RAGSearchResponse)
async def search(request: RAGSearchRequest, service: RAGService = Depends(get_rag_service)):
    """
    Perform a RAG search.
    If advanced=True, uses Query Expansion -> Hybrid Search -> Reranking.
    """
    logger.info(f"RAG Search requested: {request.query} (Advanced: {request.advanced})")

    try:
        if request.advanced:
            results = await service.search_advanced(request.query, limit=request.limit)
        else:
            # Basic hybrid search (needs embedding generation first)
            embedding = await service.generate_embedding(request.query)
            if embedding:
                results = service.search_hybrid(request.query, embedding, limit=request.limit)
            else:
                results = service.search_fulltext(request.query, limit=request.limit)

        return RAGSearchResponse(
            results=results,
            total_results=len(results)
        )
    except Exception as e:
        logger.error(f"Error in RAG search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
