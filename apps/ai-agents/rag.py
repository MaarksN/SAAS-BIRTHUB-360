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
            try:
                register_vector(self.conn) # Requires pgvector extension installed
            except Exception as e:
                print(f"Warning: Could not register vector type: {e}")
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
                    {"content": r[0], "metadata": r[1], "distance": r[2], "rank": i+1}
                    for i, r in enumerate(results)
                ]
        except Exception as e:
            print(f"Error searching similar: {e}")
            return []

    def search_fulltext(self, query_text: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.conn: return []
        try:
            with self.conn.cursor() as cur:
                # Assuming 'content' column is indexed with tsvector or we cast on the fly
                query = """
                    SELECT content, metadata, ts_rank(to_tsvector('english', content), plainto_tsquery('english', %s)) as rank_score
                    FROM rag_embeddings
                    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', %s)
                    ORDER BY rank_score DESC
                    LIMIT %s
                """
                cur.execute(query, (query_text, query_text, limit))
                results = cur.fetchall()
                return [
                    {"content": r[0], "metadata": r[1], "score": r[2], "rank": i+1}
                    for i, r in enumerate(results)
                ]
        except Exception as e:
            print(f"Error searching fulltext: {e}")
            return []

    def search_hybrid(self, query_text: str, query_embedding: List[float], limit: int = 5, k: int = 60) -> List[Dict[str, Any]]:
        """
        Implements Reciprocal Rank Fusion (RRF)
        score = 1 / (k + rank)
        """
        vector_results = self.search_similar(query_embedding, limit=limit * 2)
        text_results = self.search_fulltext(query_text, limit=limit * 2)

        scores = {}

        # Process Vector Results
        for item in vector_results:
            key = item['content'] # Using content as key, ideally use ID
            if key not in scores:
                scores[key] = {"data": item, "score": 0}
            scores[key]["score"] += 1 / (k + item["rank"])

        # Process Text Results
        for item in text_results:
            key = item['content']
            if key not in scores:
                scores[key] = {"data": item, "score": 0}
            scores[key]["score"] += 1 / (k + item["rank"])

        # Sort by RRF score
        sorted_results = sorted(scores.values(), key=lambda x: x["score"], reverse=True)
        return [item["data"] for item in sorted_results[:limit]]

    def close(self):
        if self.conn:
            self.conn.close()
