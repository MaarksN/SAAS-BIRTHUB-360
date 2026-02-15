import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Set
from utils.logger import logger
import asyncio

class TechLookupService:
    def __init__(self):
        # A lightweight dictionary of technology signatures
        # In a full implementation, this would be much larger or loaded from a JSON file (like Wappalyzer's apps.json)
        self.signatures = {
            "CMS": {
                "WordPress": {"meta": {"generator": "WordPress"}, "script": "wp-content", "html": "wp-block"},
                "Shopify": {"script": "shopify.com", "html": "Shopify.theme"},
                "Webflow": {"meta": {"generator": "Webflow"}, "html": "w-nav"},
                "Wix": {"meta": {"generator": "Wix.com"}},
                "Squarespace": {"headers": {"server": "Squarespace"}}
            },
            "Analytics": {
                "Google Analytics": {"script": "googletagmanager.com", "script_src": "google-analytics.com"},
                "Segment": {"script": "cdn.segment.com", "script_content": "analytics.load"},
                "Hotjar": {"script": "static.hotjar.com"},
                "Mixpanel": {"script": "cdn.mxpnl.com"}
            },
            "Marketing": {
                "HubSpot": {"script": "js.hs-scripts.com", "script_src": "hs-analytics.net"},
                "Intercom": {"script": "widget.intercom.io"},
                "Drift": {"script": "js.drift.com"},
                "Klaviyo": {"script": "static.klaviyo.com"},
                "Meta Pixel": {"script": "connect.facebook.net/en_US/fbevents.js"}
            },
            "Frameworks": {
                "React": {"script": "react-dom", "html": "data-reactroot"},
                "Next.js": {"script": "_next/static", "meta": {"name": "next-head-count"}},
                "Vue.js": {"html": "data-v-"},
                "jQuery": {"script": "jquery"}
            }
        }

    async def analyze_stack(self, url: str) -> Dict[str, List[str]]:
        """
        Analyzes a given URL to identify technologies used.
        """
        detected_tech = {
            "CMS": set(),
            "Analytics": set(),
            "Marketing": set(),
            "Frameworks": set()
        }

        # Normalize URL
        if not url.startswith("http"):
            url = f"https://{url}"

        try:
            async with httpx.AsyncClient(verify=False, follow_redirects=True, timeout=15.0) as client:
                response = await client.get(url)

                # 1. Analyze Headers
                self._analyze_headers(response.headers, detected_tech)

                # 2. Analyze HTML Content
                soup = BeautifulSoup(response.text, 'lxml')
                self._analyze_html(soup, response.text, detected_tech)

        except Exception as e:
            logger.error(f"Error analyzing stack for {url}: {str(e)}")
            return {"error": str(e)}

        # Convert sets to lists for JSON serialization
        return {k: list(v) for k, v in detected_tech.items() if v}

    def _analyze_headers(self, headers: httpx.Headers, detected: Dict[str, Set[str]]):
        for category, tools in self.signatures.items():
            for tool_name, rules in tools.items():
                if "headers" in rules:
                    for header_key, header_val in rules["headers"].items():
                        if header_key in headers and header_val.lower() in headers[header_key].lower():
                            detected[category].add(tool_name)

        # Generic Server Header Check
        server = headers.get("server", "").lower()
        if "nginx" in server:
            detected["Frameworks"].add("Nginx")
        if "cloudflare" in server:
            detected["Frameworks"].add("Cloudflare")

    def _analyze_html(self, soup: BeautifulSoup, raw_html: str, detected: Dict[str, Set[str]]):
        scripts = soup.find_all('script')
        metas = soup.find_all('meta')

        for category, tools in self.signatures.items():
            for tool_name, rules in tools.items():

                # Check Meta Tags
                if "meta" in rules:
                    for meta_key, meta_val in rules["meta"].items():
                        # Handle generator="WordPress"
                        found_meta = soup.find("meta", attrs={meta_key: True}) # Find if attr exists first
                        # Or specific key-value pair?
                        # Let's simplify: check if any meta tag has name=meta_key and content contains meta_val
                        # OR property=meta_key

                        # Case 1: <meta name="generator" content="WordPress ...">
                        tag_by_name = soup.find("meta", attrs={"name": meta_key})
                        if tag_by_name and meta_val.lower() in tag_by_name.get("content", "").lower():
                            detected[category].add(tool_name)
                            continue

                        # Case 2: Direct attribute match? (Less common for these rules, mainly name/content)

                # Check Scripts (src)
                if "script" in rules:
                    pattern = rules["script"]
                    # Check src attributes
                    for script in scripts:
                        src = script.get("src", "")
                        if src and pattern in src:
                            detected[category].add(tool_name)
                            break

                if "script_src" in rules:
                     pattern = rules["script_src"]
                     for script in scripts:
                        src = script.get("src", "")
                        if src and pattern in src:
                            detected[category].add(tool_name)
                            break

                # Check Script Content (Inline)
                if "script_content" in rules:
                    pattern = rules["script_content"]
                    for script in scripts:
                        if script.string and pattern in script.string:
                            detected[category].add(tool_name)
                            break

                # Check Raw HTML patterns
                if "html" in rules:
                    pattern = rules["html"]
                    if pattern in raw_html:
                        detected[category].add(tool_name)

tech_lookup_service = TechLookupService()
