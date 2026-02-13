import json
import asyncio
import os
from typing import AsyncGenerator
from openai import OpenAI
from schemas.agent import ICPClassificationRequest

# Mock OpenAI for development if key not present
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-mock-key")

class ICPAgent:
    async def classify_company(self, request_data: dict) -> AsyncGenerator[str, None]:
        system_prompt = """
        You are a B2B Classification Expert.
        Analyze the company description and classify it into a 3-level hierarchy: Industry > Sector > Niche.
        Also provide a confidence score (0-1) and a short reasoning.
        """

        user_content = f"""
        Company: {request_data.get('company_name')}
        Headline: {request_data.get('headline', 'N/A')}
        About Us: {request_data.get('about_us', '')[:500]}...

        Output format: Stream tokens as they are generated.
        Analysis:
        """

        # Mock Logic
        if "mock" in OPENAI_API_KEY:
            mock_text = f"Thinking...\nBased on '{request_data.get('company_name')}' description...\nIndustry: Technology\nSector: Software\nNiche: Automation\nConfidence: 0.95\nReasoning: Explicit mention of automation software."
            # Simulate streaming
            for word in mock_text.split(' '):
                yield word + " "
                await asyncio.sleep(0.1) # Simulate network latency
            return

        # Real Logic
        client = OpenAI(api_key=OPENAI_API_KEY)
        try:
            stream = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"Error: {str(e)}"
