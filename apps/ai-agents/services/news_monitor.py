import feedparser
import asyncio
from typing import List, Dict
from utils.logger import logger
from services.llm_service import LLMService

class NewsMonitorService:
    async def get_company_news(self, company_name: str) -> List[Dict[str, any]]:
        """
        Fetches and filters news for a company using Google News RSS and LLM classification.
        """
        # Google News RSS URL
        rss_url = f"https://news.google.com/rss/search?q={company_name}&hl=pt-BR&gl=BR&ceid=BR:pt-419"

        loop = asyncio.get_running_loop()

        try:
            # Parse feed in thread executor
            feed = await loop.run_in_executor(None, feedparser.parse, rss_url)

            entries = feed.entries[:10] # Limit to top 10

            if not entries:
                return []

            filtered_news = []

            # For each entry, we could use LLM to classify.
            # To save tokens/time, let's batch them or just check titles first.
            # For this implementation, we will batch titles and ask LLM to pick relevant ones.

            news_items = [{"title": e.title, "link": e.link, "published": e.published} for e in entries]

            prompt = f"""
            Analyze the following news headlines for the company '{company_name}'.
            Return a JSON list of indices (0-based) that represent "actionable" business events
            such as: Investments (Fundraising), Mergers & Acquisitions (M&A), New Executives (Hiring),
            Product Launches, or Expansion. Ignore general noise, stock fluctuations, or irrelevant articles.

            News Items:
            {self._format_news_list(news_items)}

            Return ONLY a JSON list of integers, e.g., [0, 2, 5]. If none, return [].
            """

            try:
                llm = LLMService()
                response_text = await llm.generate(prompt)

                # Simple parsing of JSON list from text response
                import json
                # Find array start/end
                start = response_text.find('[')
                end = response_text.rfind(']') + 1
                if start != -1 and end != -1:
                    indices = json.loads(response_text[start:end])
                    for idx in indices:
                        if 0 <= idx < len(news_items):
                            item = news_items[idx]
                            item["tag"] = "Actionable"
                            filtered_news.append(item)
                else:
                    logger.warning(f"Could not parse LLM response for news: {response_text}")

            except Exception as llm_error:
                logger.error(f"LLM classification failed, falling back to keywords: {llm_error}")
                # Fallback to keywords
                keywords = ["investimento", "aporte", "fusão", "aquisição", "contrata", "novo ceo", "expansão", "lança"]
                for item in news_items:
                    title_lower = item["title"].lower()
                    if any(k in title_lower for k in keywords):
                        item["tag"] = "Actionable"
                        filtered_news.append(item)

            return filtered_news

        except Exception as e:
            logger.error(f"Error fetching news for {company_name}: {str(e)}")
            return []

    def _format_news_list(self, items):
        return "\n".join([f"{i}. {item['title']}" for i, item in enumerate(items)])

news_monitor_service = NewsMonitorService()
