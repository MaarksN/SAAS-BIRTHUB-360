from fastapi import APIRouter, HTTPException
from schemas.bdr_schemas import (
    ColdEmailRequest, ColdEmailResponse,
    BuyingCommitteeRequest, BuyingCommitteeResponse,
    SequenceRequest, SequenceResponse,
    ICPRequest, ICPResponse
)
from services.llm_service import LLMService
import json
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
llm_service = LLMService()

def parse_json_response(response_text: str):
    try:
        # Remove markdown code blocks if present
        clean_text = re.sub(r"```json\s*", "", response_text)
        clean_text = re.sub(r"```", "", clean_text)
        return json.loads(clean_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON: {response_text}")
        raise HTTPException(status_code=500, detail="Failed to parse LLM response")

@router.post("/bdr/generate-cold-email", response_model=ColdEmailResponse)
async def generate_cold_email(request: ColdEmailRequest):
    prompt = f"""
    Generate a cold email for a lead with the following details:
    Lead Name: {request.lead_name}
    Company: {request.company_name}
    Industry: {request.industry}
    Pain Points: {', '.join(request.pain_points)}
    Value Proposition: {request.value_proposition}
    Tone: {request.tone}

    Output JSON format:
    {{
        "subject": "Email Subject",
        "body": "Email Body (HTML)",
        "personalization_score": 85.5
    }}
    """
    response_text = await llm_service.generate(prompt)
    data = parse_json_response(response_text)
    return ColdEmailResponse(**data)

@router.post("/bdr/analyze-buying-committee", response_model=BuyingCommitteeResponse)
async def analyze_buying_committee(request: BuyingCommitteeRequest):
    prompt = f"""
    Analyze the buying committee for a company in the {request.industry} industry with {request.company_size} employees.
    Target Role: {request.target_role or 'Decision Maker'}

    Output JSON format:
    {{
        "personas": [
            {{
                "role": "Role Name",
                "seniority": "C-Level/VP/Manager",
                "influence_level": "high/medium/low",
                "key_concerns": ["Concern 1", "Concern 2"],
                "messaging_tips": "Tip for messaging"
            }}
        ]
    }}
    """
    response_text = await llm_service.generate(prompt)
    data = parse_json_response(response_text)
    return BuyingCommitteeResponse(**data)

@router.post("/bdr/suggest-sequence", response_model=SequenceResponse)
async def suggest_sequence(request: SequenceRequest):
    prompt = f"""
    Suggest a sales sequence with {request.touchpoints_count} touchpoints.
    Goal: {request.goal}
    Target Persona: {request.target_persona}

    Output JSON format:
    {{
        "sequence": [
            {{
                "day": 1,
                "channel": "email/linkedin/call",
                "template": "Template content...",
                "objective": "Objective of this step"
            }}
        ]
    }}
    """
    response_text = await llm_service.generate(prompt)
    data = parse_json_response(response_text)
    return SequenceResponse(**data)

@router.post("/bdr/analyze-icp", response_model=ICPResponse)
async def analyze_icp(request: ICPRequest):
    # Convert Pydantic models to dicts for JSON serialization
    customers_data = [
        c.model_dump() if hasattr(c, 'model_dump') else c.dict()
        for c in request.current_customers
    ]
    customers_str = json.dumps(customers_data, indent=2)

    prompt = f"""
    Analyze the Ideal Customer Profile (ICP) based on these successful customers:
    {customers_str}

    Closed Lost Reasons: {', '.join(request.closed_lost_reasons)}

    Output JSON format:
    {{
        "icp_profile": {{
            "industries": ["Industry 1", "Industry 2"],
            "company_size_range": {{"min": 10, "max": 100}},
            "key_attributes": ["Attribute 1", "Attribute 2"],
            "anti_patterns": ["Pattern to avoid 1"]
        }},
        "lookalike_score_threshold": 0.75
    }}
    """
    response_text = await llm_service.generate(prompt)
    data = parse_json_response(response_text)
    return ICPResponse(**data)
