import sys
from unittest.mock import MagicMock
import os

# Mock dependencies
sys.modules['psycopg2'] = MagicMock()
sys.modules['pgvector.psycopg2'] = MagicMock()

import pytest
from unittest.mock import AsyncMock, patch

# Adjust path to import utils
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.ai_gateway import AIGateway

# Mock environment variables
os.environ["DATABASE_URL"] = "postgres://user:pass@localhost:5432/db"
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-test"
os.environ["OPENAI_API_KEY"] = "sk-openai-test"

@pytest.fixture
def mock_clients():
    with patch('utils.ai_gateway.AsyncAnthropic') as mock_anthropic, \
         patch('utils.ai_gateway.AsyncOpenAI') as mock_openai, \
         patch('utils.ai_gateway.psycopg2') as mock_psycopg2:

        # Setup Anthropic mock
        mock_anthropic_instance = mock_anthropic.return_value
        mock_anthropic_instance.messages.create = AsyncMock()

        # Setup OpenAI mock
        mock_openai_instance = mock_openai.return_value
        mock_openai_instance.chat.completions.create = AsyncMock()
        mock_openai_instance.embeddings.create = AsyncMock()

        # Setup psycopg2 mock
        mock_conn = MagicMock()
        mock_psycopg2.connect.return_value = mock_conn

        yield mock_anthropic_instance, mock_openai_instance, mock_psycopg2

@pytest.mark.asyncio
async def test_generate_text_primary_success(mock_clients):
    mock_anthropic, _, _ = mock_clients

    # Mock successful Claude response
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="Claude response")]
    mock_response.usage.input_tokens = 10
    mock_response.usage.output_tokens = 20
    mock_anthropic.messages.create.return_value = mock_response

    gateway = AIGateway()
    result = await gateway.generate_text(
        messages=[{"role": "user", "content": "Hello"}],
        model="claude-3-5-sonnet-20241022"
    )

    assert result["content"] == "Claude response"
    assert result["model"] == "claude-3-5-sonnet-20241022"
    mock_anthropic.messages.create.assert_called_once()

@pytest.mark.asyncio
async def test_generate_text_fallback(mock_clients):
    mock_anthropic, mock_openai, _ = mock_clients

    # Mock Claude failure
    mock_anthropic.messages.create.side_effect = Exception("Claude is down")

    # Mock OpenAI success
    mock_openai_resp = MagicMock()
    mock_openai_resp.choices = [MagicMock(message=MagicMock(content="GPT-4 response"))]
    mock_openai_resp.usage.prompt_tokens = 10
    mock_openai_resp.usage.completion_tokens = 20
    mock_openai.chat.completions.create.return_value = mock_openai_resp

    gateway = AIGateway()
    result = await gateway.generate_text(
        messages=[{"role": "user", "content": "Hello"}],
        model="claude-3-5-sonnet-20241022"
    )

    assert result["content"] == "GPT-4 response"
    assert "gpt-4o" in result["model"] # Fallback model

    # Verify both were called
    mock_anthropic.messages.create.assert_called_once()
    mock_openai.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
async def test_log_usage(mock_clients):
    _, _, mock_psycopg2 = mock_clients

    gateway = AIGateway()

    # Manually trigger logging (since it's async task in gateway)
    await gateway._log_usage(
        model="test-model",
        input_tokens=100,
        output_tokens=50,
        latency_ms=200,
        context_type="test"
    )

    mock_psycopg2.connect.assert_called_once()
    conn = mock_psycopg2.connect.return_value
    conn.cursor.return_value.__enter__.return_value.execute.assert_called_once()

    # Verify sql execution args
    args = conn.cursor.return_value.__enter__.return_value.execute.call_args[0]
    assert "INSERT INTO usage_logs" in args[0]
    assert args[1][2] == "test-model" # model
