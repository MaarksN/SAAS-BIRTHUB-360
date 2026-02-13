import json
import asyncio
import os
import re
from typing import List, Dict, Any, Optional
from schemas.agent import AgentRunRequest, AgentResponse, AgentStep
from services.crawler import DeepCrawler
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-mock-key")

class Tool:
    name: str
    description: str
    async def run(self, input_str: str) -> str: raise NotImplementedError

class GoogleSearchTool(Tool):
    name = "googleSearch"
    description = "Searches Google for a query."
    async def run(self, input_str: str) -> str:
        return f"[Search Result] Found 3 contacts for '{input_str}': ceo@example.com, sales@example.com."

class ScrapeUrlTool(Tool):
    name = "scrapeUrl"
    description = "Extracts text content from a URL."
    async def run(self, input_str: str) -> str:
        return f"[Scrape Result] Content of {input_str}: 'Our CEO is Tim Cook...'"

class BDRAgent:
    def __init__(self):
        self.tools = {
            "googleSearch": GoogleSearchTool(),
            "scrapeUrl": ScrapeUrlTool()
        }
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    async def run(self, request: AgentRunRequest) -> AgentResponse:
        steps = []
        messages = [
            {"role": "system", "content": f"""
You are an autonomous BDR Agent. Your goal is: {request.goal}.
You have access to tools: googleSearch(query), scrapeUrl(url).
Format:
Thought: [reasoning]
Action: [tool_name]
Action Input: [input]
Observation: [result]
...
Final Answer: [answer]
"""}
        ]

        for i in range(1, request.max_steps + 1):
            if "mock" in OPENAI_API_KEY:
                # Deterministic simulation for tests
                if i == 1:
                    content = f"Thought: Searching for {request.goal}.\nAction: googleSearch\nAction Input: {request.goal}"
                elif i == 2:
                    content = f"Thought: Verifying.\nAction: scrapeUrl\nAction Input: http://example.com"
                else:
                    content = f"Final Answer: Found contacts for {request.goal}."
            else:
                response = self.client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=messages,
                    stop=["Observation:"]
                )
                content = response.choices[0].message.content

            thought, action, action_input, final = self._parse_all(content)

            if final:
                return AgentResponse(final_answer=final, steps=steps, sources=[])

            if action and action_input:
                tool = self.tools.get(action)
                if tool:
                    obs = await tool.run(action_input)
                    steps.append(AgentStep(step=i, thought=thought or "", action=action, action_input=action_input, observation=obs))
                    messages.append({"role": "assistant", "content": content})
                    messages.append({"role": "user", "content": f"Observation: {obs}"})
                else:
                    break
            else:
                break

        return AgentResponse(final_answer="Limit reached.", steps=steps, sources=[])

    def _parse_all(self, text: str):
        thought = self._parse(text, "Thought:")
        action = self._parse(text, "Action:")
        action_input = self._parse(text, "Action Input:")
        final = self._parse(text, "Final Answer:")
        return thought, action, action_input, final

    def _parse(self, text: str, key: str) -> Optional[str]:
        if not text: return None
        if key not in text: return None

        start = text.find(key) + len(key)
        end = len(text)

        # Check against known keys to find the boundary
        keys = ["Thought:", "Action:", "Action Input:", "Final Answer:"]
        if key in keys: keys.remove(key)

        for k in keys:
            idx = text.find(k, start)
            if idx != -1 and idx < end:
                end = idx

        return text[start:end].strip()
