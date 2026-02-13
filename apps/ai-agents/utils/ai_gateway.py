from anthropic import AsyncAnthropic
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Dict, Any, List, Optional, Literal
import os
import time
import json
import logging
import asyncio
import psycopg2
from utils.context import get_org_id, get_user_id

# Configure logging
logger = logging.getLogger("ai_gateway")

# Pricing Constants (USD per 1M tokens) - Update periodically
PRICING = {
    "claude-3-5-sonnet-20241022": {"input": 3.0, "output": 15.0},
    "claude-3-opus-20240229": {"input": 15.0, "output": 75.0},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    "gpt-4o": {"input": 2.5, "output": 10.0},
    "gpt-4o-mini": {"input": 0.15, "output": 0.6},
    "text-embedding-3-small": {"input": 0.02, "output": 0.0}, # Only input matters
}

class AIGateway:
    def __init__(self):
        self.anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.db_url = os.getenv("DATABASE_URL")
        self.conn = None # Connection is managed per request or via pool (simplified here)

    async def _log_usage(self, model: str, input_tokens: int, output_tokens: int, latency_ms: int, context_type: str):
        """Logs AI usage to the database asynchronously without blocking the event loop."""
        org_id = get_org_id()
        user_id = get_user_id()

        if not org_id:
            logger.warning("No organization ID found for AI usage logging")
            return

        # Calculate cost
        pricing = PRICING.get(model, {"input": 0, "output": 0})
        cost = (input_tokens / 1_000_000 * pricing["input"]) + (output_tokens / 1_000_000 * pricing["output"])

        def _sync_log():
            try:
                # Use a separate connection for logging
                conn = psycopg2.connect(self.db_url)
                with conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO usage_logs (
                                "id", "organizationId", "userId", "modelUsed",
                                "inputTokens", "outputTokens", "latencyMs",
                                "estimatedCost", "contextType", "createdAt"
                            ) VALUES (
                                gen_random_uuid(), %s, %s, %s,
                                %s, %s, %s,
                                %s, %s, NOW()
                            )
                        """, (org_id, user_id, model, input_tokens, output_tokens, latency_ms, cost, context_type))
                conn.close()
            except Exception as e:
                logger.error(f"Failed to log AI usage (sync): {e}")

        # Offload to thread pool
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _sync_log)

    async def generate_text(self,
                            messages: List[Dict[str, str]],
                            system: str = "",
                            model: str = "claude-3-5-sonnet-20241022",
                            max_tokens: int = 1000,
                            temperature: float = 0.7,
                            context_type: str = "General",
                            fallback_enabled: bool = True) -> Dict[str, Any]:
        """
        Generates text using the specified model with automatic fallback.
        Returns a dict with 'content', 'model', 'usage'.
        """
        start_time = time.time()

        try:
            # Try Primary Model (Claude)
            if "claude" in model:
                return await self._call_anthropic(messages, system, model, max_tokens, temperature, start_time, context_type)
            elif "gpt" in model:
                return await self._call_openai(messages, system, model, max_tokens, temperature, start_time, context_type)
            else:
                raise ValueError(f"Unsupported model: {model}")

        except Exception as e:
            if not fallback_enabled:
                raise e

            logger.warning(f"Primary model {model} failed: {e}. Attempting fallback...")

            # Fallback Logic
            fallback_model = self._get_fallback_model(model)
            if not fallback_model:
                logger.error(f"No fallback model defined for {model}")
                raise e

            try:
                if "gpt" in fallback_model:
                    return await self._call_openai(messages, system, fallback_model, max_tokens, temperature, start_time, context_type)
                elif "claude" in fallback_model:
                    return await self._call_anthropic(messages, system, fallback_model, max_tokens, temperature, start_time, context_type)
            except Exception as fallback_error:
                logger.error(f"Fallback model {fallback_model} also failed: {fallback_error}")
                raise e # Raise original or new error? Usually the last one.

    def _get_fallback_model(self, model: str) -> Optional[str]:
        """Maps models to their fallbacks."""
        if "claude-3-5-sonnet" in model:
            return "gpt-4o"
        if "claude-3-opus" in model:
            return "gpt-4o"
        if "claude-3-haiku" in model:
            return "gpt-4o-mini"
        if "gpt-4o" in model:
            return "claude-3-5-sonnet-20241022"
        return None

    async def _call_anthropic(self, messages, system, model, max_tokens, temperature, start_time, context_type):
        response = await self.anthropic_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=messages
        )
        latency = int((time.time() - start_time) * 1000)

        # Log Usage
        asyncio.create_task(self._log_usage(
            model=model,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            latency_ms=latency,
            context_type=context_type
        ))

        return {
            "content": response.content[0].text,
            "model": model,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens
            }
        }

    async def _call_openai(self, messages, system, model, max_tokens, temperature, start_time, context_type):
        # Convert Anthropic message format to OpenAI
        openai_messages = []
        if system:
            openai_messages.append({"role": "system", "content": system})
        openai_messages.extend(messages)

        response = await self.openai_client.chat.completions.create(
            model=model,
            messages=openai_messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        latency = int((time.time() - start_time) * 1000)

        usage = response.usage

        # Log Usage
        asyncio.create_task(self._log_usage(
            model=model,
            input_tokens=usage.prompt_tokens,
            output_tokens=usage.completion_tokens,
            latency_ms=latency,
            context_type=context_type
        ))

        return {
            "content": response.choices[0].message.content,
            "model": model,
            "usage": {
                "input_tokens": usage.prompt_tokens,
                "output_tokens": usage.completion_tokens
            }
        }

    async def generate_embedding(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        # Embeddings usually don't have easy fallback due to dimensionality mismatch
        # But we still log usage
        start_time = time.time()
        try:
            response = await self.openai_client.embeddings.create(
                input=text,
                model=model
            )
            latency = int((time.time() - start_time) * 1000)

            # Estimate tokens (approx 1 token per 4 chars for English) or use usage from response
            usage = response.usage

            asyncio.create_task(self._log_usage(
                model=model,
                input_tokens=usage.prompt_tokens,
                output_tokens=0,
                latency_ms=latency,
                context_type="Embedding"
            ))

            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []

    def close(self):
        # Clients are usually managed globally or have their own cleanup
        pass

# Singleton instance
_gateway_instance = None

def get_gateway_instance() -> AIGateway:
    """Returns a singleton instance of AIGateway."""
    global _gateway_instance
    if _gateway_instance is None:
        _gateway_instance = AIGateway()
    return _gateway_instance
