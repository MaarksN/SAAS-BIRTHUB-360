import psycopg2
from pgvector.psycopg2 import register_vector
import numpy as np
import os
import json
from typing import List, Dict, Any

DB_URL = os.getenv("DATABASE_URL")

class RAGService:
    def __init__(self):
        # In production, use a connection pool or asyncpg
        try:
            if not DB_URL:
                raise ValueError("DATABASE_URL environment variable not set")
            self.conn = psycopg2.connect(DB_URL)
            # Register vector type for numpy usage
            # register_vector(self.conn) # Requires pgvector extension installed
        except Exception as e:
            print(f"Warning: Could not connect to DB for RAG: {e}")
            self.conn = None

    def store_embedding(self, text: str, embedding: List[float], metadata: Dict[str, Any]):
        if not self.conn: return
        try:
            with self.conn.cursor() as cur:
                query = """
                    INSERT INTO rag_embeddings (content, embedding, metadata)
                    VALUES (%s, %s, %s)
                """
                cur.execute(query, (text, embedding, json.dumps(metadata)))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            print(f"Error storing embedding: {e}")

    def search_similar(self, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        if not self.conn: return []
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT content, metadata, embedding <-> %s AS distance
                    FROM rag_embeddings
                    ORDER BY distance
                    LIMIT %s
                """
                cur.execute(query, (np.array(query_embedding), limit))
                results = cur.fetchall()
                return [
                    {"content": r[0], "metadata": r[1], "distance": r[2]}
                    for r in results
                ]
        except Exception as e:
            print(f"Error searching similar: {e}")
            return []

    def close(self):
        if self.conn:
            self.conn.close()
