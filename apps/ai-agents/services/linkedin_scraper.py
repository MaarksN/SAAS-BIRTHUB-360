import asyncio
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
from typing import Dict, Optional, List
from services.proxy_manager import ProxyManager
from utils.logger import logger

class LinkedInScraper:
    def __init__(self):
        self.proxy_manager = ProxyManager()

    async def scrape_profile(self, url: str) -> Dict[str, any]:
        proxy_url = self.proxy_manager.get_next_proxy()

        launch_args = {"headless": True}
        if proxy_url:
            # Playwright proxy format: { "server": "http://..." }
            launch_args["proxy"] = {"server": proxy_url}

        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch(**launch_args)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    viewport={"width": 1280, "height": 800},
                    locale="pt-BR"
                )
                page = await context.new_page()

                logger.info(f"Navigating to {url}")
                response = await page.goto(url, timeout=60000, wait_until='domcontentloaded')

                if "authwall" in page.url or "login" in page.url or "challenge" in page.url:
                    logger.warning(f"Authwall/Login detected for {url}")
                    if proxy_url:
                        self.proxy_manager.report_failure(proxy_url)
                    return {"error": "authwall_detected", "status": "failed", "retryable": True}

                content = await page.content()
                if "Join to view full profile" in content:
                    logger.warning("Public profile limit reached (Join to view)")
                    return {"error": "public_profile_limit", "status": "failed", "retryable": True}

                data = await self._extract_data(page)

                return {
                    "status": "success",
                    "data": data
                }

            except PlaywrightTimeoutError:
                logger.error(f"Timeout scraping {url}")
                if proxy_url:
                    self.proxy_manager.report_failure(proxy_url)
                return {"error": "timeout", "status": "failed", "retryable": True}
            except Exception as e:
                logger.error(f"Error scraping {url}: {str(e)}")
                if proxy_url:
                    self.proxy_manager.report_failure(proxy_url)
                return {"error": str(e), "status": "error", "retryable": False}
            finally:
                if 'browser' in locals():
                    await browser.close()

    async def _extract_data(self, page: Page) -> Dict[str, any]:
        data = {
            "name": None,
            "headline": None,
            "about": None,
            "experience": [],
            "education": []
        }

        try:
            # Name
            title = await page.title()
            if "|" in title:
                data["name"] = title.split("|")[0].strip()
            else:
                h1 = await page.query_selector("h1")
                if h1:
                    data["name"] = await h1.inner_text()

            # Headline
            meta_desc = await page.get_attribute('meta[property="og:description"]', "content")
            if meta_desc:
                data["headline"] = meta_desc

            # About Section
            about_section = page.locator('section:has-text("About"), section:has-text("Sobre")').first
            if await about_section.count() > 0:
                text = await about_section.inner_text()
                data["about"] = text.replace("About", "").replace("Sobre", "").strip()

            # Experience
            exp_section = page.locator('section:has-text("Experience"), section:has-text("Experiência")').first
            if await exp_section.count() > 0:
                items = await exp_section.locator('li').all_inner_texts()
                data["experience"] = [item.strip() for item in items if len(item) > 20][:5]

            # Education
            edu_section = page.locator('section:has-text("Education"), section:has-text("Formação acadêmica")').first
            if await edu_section.count() > 0:
                items = await edu_section.locator('li').all_inner_texts()
                data["education"] = [item.strip() for item in items if len(item) > 20][:3]

        except Exception as e:
            logger.warning(f"Partial extraction failure: {str(e)}")

        return data
