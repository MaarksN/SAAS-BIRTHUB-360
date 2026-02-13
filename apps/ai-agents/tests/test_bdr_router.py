import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from unittest.mock import AsyncMock, patch, MagicMock
import json
import os
from jose import jwt

# Set dummy secret for testing
os.environ["NEXTAUTH_SECRET"] = "test-secret-123"

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
def auth_headers():
    secret = os.getenv("NEXTAUTH_SECRET")
    token = jwt.encode({"sub": "test-user"}, secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def async_client():
    # Use ASGITransport to bypass actual network and run the app directly
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_generate_cold_email(async_client, auth_headers):
    mock_response_data = {
        "subject": "Unlock your sales potential",
        "body": "<p>Hi John,</p>",
        "personalization_score": 85.0,
        "reasoning": "Mocked reasoning"
    }

    # Mock Anthropic response structure
    mock_message = MagicMock()
    mock_message.content = [MagicMock(text=json.dumps(mock_response_data))]

    with patch("routers.bdr.anthropic_client.messages.create", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_message

        payload = {
            "lead_name": "João Silva",
            "company_name": "Tech Corp",
            "industry": "SaaS B2B",
            "pain_points": ["baixa conversão de leads", "processo manual"],
            "value_proposition": "Automatize seu pipeline com IA",
            "tone": "professional"
        }

        response = await async_client.post(
            "/api/v1/bdr/generate-cold-email",
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == mock_response_data["subject"]
        assert data["personalization_score"] == mock_response_data["personalization_score"]

@pytest.mark.asyncio
async def test_analyze_buying_committee(async_client, auth_headers):
    payload = {
        "company_name": "Tech Corp",
        "industry": "Software",
        "company_size": 500,
        "target_role": "CTO"
    }
    response = await async_client.post(
        "/api/v1/bdr/analyze-buying-committee",
        json=payload,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["personas"]) > 0
    assert any("CTO" in p["role"] for p in data["personas"])

@pytest.mark.asyncio
async def test_suggest_sequence(async_client, auth_headers):
    payload = {
        "goal": "book_demo",
        "target_persona": "VP Sales",
        "touchpoints_count": 5
    }
    response = await async_client.post(
        "/api/v1/bdr/suggest-sequence",
        json=payload,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["sequence"]) <= 5

@pytest.mark.asyncio
async def test_analyze_icp(async_client, auth_headers):
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
    response = await async_client.post(
        "/api/v1/bdr/analyze-icp",
        json=payload,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] > 0
