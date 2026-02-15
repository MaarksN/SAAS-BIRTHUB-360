import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.linkedin_scraper import LinkedInScraper

@pytest.mark.asyncio
async def test_scrape_profile_success():
    # Mock Playwright
    with patch('services.linkedin_scraper.async_playwright') as mock_playwright:
        # Setup the mock chain
        mock_p = AsyncMock()
        mock_playwright.return_value.__aenter__.return_value = mock_p

        mock_browser = AsyncMock()
        mock_p.chromium.launch.return_value = mock_browser

        mock_context = AsyncMock()
        mock_browser.new_context.return_value = mock_context

        mock_page = AsyncMock()
        mock_context.new_page.return_value = mock_page

        # Mock page methods
        mock_page.goto.return_value = None
        mock_page.url = "https://linkedin.com/in/test"
        mock_page.content.return_value = "<html><body><h1>Test User</h1></body></html>"
        mock_page.title.return_value = "Test User | LinkedIn"

        # Mock Name extraction (H1)
        mock_h1 = AsyncMock()
        mock_h1.inner_text.return_value = "Test User"
        mock_page.query_selector.return_value = mock_h1

        # Mock Headline
        mock_page.get_attribute.return_value = "Test Headline"

        # Mock Sections (About, Experience, etc)
        # page.locator is synchronous, so we use MagicMock
        mock_locator_result = MagicMock()
        mock_element = AsyncMock()
        mock_element.count.return_value = 0 # No sections found by default
        mock_locator_result.first = mock_element

        # Make page.locator a Mock (synchronous) that returns the locator result
        mock_page.locator = MagicMock(return_value=mock_locator_result)

        scraper = LinkedInScraper()
        result = await scraper.scrape_profile("https://linkedin.com/in/test")

        assert result["status"] == "success"
        assert result["data"]["name"] == "Test User"
        assert result["data"]["headline"] == "Test Headline"

@pytest.mark.asyncio
async def test_scrape_profile_authwall():
    with patch('services.linkedin_scraper.async_playwright') as mock_playwright:
        mock_p = AsyncMock()
        mock_playwright.return_value.__aenter__.return_value = mock_p
        mock_browser = AsyncMock()
        mock_p.chromium.launch.return_value = mock_browser
        mock_context = AsyncMock()
        mock_browser.new_context.return_value = mock_context
        mock_page = AsyncMock()
        mock_context.new_page.return_value = mock_page

        # Simulate Authwall URL redirect
        mock_page.goto.return_value = None
        mock_page.url = "https://www.linkedin.com/authwall?trk=..."

        scraper = LinkedInScraper()
        result = await scraper.scrape_profile("https://linkedin.com/in/test")

        assert result["status"] == "failed"
        assert result["error"] == "authwall_detected"

@pytest.mark.asyncio
async def test_scrape_profile_timeout():
    with patch('services.linkedin_scraper.async_playwright') as mock_playwright:
        mock_p = AsyncMock()
        mock_playwright.return_value.__aenter__.return_value = mock_p
        mock_browser = AsyncMock()
        mock_p.chromium.launch.return_value = mock_browser

        # Simulate TimeoutError
        from playwright.async_api import TimeoutError as PlaywrightTimeoutError
        mock_browser.new_context.side_effect = PlaywrightTimeoutError("Timeout")

        scraper = LinkedInScraper()
        result = await scraper.scrape_profile("https://linkedin.com/in/test")

        assert result["status"] == "failed"
        assert result["error"] == "timeout"
