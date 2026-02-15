import os
import whois
from serpapi import GoogleSearch
from typing import Dict, List, Optional
from utils.logger import logger

class DomainSearchService:
    def __init__(self):
        self.serp_api_key = os.getenv("SERP_API_KEY")

    def search_related_domains(self, domain: str) -> Dict[str, any]:
        """
        Expands a domain to find ownership info and related subdomains/sites.
        """
        results = {
            "domain": domain,
            "registrant": None,
            "related_domains": [],
            "source": "mock_fallback"
        }

        # 1. Whois Lookup (Basic ownership)
        try:
            w = whois.whois(domain)
            results["registrant"] = {
                "org": w.org,
                "city": w.city,
                "country": w.country,
                "creation_date": str(w.creation_date)
            }
        except Exception as e:
            logger.warning(f"Whois lookup failed for {domain}: {str(e)}")

        # 2. SerpApi Lookup (Related sites via Google)
        if self.serp_api_key:
            try:
                # Query logic: "site:domain.com -www" or related keywords
                # Or better: "related:domain.com"
                params = {
                    "engine": "google",
                    "q": f"related:{domain}",
                    "api_key": self.serp_api_key
                }
                search = GoogleSearch(params)
                serp_results = search.get_dict()

                if "organic_results" in serp_results:
                    related = [r.get("link") for r in serp_results["organic_results"]]
                    results["related_domains"] = related
                    results["source"] = "serp_api"
                elif "error" in serp_results:
                    logger.warning(f"SerpApi error: {serp_results['error']}")

            except Exception as e:
                logger.error(f"SerpApi search failed: {str(e)}")

        return results

domain_search_service = DomainSearchService()
