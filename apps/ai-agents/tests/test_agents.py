import asyncio
import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.sdr_agent import SDRAgent
from services.icp_agent import ICPAgent
from services.bdr_agent import BDRAgent
from schemas.agent import EmailGenerationRequest, ICPClassificationRequest, AgentRunRequest

async def test_sdr():
    print("Testing SDR Agent...")
    agent = SDRAgent()
    req = EmailGenerationRequest(
        lead_name="John Doe",
        company_name="Acme Corp",
        industry="Retail",
        pain_points=["Low sales"],
        value_proposition="AI Sales Tool"
    )
    res = await agent.generate_email(req)
    print(f"SDR Response: {res.subject}")

async def test_icp():
    print("\nTesting ICP Agent (Streaming)...")
    agent = ICPAgent()
    req = {
        "company_name": "Tech Corp",
        "about_us": "We make software."
    }
    async for chunk in agent.classify_company(req):
        print(chunk, end="", flush=True)
    print("\n")

async def test_bdr():
    print("\nTesting BDR Agent...")
    agent = BDRAgent()
    req = AgentRunRequest(goal="Find CEO of Example.com")
    res = await agent.run(req)
    print(f"BDR Final Answer: {res.final_answer}")

async def main():
    await test_sdr()
    await test_icp()
    await test_bdr()

if __name__ == "__main__":
    asyncio.run(main())
