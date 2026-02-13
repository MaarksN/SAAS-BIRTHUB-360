from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict

class ColdEmailRequest(BaseModel):
    lead_name: str
    company_name: str
    industry: str
    pain_points: List[str] = Field(default_factory=list)
    value_proposition: str
    tone: Literal["professional", "casual", "friendly"] = "professional"

class ColdEmailResponse(BaseModel):
    subject: str
    body: str  # HTML
    personalization_score: float = Field(ge=0, le=100)

class BuyingCommitteeRequest(BaseModel):
    company_name: str
    industry: str
    company_size: int
    target_role: Optional[str] = None

class BuyingCommitteePersona(BaseModel):
    role: str
    seniority: str
    influence_level: Literal["high", "medium", "low"]
    key_concerns: List[str]
    messaging_tips: str

class BuyingCommitteeResponse(BaseModel):
    personas: List[BuyingCommitteePersona]

class SequenceRequest(BaseModel):
    goal: Literal["book_demo", "qualify_lead", "nurture"]
    target_persona: str
    touchpoints_count: int = Field(ge=3, le=15)

class SequenceStep(BaseModel):
    day: int
    channel: Literal["email", "linkedin", "call"]
    template: str
    objective: str

class SequenceResponse(BaseModel):
    sequence: List[SequenceStep]

class CustomerProfile(BaseModel):
    company_name: str
    industry: str
    size: int
    revenue: float

class ICPRequest(BaseModel):
    current_customers: List[CustomerProfile]
    closed_lost_reasons: List[str] = Field(default_factory=list)

class ICPProfile(BaseModel):
    industries: List[str]
    company_size_range: Dict[str, int] # {"min": int, "max": int}
    key_attributes: List[str]
    anti_patterns: List[str]

class ICPResponse(BaseModel):
    icp_profile: ICPProfile
    lookalike_score_threshold: float
