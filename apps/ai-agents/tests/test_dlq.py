import pytest
import json
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

# Ensure we can import worker from project root
# worker.py is at apps/ai-agents/worker.py
from worker import Worker

@pytest.fixture
def mock_redis_connection():
    # Mock the return value of redis.from_url (which is the client)
    mock_client = AsyncMock()

    # Configure common methods
    mock_client.rpush.return_value = 1 # Return length of list
    mock_client.blpop.return_value = None
    mock_client.get.return_value = None
    mock_client.incr.return_value = 1
    mock_client.expire.return_value = True

    return mock_client

@pytest.mark.asyncio
async def test_dlq_entry_creation(mock_redis_connection):
    """
    Test that send_to_dlq correctly formats the error message and pushes to Redis.
    """
    with patch("redis.asyncio.from_url", return_value=mock_redis_connection):
        # Initialize worker (will use mocked redis)
        worker = Worker()

        # Test Input
        raw_data = json.dumps({"invalid": "json"})
        reason = "Validation Error: Missing required field"

        # Execute
        await worker.send_to_dlq(raw_data, reason)

        # Verify
        mock_redis_connection.rpush.assert_called_once()
        args = mock_redis_connection.rpush.call_args[0]

        queue_name = args[0]
        pushed_value = json.loads(args[1])

        assert queue_name == "ai:agents:dlq"
        assert pushed_value["original_message"] == raw_data
        assert pushed_value["error"] == reason
        assert "timestamp" in pushed_value
        assert isinstance(pushed_value["timestamp"], float)

@pytest.mark.asyncio
async def test_worker_initialization(mock_redis_connection):
    """
    Test that worker initializes correctly with mocked redis.
    """
    with patch("redis.asyncio.from_url", return_value=mock_redis_connection):
        worker = Worker()
        assert worker.redis == mock_redis_connection
        assert worker.running is True
