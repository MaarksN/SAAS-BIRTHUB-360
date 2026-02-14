import psycopg2
from pgvector.psycopg2 import register_vector
import numpy as np
import os
import json
from typing import List, Dict, Any
from utils.ai_gateway import get_gateway_instance

DB_URL = os.getenv("DATABASE_URL")

class RAGService:
    def __init__(self):
        self.gateway = get_gateway_instance()
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

    async def expand_query(self, query: str) -> List[str]:
        """
        Uses LLM to generate related queries for better recall.
        """
        try:
            prompt = f"""You are an AI assistant helping with information retrieval.
Generate 3-5 different search queries that are semantically related to the user's original query.
These should cover different aspects, synonyms, or related concepts to improve search recall.
Return ONLY a JSON list of strings. No other text.

Original Query: "{query}"
"""
            result = await self.gateway.generate_text(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}],
                context_type="RAG_Query_Expansion"
            )

            response_text = result["content"]
            # Extract JSON list
            start = response_text.find('[')
            end = response_text.rfind(']') + 1
            if start >= 0 and end > start:
                try:
                    return json.loads(response_text[start:end])
                except json.JSONDecodeError:
                    return [query]
            return [query]
        except Exception as e:
            print(f"Error expanding query: {e}")
            return [query]

    async def rerank_results(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Uses LLM to rerank results based on relevance to the query.
        """
        if not results:
            return []

        try:
            # Prepare context for reranking
            candidates_text = ""
            for i, res in enumerate(results):
                # Truncate content to save tokens if needed
                content = res.get('content', '')
                content_preview = content[:500] + "..." if len(content) > 500 else content
                candidates_text += f"Document {i}:\n{content_preview}\n\n"

            prompt = f"""You are an expert Re-ranker.
Your task is to score the relevance of the following candidate documents to the user's query.
Score each document from 0 to 10, where 10 is perfectly relevant and 0 is irrelevant.
Return ONLY a JSON object where keys are "Document 0", "Document 1", etc., and values are the scores.

Query: "{query}"

Candidates:
{candidates_text}
"""
            result = await self.gateway.generate_text(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                temperature=0.0,
                messages=[{"role": "user", "content": prompt}],
                context_type="RAG_Reranking"
            )

            response_text = result["content"]
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start >= 0 and end > start:
                try:
                    scores_map = json.loads(response_text[start:end])

                    # Assign scores back to results
                    reranked = []
                    for i, res in enumerate(results):
                        key = f"Document {i}"
                        score = scores_map.get(key, 0)
                        # Ensure score is int/float
                        if isinstance(score, (int, float)):
                            res['rerank_score'] = score
                        else:
                            res['rerank_score'] = 0
                        reranked.append(res)

                    # Sort by new score
                    reranked.sort(key=lambda x: x.get('rerank_score', 0), reverse=True)
                    return reranked
                except json.JSONDecodeError:
                    return results

            return results # Fallback

        except Exception as e:
            print(f"Error reranking results: {e}")
            return results

    async def generate_embedding(self, text: str) -> List[float]:
        try:
            return await self.gateway.generate_embedding(text)
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    async def search_advanced(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Orchestrates Advanced RAG:
        1. Query Expansion
        2. Hybrid Search (Vector + Text) for all queries
        3. Deduplication
        4. Reranking
        """
        # 1. Expand Query
        queries = await self.expand_query(query)
        if query not in queries:
            queries.insert(0, query)

        all_results = []
        seen_contents = set()

        for q in queries:
            # 2. Embedding
            embedding = await self.generate_embedding(q)
            if not embedding:
                # If embedding fails, try text-only search using search_fulltext
                # But search_hybrid needs embedding. So use search_fulltext directly.
                results = self.search_fulltext(q, limit=limit)
            else:
                # 3. Hybrid Search
                # limit=3 for expansions to avoid too many results
                search_limit = 5 if q == query else 3
                results = self.search_hybrid(q, embedding, limit=search_limit)

            for res in results:
                content = res.get('content')
                if content and content not in seen_contents:
                    seen_contents.add(content)
                    all_results.append(res)

        # 4. Rerank
        reranked = await self.rerank_results(query, all_results)

        return reranked[:limit]

    def close(self):
        if self.conn:
            self.conn.close()
