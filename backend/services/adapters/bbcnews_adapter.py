"""
BBC News API Adapter
Fetches latest news articles from BBC
Note: BBC doesn't have an official public API, so we'll use NewsAPI.org which includes BBC
"""
import aiohttp
import logging
from typing import List, Optional
from datetime import datetime, timedelta
import os

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class BBCNewsAdapter(SourceAdapter):
    """
    Adapter for BBC News via NewsAPI.org
    Requires API key from: https://newsapi.org/register
    Free tier: 100 requests/day, 1 request/second
    """
    
    BASE_URL = "https://newsapi.org/v2"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or os.getenv("NEWS_API_KEY")
        if not self.api_key:
            logger.warning("NewsAPI key not provided. Set NEWS_API_KEY environment variable.")
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch BBC news articles related to the topic.
        
        Args:
            topic: Search query for news articles
            limit: Maximum number of articles to fetch
            
        Returns:
            List of news article dictionaries
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []
        
        async def _fetch_data():
            results = []
            
            async with aiohttp.ClientSession() as session:
                try:
                    # Search for articles from BBC
                    params = {
                        "q": topic,
                        "sources": "bbc-news",
                        "language": "en",
                        "sortBy": "relevancy",
                        "pageSize": min(limit, 100),  # API max is 100
                        "apiKey": self.api_key,
                    }
                    
                    async with session.get(
                        f"{self.BASE_URL}/everything",
                        params=params,
                        timeout=self.timeout
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            articles = data.get("articles", [])
                            
                            for article in articles[:limit]:
                                results.append({
                                    "title": article.get("title"),
                                    "description": article.get("description"),
                                    "content": article.get("content"),
                                    "url": article.get("url"),
                                    "image_url": article.get("urlToImage"),
                                    "published_at": article.get("publishedAt"),
                                    "author": article.get("author"),
                                    "source": article.get("source", {}).get("name", "BBC News"),
                                })
                        
                        elif response.status == 401:
                            logger.error("NewsAPI authentication failed - invalid API key")
                        elif response.status == 429:
                            logger.warning("NewsAPI rate limit exceeded")
                        else:
                            logger.warning(f"NewsAPI returned status {response.status}")
                
                except Exception as e:
                    logger.warning(f"Failed to fetch from NewsAPI: {e}")
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    async def fetch_top_headlines(self, category: Optional[str] = None, limit: int = 5) -> List[dict]:
        """
        Fetch top headlines from BBC News.
        
        Args:
            category: News category (business, entertainment, general, health, science, sports, technology)
            limit: Maximum number of articles to fetch
            
        Returns:
            List of news article dictionaries
        """
        if not self.api_key:
            logger.error("NewsAPI key not configured")
            return []
        
        async def _fetch_data():
            results = []
            
            async with aiohttp.ClientSession() as session:
                try:
                    params = {
                        "sources": "bbc-news",
                        "pageSize": min(limit, 100),
                        "apiKey": self.api_key,
                    }
                    
                    if category:
                        params["category"] = category
                    
                    async with session.get(
                        f"{self.BASE_URL}/top-headlines",
                        params=params,
                        timeout=self.timeout
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            articles = data.get("articles", [])
                            
                            for article in articles[:limit]:
                                results.append({
                                    "title": article.get("title"),
                                    "description": article.get("description"),
                                    "content": article.get("content"),
                                    "url": article.get("url"),
                                    "image_url": article.get("urlToImage"),
                                    "published_at": article.get("publishedAt"),
                                    "author": article.get("author"),
                                    "source": article.get("source", {}).get("name", "BBC News"),
                                })
                        else:
                            logger.warning(f"NewsAPI top headlines returned status {response.status}")
                
                except Exception as e:
                    logger.warning(f"Failed to fetch top headlines: {e}")
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize BBC News data to standard format.
        
        Args:
            raw_content: Raw news article dict
            
        Returns:
            NormalizedContent object with article information
        """
        title = raw_content.get("title", "Untitled Article")
        description = raw_content.get("description", "")
        content = raw_content.get("content", "")
        url = raw_content.get("url", "")
        published_at = raw_content.get("published_at", "")
        author = raw_content.get("author")
        source = raw_content.get("source", "BBC News")
        
        # Build human-readable content
        content_parts = []
        
        # Source and author
        source_info = source
        if author:
            source_info += f" • By {author}"
        content_parts.append(source_info)
        
        # Published date
        if published_at:
            try:
                pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                # Calculate time ago
                now = datetime.now(pub_date.tzinfo)
                time_diff = now - pub_date
                
                if time_diff.days > 0:
                    time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
                elif time_diff.seconds >= 3600:
                    hours = time_diff.seconds // 3600
                    time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
                else:
                    minutes = time_diff.seconds // 60
                    time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
                
                content_parts.append(f"Published: {time_ago}")
            except:
                content_parts.append(f"Published: {published_at}")
        
        # Description
        if description:
            content_parts.append(f"\n{description}")
        
        # Content (truncated, as NewsAPI only provides partial content)
        if content and content != description:
            # NewsAPI truncates content with [+X chars]
            content_parts.append(f"\n{content}")
        
        content_text = "\n".join(content_parts)
        
        return NormalizedContent(
            source="bbc_news",
            source_type=SourceType.NEWS,
            title=title,
            content=content_text,
            url=url,
            metadata={
                "author": author,
                "published_at": published_at,
                "source_name": source,
                "image_url": raw_content.get("image_url"),
            },
            fetched_at=datetime.now()
        )
