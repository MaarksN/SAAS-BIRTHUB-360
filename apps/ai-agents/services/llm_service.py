import google.generativeai as genai
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=api_key)

        # Using gemini-1.5-flash as a robust default
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def generate(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Wrapper genérico para chamadas LLM"""
        full_prompt = self._build_prompt(prompt, context)
        try:
            response = await self.model.generate_content_async(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            return "Error generating content. Please check logs."

    def _build_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Constrói prompt com context injection"""
        if not context:
            return prompt

        context_str = "\n".join([f"{k}: {v}" for k, v in context.items()])
        return f"""Context:
{context_str}

Task:
{prompt}

Instructions:
- Be concise and actionable
- Use professional business language
- Focus on value proposition
"""
