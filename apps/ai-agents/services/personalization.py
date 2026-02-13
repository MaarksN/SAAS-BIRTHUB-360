from typing import List, Dict, Any
from jinja2 import Template

class EnrichmentPipeline:
    def __init__(self):
        pass

    async def fetch_recent_posts(self, linkedin_url: str) -> List[str]:
        # Mocking LinkedIn scraping
        return [
            "Excited to announce our Series A funding!",
            "Great time at the SaaS conference in Austin.",
            "Hiring new engineers for our React team."
        ]

    async def generate_context(self, lead_data: Dict[str, Any]) -> str:
        posts = await self.fetch_recent_posts(lead_data.get("linkedin_url", ""))

        context_template = """
        Recent Activity:
        {% for post in posts %}
        - {{ post }}
        {% endfor %}

        Analysis:
        The lead is active in the startup scene (Series A) and hiring engineers.
        Mention 'scaling engineering teams' in the outreach.
        """

        template = Template(context_template)
        return template.render(posts=posts)

# Usage Example
if __name__ == "__main__":
    import asyncio

    async def main():
        pipeline = EnrichmentPipeline()
        context = await pipeline.generate_context({"linkedin_url": "http://linkedin.com/in/jules"})
        print(context)

    asyncio.run(main())
