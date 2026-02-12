import json
import os
from datetime import datetime
from jinja2 import Template
from openai import OpenAI, OpenAIError
from schemas.agent import EmailGenerationRequest, EmailGenerationResponse
from services.guardrails import OutputValidator

# Mock OpenAI for development if key not present
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-mock-key")
client = OpenAI(api_key=OPENAI_API_KEY)

# Cycle 27: Usage Tracking
import redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# --- Templates (Cycle 18: Few-Shot & CoT) ---
SYSTEM_PROMPT = """
You are a world-class SDR (Sales Development Representative) specializing in personalized cold outreach.
Your goal is to write high-converting emails that focus on the prospect's pain points.

Format your response as a valid JSON object with the following keys:
- subject: The email subject line (catchy, short).
- body_html: The email body in HTML format (clean, professional).
- sentiment: A brief analysis of why this email works.

Examples of Good Emails:
[
  {
    "subject": "Question about {{company_name}}'s scaling",
    "body_html": "<p>Hi {{lead_name}},</p><p>I saw you're leading growth at {{company_name}}...</p>"
  }
]
"""

USER_PROMPT_TEMPLATE = """
Context:
Lead: {{ lead_name }} from {{ company_name }}
Industry: {{ industry }}
Pain Points: {{ pain_points | join(', ') }}
Value Prop: {{ value_proposition }}
Additional Context: {{ context }}

Task:
1. Analyze the industry challenges.
2. Connect the pain points to our value proposition.
3. Write a concise, text-based email (formatted as HTML).
4. Do not include placeholders like [Your Name] - assume signature is added later.
"""

class SDRAgent:
    def __init__(self):
        pass

    async def generate_email(self, request: EmailGenerationRequest) -> EmailGenerationResponse:
        # 1. Render Prompt
        template = Template(USER_PROMPT_TEMPLATE)
        user_content = template.render(request.model_dump())

        # 2. Call LLM with Auto-Healing (Cycle 18)
        retries = 2
        validator = OutputValidator() # Cycle 24 Guardrails

        for attempt in range(retries):
            try:
                # If using a mock key, return dummy data
                if "mock" in OPENAI_API_KEY:
                    return self._mock_response(request)

                response = client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7
                )

                content = response.choices[0].message.content
                parsed = json.loads(content)

                # Cycle 27: Report Usage
                tokens = response.usage.total_tokens if response.usage else 0
                self._report_usage("mock-tenant", tokens) # Tenant ID from context

                # Cycle 24: Validate Output
                body = parsed.get("body_html", "")
                validator.validate(body)

                return EmailGenerationResponse(
                    subject=parsed.get("subject", "No Subject"),
                    body_html=body,
                    sentiment_analysis=parsed.get("sentiment", "N/A"),
                    generated_at=datetime.utcnow().isoformat()
                )

            except json.JSONDecodeError as e:
                print(f"JSON Error on attempt {attempt}: {e}")
                # Retry loop will trigger
                continue
            except Exception as e:
                print(f"LLM Error: {e}")
                raise e

        raise Exception("Failed to generate valid JSON after retries.")

    def _report_usage(self, tenant_id: str, tokens: int):
        try:
            # Estimate cost (GPT-4 Turbo ~$0.03/1k tokens mixed)
            cost = (tokens / 1000) * 0.03
            key = f"usage:{tenant_id}:{datetime.now().strftime('%Y-%m')}"
            redis_client.incrbyfloat(key, cost)
        except Exception as e:
            print(f"Failed to report usage: {e}")

    def _mock_response(self, request: EmailGenerationRequest) -> EmailGenerationResponse:
        return EmailGenerationResponse(
            subject=f"Idea for {request.company_name}",
            body_html=f"<p>Hi {request.lead_name},</p><p>Addressing {request.pain_points[0]}...</p>",
            sentiment_analysis="Focused on primary pain point.",
            generated_at=datetime.utcnow().isoformat()
        )
