import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.technology_lookup import TechLookupService

@pytest.mark.asyncio
async def test_tech_lookup_headers():
    service = TechLookupService()

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.headers = {
            "server": "nginx",
            "x-powered-by": "Next.js" # This might not catch if logic is case sensitive or strict, let's check signatures
        }
        # In our service: Nginx is in Generic Header Check.
        # Next.js is via script or meta, not x-powered-by in our simple dict.
        # Let's use Squarespace header
        mock_response.headers = {"server": "Squarespace"}
        mock_response.text = "<html></html>"

        mock_client.get.return_value = mock_response
        MockClient.return_value.__aenter__.return_value = mock_client

        result = await service.analyze_stack("https://squarespace-site.com")

        assert "CMS" in result
        assert "Squarespace" in result["CMS"]

@pytest.mark.asyncio
async def test_tech_lookup_html():
    service = TechLookupService()

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.headers = {}
        # Simulate WordPress + Google Analytics
        mock_response.text = """
        <html>
            <head>
                <meta name="generator" content="WordPress 6.0" />
                <script src="https://www.googletagmanager.com/gtag/js?id=UA-123"></script>
            </head>
            <body>
                <div class="wp-block">Content</div>
            </body>
        </html>
        """

        mock_client.get.return_value = mock_response
        MockClient.return_value.__aenter__.return_value = mock_client

        result = await service.analyze_stack("https://wp-site.com")

        assert "CMS" in result
        assert "WordPress" in result["CMS"]
        assert "Analytics" in result
        assert "Google Analytics" in result["Analytics"]
