import sys
from unittest.mock import MagicMock
import os

# Mock dependencies before import
sys.modules['psycopg2'] = MagicMock()
sys.modules['pgvector.psycopg2'] = MagicMock()

import pytest
from unittest.mock import AsyncMock, patch
import json

# Adjust path to import rag
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from rag import RAGService

# Mock environment variables
os.environ["DATABASE_URL"] = "postgres://user:pass@localhost:5432/db"
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-test"
os.environ["OPENAI_API_KEY"] = "sk-openai-test"

@pytest.fixture
def mock_clients():
    with patch('rag.AsyncAnthropic') as mock_anthropic, \
         patch('rag.AsyncOpenAI') as mock_openai:

        # Setup Anthropic mock
        mock_anthropic_instance = mock_anthropic.return_value
        mock_anthropic_instance.messages.create = AsyncMock()

        # Setup OpenAI mock
        mock_openai_instance = mock_openai.return_value
        mock_openai_instance.embeddings.create = AsyncMock()
        mock_openai_instance.api_key = "sk-openai-test"

        yield mock_anthropic_instance, mock_openai_instance

@pytest.mark.asyncio
async def test_expand_query(mock_clients):
    mock_anthropic, _ = mock_clients

    # Mock response for expand_query
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='["query1", "query2", "query3"]')]
    mock_anthropic.messages.create.return_value = mock_response

    rag = RAGService()
    queries = await rag.expand_query("original query")

    assert len(queries) == 3
    assert "query1" in queries
    assert "query2" in queries
    mock_anthropic.messages.create.assert_called_once()

@pytest.mark.asyncio
async def test_rerank_results(mock_clients):
    mock_anthropic, _ = mock_clients

    # Mock response for rerank_results
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='{"Document 0": 9, "Document 1": 5}')]
    mock_anthropic.messages.create.return_value = mock_response

    rag = RAGService()
    results = [{"content": "doc1"}, {"content": "doc2"}]
    reranked = await rag.rerank_results("query", results)

    assert len(reranked) == 2
    assert reranked[0].get("rerank_score") == 9
    assert reranked[1].get("rerank_score") == 5
    mock_anthropic.messages.create.assert_called_once()

@pytest.mark.asyncio
async def test_generate_embedding(mock_clients):
    _, mock_openai = mock_clients

    # Mock response for generate_embedding
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]
    mock_openai.embeddings.create.return_value = mock_response

    rag = RAGService()
    embedding = await rag.generate_embedding("text")

    assert embedding == [0.1, 0.2, 0.3]
    mock_openai.embeddings.create.assert_called_once()

@pytest.mark.asyncio
async def test_search_advanced(mock_clients):
    mock_anthropic, mock_openai = mock_clients

    # Mock expand_query response
    mock_anthropic_expand = MagicMock()
    mock_anthropic_expand.content = [MagicMock(text='["expanded"]')]

    # Mock rerank_results response
    mock_anthropic_rerank = MagicMock()
    mock_anthropic_rerank.content = [MagicMock(text='{"Document 0": 8}')]

    # Setup side_effect for multiple calls
    mock_anthropic.messages.create.side_effect = [mock_anthropic_expand, mock_anthropic_rerank]

    # Mock generate_embedding
    mock_openai_resp = MagicMock()
    mock_openai_resp.data = [MagicMock(embedding=[0.1]*1536)]
    mock_openai.embeddings.create.return_value = mock_openai_resp

    rag = RAGService()

    # Mock search_hybrid to return some results
    rag.search_hybrid = MagicMock(return_value=[{"content": "doc1", "score": 0.5}])
    # Mock search_fulltext just in case
    rag.search_fulltext = MagicMock(return_value=[])

    results = await rag.search_advanced("query", limit=5)

    assert len(results) == 1
    assert results[0]["content"] == "doc1"
    # Verify calls
    assert mock_anthropic.messages.create.call_count == 2 # expand + rerank
    assert mock_openai.embeddings.create.call_count >= 1 # embedding for query + expansions
    assert rag.search_hybrid.call_count >= 1
