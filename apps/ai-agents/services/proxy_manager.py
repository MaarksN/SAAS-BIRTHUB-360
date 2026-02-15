import os
import random
from typing import List, Optional
from utils.logger import logger

class ProxyManager:
    def __init__(self):
        self.proxies: List[str] = []
        self._load_proxies()
        self.current_index = 0

    def _load_proxies(self):
        # 1. Check for ZenRows API Key (Priority for Scraper)
        zenrows_key = os.getenv("ZENROWS_API_KEY")
        if zenrows_key:
            # Construct ZenRows Proxy URL
            # Format: http://<API_KEY>:js_render=true&antibot=true@proxy.zenrows.com:8001
            # Note: The parameters might need URL encoding or specific format.
            # For simplicity, we assume the standard format.
            zenrows_proxy = f"http://{zenrows_key}:@proxy.zenrows.com:8001"
            self.proxies.append(zenrows_proxy)
            logger.info("Loaded ZenRows proxy configuration")

        # 2. Check for PROXY_LIST env var
        proxy_list = os.getenv("PROXY_LIST")
        if proxy_list:
            custom_proxies = [p.strip() for p in proxy_list.split(",") if p.strip()]
            self.proxies.extend(custom_proxies)
            logger.info(f"Loaded {len(custom_proxies)} custom proxies from environment")

        if not self.proxies:
            logger.warning("No proxies configured. Scraper will run in direct mode (high risk of blocking).")

    def get_next_proxy(self) -> Optional[str]:
        if not self.proxies:
            return None

        # Round-robin selection
        proxy = self.proxies[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.proxies)
        return proxy

    def report_failure(self, proxy: str):
        logger.warning(f"Proxy reported failure: {proxy}")
        # Logic to temporarily disable proxy could be added here
