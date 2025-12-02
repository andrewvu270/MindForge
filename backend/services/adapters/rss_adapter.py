"""
RSS Feed Adapter
Fetches news from RSS feeds (BBC, Reuters, etc.)
"""
import feedparser
import logging
from typing import List, Optional
from datetime import datetime
import asyncio

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class RSSAdapter(SourceAdapter):
    """
    Adapter for RSS news feeds
    No authentication required
    """
    
    # RSS feed URLs for different topics
    FEED_URLS = {
        "tech": [
            "https://feeds.bbci.co.uk/news/technology/rss.xml",
            "https://www.wired.com/feed/rss"
        ],
        "technology": [
            "https://feeds.bbci.co.uk/news/technology/rss.xml",
            "https://www.wired.com/feed/rss"
        ],
        "business": [
            "https://feeds.bbci.co.uk/news/business/rss.xml"
        ],
        "finance": [
            "https://feeds.bbci.co.uk/news/business/rss.xml"
        ],
        "world": [
            "https://feeds.bbci.co.uk/news/world/rss.xml",
            "https://www.reuters.com/rssfeed/world"
        ],
        "global": [
            "https://feeds.bbci.co.uk/news/world/rss.xml"
        ],
        "science": [
            "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"
        ]
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def _get_feeds_for_topic(self, topic: str) -> List[str]:
        """
        Get relevant RSS feeds based on topic.
        
        Args:
            topic: Topic or category name
            
        Returns:
            List of RSS feed URLs
        """
        topic_lower = topic.lower()
        
        # Check if topic matches a category
        for category, feeds in self.FEED_URLS.items():
            if category in topic_lower or topic_lower in category:
                return feeds
        
        # Default to world news
        return self.FEED_URLS.get("world", [])
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch news articles from RSS feeds.
        
        Args:
            topic: Topic or category
            limit: Maximum number of articles to fetch
            
        Returns:
            List of article dictionaries
        """
        async def _fetch_feeds():
            feed_urls = self._get_feeds_for_topic(topic)
            all_entries = []
            
            for feed_url in feed_urls:
                try:
                    # feedparser is synchronous, run in thread pool
                    feed = await asyncio.to_thread(feedparser.parse, feed_url)
                    
                    # Extract entries
                    for entry in feed.entries[:limit]:
                        all_entries.append({
                            "title": entry.get("title", ""),
                            "summary": entry.get("summary", ""),
                            "link": entry.get("link", ""),
                            "published": entry.get("published", ""),
                            "source": feed.feed.get("title", "RSS Feed")
                        })
                    
                    # Stop if we have enough entries
                    if len(all_entries) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch RSS feed {feed_url}: {e}")
                    continue
            
            return all_entries[:limit]
        
        return await self._retry_request(_fetch_feeds)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize RSS entry to standard format.
        
        Args:
            raw_content: Raw RSS entry dict
            
        Returns:
            NormalizedContent object
        """
        title = raw_content.get("title", "Untitled")
        summary = raw_content.get("summary", "")
        link = raw_content.get("link", "")
        published = raw_content.get("published", "")
        source = raw_content.get("source", "RSS Feed")
        
        # Clean up summary (remove HTML tags)
        import re
        clean_summary = re.sub(r'<[^>]+>', '', summary)
        
        # Truncate if too long
        if len(clean_summary) > 500:
            clean_summary = clean_summary[:500] + "..."
        
        content = clean_summary if clean_summary else title
        
        return NormalizedContent(
            source="rss_news",
            source_type=SourceType.NEWS,
            title=title,
            content=content,
            url=link,
            metadata={
                "published": published,
                "feed_source": source
            },
            fetched_at=datetime.now()
        )
    
    async def close(self):
        """No client to close for RSS"""
        pass
