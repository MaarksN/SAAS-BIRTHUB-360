from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class BaseResponse(BaseModel):
    """Response base para todas as APIs"""
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

class ErrorResponse(BaseResponse):
    """Response de erro padronizado"""
    success: bool = False
    error: str
    error_code: str
    details: Optional[dict] = None
