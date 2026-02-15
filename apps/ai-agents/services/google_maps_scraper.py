import asyncio
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
from typing import Dict, List, Optional
from services.proxy_manager import ProxyManager
from utils.logger import logger

class GoogleMapsScraper:
    def __init__(self):
        self.proxy_manager = ProxyManager()

    async def search_places(self, query: str) -> List[Dict[str, any]]:
        """
        Searches Google Maps for a query and extracts place details.
        """
        proxy_url = self.proxy_manager.get_next_proxy()

        launch_args = {"headless": True}
        if proxy_url:
            launch_args["proxy"] = {"server": proxy_url}

        results = []

        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch(**launch_args)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    viewport={"width": 1280, "height": 800},
                    locale="pt-BR"
                )
                page = await context.new_page()

                logger.info(f"Navigating to Google Maps for query: {query}")
                # Use a general search URL
                await page.goto(f"https://www.google.com/maps/search/{query}", timeout=60000, wait_until='domcontentloaded')

                # Wait for results to load
                # The feed is usually in role="feed" or specific classes.
                # We'll look for the list container.
                try:
                     # This selector is a common container for result items, but Gmaps changes often.
                     # We'll try to find elements with aria-label containing the place name or generic result cards.
                     # A safer bet is scrolling the feed.
                     await page.wait_for_selector('div[role="feed"]', timeout=10000)
                except:
                     logger.warning("Could not find results feed. Might be a single result or no results.")
                     # If it's a single result (direct hit), we scrape the detail panel directly
                     # Implementation for single result skipped for brevity, focusing on list.
                     return []

                # Scroll to load more results (simple implementation: scroll 3 times)
                for _ in range(3):
                    await page.evaluate('document.querySelector(\'div[role="feed"]\').scrollBy(0, 1000)')
                    await asyncio.sleep(2)

                # Extract data from cards
                # Each card typically has an 'a' tag with the place link
                cards = await page.locator('div[role="feed"] > div > div[jsaction]').all()

                logger.info(f"Found {len(cards)} potential cards")

                for card in cards[:10]: # Limit to top 10 for performance
                    try:
                        text = await card.inner_text()
                        lines = text.split('\n')
                        if len(lines) > 0:
                            name = lines[0]
                            # Basic heuristic extraction
                            rating = None
                            for line in lines:
                                if "(" in line and ")" in line and "." in line: # e.g. 4.5 (100)
                                    rating = line
                                    break

                            results.append({
                                "name": name,
                                "rating": rating,
                                "raw_text": text[:100] # Debugging/Context
                            })
                    except Exception as e:
                        logger.warning(f"Error extracting card: {str(e)}")

            except Exception as e:
                logger.error(f"Error scraping Google Maps: {str(e)}")
                if proxy_url:
                    self.proxy_manager.report_failure(proxy_url)
            finally:
                if 'browser' in locals():
                    await browser.close()

        return results

google_maps_scraper = GoogleMapsScraper()
