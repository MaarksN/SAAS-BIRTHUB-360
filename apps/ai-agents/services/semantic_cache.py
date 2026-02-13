import os
import json
import hashlib
import asyncio
import numpy as np
from typing import Optional, Dict, Any, List
import redis.asyncio as redis
import psycopg2
from psycopg2 import pool
from pgvector.psycopg2 import register_vector
from openai import AsyncOpenAI

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class SemanticCache:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.openai = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
        self.similarity_threshold = 0.95

        self.db_pool = None
        try:
            if DATABASE_URL:
                # Use ThreadedConnectionPool for thread safety in async executor
                self.db_pool = psycopg2.pool.ThreadedConnectionPool(1, 5, DATABASE_URL)
        except Exception as e:
            print(f"SemanticCache DB Error: {e}")

    async def get_embedding(self, text: str) -> List[float]:
        if not self.openai:
            return []
        try:
            response = await self.openai.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding Error: {e}")
            return []

    def _get_db_conn(self):
        if self.db_pool:
            conn = self.db_pool.getconn()
            try:
                # Register vector type for this connection if not already done?
                # Ideally done once, but connections might be fresh.
                # register_vector checks if already registered?
                # It queries pg_type. We can try/except.
                register_vector(conn)
            except Exception:
                pass
            return conn
        return None

    def _put_db_conn(self, conn):
        if self.db_pool and conn:
            self.db_pool.putconn(conn)

    def _search_vector_sync(self, embedding: List[float]) -> Optional[Dict[str, Any]]:
        if not self.db_pool or not embedding:
            return None

        conn = self._get_db_conn()
        if not conn:
            return None

        try:
            with conn.cursor() as cur:
                # Find most similar embedding with distance < threshold
                # Using cosine distance (<=>) or L2 (<->). OpenAI embeddings are normalized.
                # similarity = 1 - distance
                query = """
                    SELECT metadata
                    FROM rag_embeddings
                    WHERE 1 - (embedding <=> %s) > %s
                    AND metadata->>'type' = 'response_cache'
                    ORDER BY embedding <=> %s ASC
                    LIMIT 1
                """
                cur.execute(query, (np.array(embedding), self.similarity_threshold, np.array(embedding)))
                result = cur.fetchone()

                if result:
                    return result[0].get('response') # Return the stored response
                return None
        except Exception as e:
            print(f"Vector Search Error: {e}")
            conn.rollback()
            return None
        finally:
            self._put_db_conn(conn)

    def _store_vector_sync(self, text: str, embedding: List[float], response: Dict[str, Any]):
        if not self.db_pool or not embedding:
            return

        conn = self._get_db_conn()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                query = """
                    INSERT INTO rag_embeddings (content, embedding, metadata)
                    VALUES (%s, %s, %s)
                """
                metadata = {
                    "type": "response_cache",
                    "response": response,
                    "timestamp": "now" # simple timestamp
                }
                cur.execute(query, (text, np.array(embedding), json.dumps(metadata)))
                conn.commit()
        except Exception as e:
            print(f"Vector Store Error: {e}")
            conn.rollback()
        finally:
            self._put_db_conn(conn)

    async def get_cached(self, request_data: Dict[str, Any], text_representation: str) -> Optional[Dict[str, Any]]:
        """
        Tries to get a cached response.
        1. Exact match (Redis hash)
        2. Semantic match (PGVector)
        """
        # 1. Exact Match (Redis)
        try:
            cache_key = f"cache:ai:exact:{hashlib.sha256(json.dumps(request_data, sort_keys=True).encode()).hexdigest()}"
            cached = await self.redis.get(cache_key)
            if cached:
                # Refresh TTL
                await self.redis.expire(cache_key, 86400) # 24h
                return json.loads(cached)
        except Exception as e:
            print(f"Redis Cache Error: {e}")

        # 2. Semantic Match (PGVector)
        if self.openai and self.db_pool:
            embedding = await self.get_embedding(text_representation)
            if embedding:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, self._search_vector_sync, embedding)
                if result:
                    return result

        return None

    async def store(self, request_data: Dict[str, Any], text_representation: str, response: Dict[str, Any]):
        """
        Stores response in cache.
        1. Redis (Exact)
        2. PGVector (Semantic)
        """
        # 1. Store in Redis
        try:
            cache_key = f"cache:ai:exact:{hashlib.sha256(json.dumps(request_data, sort_keys=True).encode()).hexdigest()}"
            await self.redis.set(cache_key, json.dumps(response), ex=86400)
        except Exception as e:
            print(f"Redis Store Error: {e}")

        # 2. Store in PGVector
        if self.openai and self.db_pool:
            embedding = await self.get_embedding(text_representation)
            if embedding:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._store_vector_sync, text_representation, embedding, response)

# Singleton
semantic_cache = SemanticCache()
