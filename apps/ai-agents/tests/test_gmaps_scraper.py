import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.google_maps_scraper import GoogleMapsScraper

@pytest.mark.asyncio
async def test_search_places():
    with patch("services.google_maps_scraper.async_playwright") as mock_playwright:
        mock_p = AsyncMock()
        mock_playwright.return_value.__aenter__.return_value = mock_p

        mock_browser = AsyncMock()
        mock_p.chromium.launch.return_value = mock_browser

        mock_context = AsyncMock()
        mock_browser.new_context.return_value = mock_context

        mock_page = AsyncMock()
        mock_context.new_page.return_value = mock_page

        # Mock locator for cards
        mock_card = AsyncMock()
        mock_card.inner_text.return_value = "Pizzaria Test\n4.5 (100)\nItalian Restaurant"

        mock_locator_result = MagicMock()
        mock_locator_result.all = AsyncMock(return_value=[mock_card])

        mock_page.locator = MagicMock(return_value=mock_locator_result)

        scraper = GoogleMapsScraper()
        results = await scraper.search_places("Pizza")

        assert len(results) == 1
        assert results[0]["name"] == "Pizzaria Test"
        assert results[0]["rating"] == "4.5 (100)"
