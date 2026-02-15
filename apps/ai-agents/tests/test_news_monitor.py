import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from services.news_monitor import NewsMonitorService

@pytest.mark.asyncio
async def test_get_company_news():
    with patch("services.news_monitor.feedparser.parse") as mock_parse:
        # Mock Feed
        mock_feed = MagicMock()
        entry1 = MagicMock()
        entry1.title = "Empresa X recebe investimento de 100M"
        entry1.link = "http://news.com/1"
        entry1.published = "2023-10-01"

        entry2 = MagicMock()
        entry2.title = "Ações da Empresa X caem 1%"
        entry2.link = "http://news.com/2"
        entry2.published = "2023-10-02"

        mock_feed.entries = [entry1, entry2]
        mock_parse.return_value = mock_feed

        # Mock LLM
        with patch("services.news_monitor.LLMService") as MockLLM:
            mock_llm_instance = MockLLM.return_value
            # Return index 0 as relevant
            mock_llm_instance.generate = AsyncMock(return_value="[0]")

            service = NewsMonitorService()
            news = await service.get_company_news("Empresa X")

            assert len(news) == 1
            assert news[0]["title"] == "Empresa X recebe investimento de 100M"
