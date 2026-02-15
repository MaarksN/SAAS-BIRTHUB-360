import pytest
from unittest.mock import MagicMock, patch
from services.domain_search import DomainSearchService

def test_whois_fallback():
    service = DomainSearchService()

    with patch("services.domain_search.whois.whois") as mock_whois:
        mock_w = MagicMock()
        mock_w.org = "Test Org"
        mock_w.city = "Test City"
        mock_w.country = "US"
        mock_w.creation_date = "2020-01-01"
        mock_whois.return_value = mock_w

        result = service.search_related_domains("test.com")

        assert result["domain"] == "test.com"
        assert result["registrant"]["org"] == "Test Org"
        assert result["source"] == "mock_fallback"
        assert result["related_domains"] == []

def test_serp_api_integration():
    with patch.dict("os.environ", {"SERP_API_KEY": "test_key"}):
        service = DomainSearchService()

        with patch("services.domain_search.GoogleSearch") as MockSearch:
            mock_instance = MockSearch.return_value
            mock_instance.get_dict.return_value = {
                "organic_results": [
                    {"link": "https://related1.com", "title": "Related 1"},
                    {"link": "https://related2.com", "title": "Related 2"}
                ]
            }

            # Also mock whois to avoid network
            with patch("services.domain_search.whois.whois") as mock_whois:
                mock_whois.side_effect = Exception("Whois timeout")

                result = service.search_related_domains("test.com")

                assert result["source"] == "serp_api"
                assert "https://related1.com" in result["related_domains"]
