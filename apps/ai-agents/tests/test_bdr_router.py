import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from unittest.mock import AsyncMock, patch
import json

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_generate_cold_email(async_client):
    mock_response = {
        "subject": "Unlock your sales potential",
        "body": "<p>Hi John,</p>",
        "personalization_score": 85.0
    }

    with patch("routers.bdr.llm_service.generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = json.dumps(mock_response)

        payload = {
            "lead_name": "João Silva",
            "company_name": "Tech Corp",
            "industry": "SaaS B2B",
            "pain_points": ["baixa conversão de leads", "processo manual"],
            "value_proposition": "Automatize seu pipeline com IA",
            "tone": "professional"
        }
        response = await async_client.post("/api/v1/bdr/generate-cold-email", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == mock_response["subject"]
        assert data["personalization_score"] == mock_response["personalization_score"]

@pytest.mark.asyncio
async def test_analyze_buying_committee(async_client):
    mock_response = {
        "personas": [
            {
                "role": "CTO",
                "seniority": "C-Level",
                "influence_level": "high",
                "key_concerns": ["Security", "Scalability"],
                "messaging_tips": "Focus on technical robustness"
            }
        ]
    }

    with patch("routers.bdr.llm_service.generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = json.dumps(mock_response)

        payload = {
            "company_name": "Tech Corp",
            "industry": "Software",
            "company_size": 500,
            "target_role": "CTO"
        }
        response = await async_client.post("/api/v1/bdr/analyze-buying-committee", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["personas"]) == 1
        assert data["personas"][0]["role"] == "CTO"

@pytest.mark.asyncio
async def test_suggest_sequence(async_client):
    mock_response = {
        "sequence": [
            {
                "day": 1,
                "channel": "email",
                "template": "Intro email",
                "objective": "Introduction"
            }
        ]
    }

    with patch("routers.bdr.llm_service.generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = json.dumps(mock_response)

        payload = {
            "goal": "book_demo",
            "target_persona": "VP Sales",
            "touchpoints_count": 5
        }
        response = await async_client.post("/api/v1/bdr/suggest-sequence", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["sequence"]) == 1

@pytest.mark.asyncio
async def test_analyze_icp(async_client):
    mock_response = {
        "icp_profile": {
            "industries": ["SaaS", "Fintech"],
            "company_size_range": {"min": 50, "max": 500},
            "key_attributes": ["High growth", "Remote first"],
            "anti_patterns": ["Legacy systems"]
        },
        "lookalike_score_threshold": 0.8
    }

    with patch("routers.bdr.llm_service.generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = json.dumps(mock_response)

        payload = {
            "current_customers": [
                {
                    "company_name": "Alpha",
                    "industry": "SaaS",
                    "size": 100,
                    "revenue": 1000000.0
                }
            ],
            "closed_lost_reasons": ["Price too high"]
        }
        response = await async_client.post("/api/v1/bdr/analyze-icp", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["lookalike_score_threshold"] == 0.8
