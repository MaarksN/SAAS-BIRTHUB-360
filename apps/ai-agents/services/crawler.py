import re
import asyncio
from playwright.async_api import async_playwright, Page
from typing import Dict, List, Set
from urllib.parse import urljoin, urlparse

PHONE_REGEX = re.compile(r'(\+55\s?\d{2}\s?9?\d{4}[-\s]?\d{4})')
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

class DeepCrawler:
    def __init__(self):
        pass

    async def crawl(self, url: str) -> Dict[str, any]:
        async with async_playwright() as p:
            # Launch with headless=True
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0 (compatible; SalesOSBot/1.0)")
            page = await context.new_page()

            try:
                # Set strict timeout (Cycle 12/Restrictions)
                await page.goto(url, timeout=30000, wait_until='domcontentloaded')

                extracted_data = {
                    "phones": set(),
                    "emails": set(),
                    "whatsapp": [],
                    "socials": []
                }

                # Analyze Home
                await self._extract_contacts(page, extracted_data)

                # Find Contact Links
                links = await page.eval_on_selector_all('a', '(as) => as.map(a => a.href)')
                contact_links = [l for l in links if any(x in l.lower() for x in ['contato', 'contact', 'fale-conosco', 'sobre', 'about'])]

                # Visit up to 3 contact pages
                for link in contact_links[:3]:
                    if link == url: continue
                    try:
                        await page.goto(link, timeout=15000, wait_until='domcontentloaded')
                        await self._extract_contacts(page, extracted_data)
                    except Exception as e:
                        print(f"Failed to crawl {link}: {e}")

                return {
                    "phones": list(extracted_data["phones"]),
                    "emails": list(extracted_data["emails"]),
                    "whatsapp": extracted_data["whatsapp"],
                    "socials": extracted_data["socials"]
                }

            except Exception as e:
                print(f"Error crawling {url}: {e}")
                return {"error": str(e)}
            finally:
                await browser.close()

    async def _extract_contacts(self, page: Page, data: Dict):
        content = await page.content()

        # Regex Phones
        phones = PHONE_REGEX.findall(content)
        for p in phones:
            data["phones"].add(p.replace(" ", "").replace("-", ""))

        # Regex Emails
        emails = EMAIL_REGEX.findall(content)
        for e in emails:
            data["emails"].add(e)

        # WhatsApp Links
        links = await page.eval_on_selector_all('a', '(as) => as.map(a => a.href)')
        for link in links:
            if "api.whatsapp.com" in link or "wa.me" in link:
                data["whatsapp"].append(link)
            if any(x in link for x in ['instagram.com', 'facebook.com', 'linkedin.com']):
                 if link not in data["socials"]:
                     data["socials"].append(link)
