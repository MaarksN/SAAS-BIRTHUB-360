from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

# --- SDR Agent ---
class EmailGenerationRequest(BaseModel):
    lead_name: str
    company_name: str
    industry: str
    pain_points: List[str]
    value_proposition: str
    context: Optional[str] = None
    language: Literal['pt-BR', 'en-US'] = 'pt-BR'

class EmailGenerationResponse(BaseModel):
    subject: str
    body_html: str
    sentiment_analysis: str
    generated_at: str

# --- ICP Analysis ---
class ICPClassificationRequest(BaseModel):
    company_name: str
    about_us: str
    headline: Optional[str] = None

class ICPClassificationResponse(BaseModel):
    industry: str
    sector: str
    niche: str
    confidence: float
    reasoning: str

# --- BDR Agent ---
class AgentRunRequest(BaseModel):
    goal: str
    max_steps: int = 10
    session_id: Optional[str] = None

class AgentStep(BaseModel):
    step: int
    thought: str
    action: str
    action_input: str
    observation: str

class AgentResponse(BaseModel):
    final_answer: str
    steps: List[AgentStep]
    sources: List[str]
