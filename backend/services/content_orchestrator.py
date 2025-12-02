"""
Content Orchestration Service
Coordinates fetching content from multiple heterogeneous sources
"""
import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime

from .content_models import NormalizedContent
from .adapters.hackernews_adapter import HackerNewsAdapter
from .adapters.reddit_adapter import RedditAdapter
from .adapters.finance_adapter import FinanceAdapter
from .adapters.fred_adapter import FREDAdapter
from .adapters.googlebooks_adapter import GoogleBooksAdapter
from .adapters.youtube_adapter import YouTubeAdapter
from .adapters.bbcnews_adapter import BBCNewsAdapter
from .adapters.wikipedia_adapter import WikipediaAdapter
from .adapters.rss_adapter import RSSAdapter

logger = logging.getLogger(__name__)


class ContentOrchestrator:
    """
    Orchestrates multi-source content fetching.
    This is the "Frankenstein" orchestration layer that combines heterogeneous sources.
    """
    
    # Field to adapter mappings
    FIELD_ADAPTERS = {
        "tech": ["hackernews", "reddit", "youtube", "bbc_news", "wikipedia"],
        "technology": ["hackernews", "reddit", "youtube", "bbc_news", "wikipedia"],
        "ai": ["hackernews", "reddit", "youtube", "google_books", "wikipedia"],
        "finance": ["finance", "fred", "bbc_news", "wikipedia"],
        "economics": ["fred", "finance", "bbc_news", "wikipedia"],
        "business": ["finance", "bbc_news", "reddit", "wikipedia"],
        "culture": ["reddit", "bbc_news", "google_books", "wikipedia"],
        "influence": ["reddit", "google_books", "youtube", "wikipedia"],
        "global": ["bbc_news", "rss", "wikipedia"],
        "world": ["bbc_news", "rss", "wikipedia"],
        "news": ["bbc_news", "rss", "reddit", "wikipedia"],
        "books": ["google_books", "reddit", "wikipedia"],
        "video": ["youtube", "reddit", "wikipedia"],
        "education": ["youtube", "google_books", "reddit", "wikipedia"]
    }
    
    def __init__(self):
        """Initialize all adapters"""
        self.adapters = {
            "hackernews": HackerNewsAdapter(),
            "reddit": RedditAdapter(),
            "finance": FinanceAdapter(),
            "fred": FREDAdapter(),
            "google_books": GoogleBooksAdapter(),
            "youtube": YouTubeAdapter(),
            "bbc_news": BBCNewsAdapter(),
            "wikipedia": WikipediaAdapter(),
            "rss": RSSAdapter()
        }
    
    def _get_adapters_for_field(self, field: str) -> List[str]:
        """
        Get relevant adapters for a field.
        
        Args:
            field: Learning field
            
        Returns:
            List of adapter names
        """
        field_lower = field.lower()
        
        # Check if field matches
        for field_key, adapters in self.FIELD_ADAPTERS.items():
            if field_key in field_lower or field_lower in field_key:
                return adapters
        
        # Default: use wikipedia + rss
        return ["wikipedia", "rss"]
    
    async def fetch_multi_source(
        self,
        field: str,
        topic: str,
        num_sources: int = 3,
        items_per_source: int = 2
    ) -> List[NormalizedContent]:
        """
        Fetch content from multiple sources in parallel.
        
        Args:
            field: Learning field (tech, finance, etc.)
            topic: Specific topic to search for
            num_sources: Number of different sources to use
            items_per_source: Items to fetch from each source
            
        Returns:
            List of NormalizedContent from multiple sources
        """
        adapter_names = self._get_adapters_for_field(field)[:num_sources]
        
        logger.info(
            f"Fetching from {len(adapter_names)} sources for field '{field}', "
            f"topic '{topic}': {adapter_names}"
        )
        
        # Fetch from all adapters in parallel
        tasks = []
        for adapter_name in adapter_names:
            adapter = self.adapters.get(adapter_name)
            if adapter:
                task = adapter.fetch_and_normalize(topic, limit=items_per_source)
                tasks.append((adapter_name, task))
        
        # Wait for all fetches to complete
        results = await asyncio.gather(
            *[task for _, task in tasks],
            return_exceptions=True
        )
        
        # Collect successful results
        all_content = []
        for i, result in enumerate(results):
            adapter_name = tasks[i][0]
            
            if isinstance(result, Exception):
                logger.warning(f"Adapter {adapter_name} failed: {result}")
                continue
            
            if isinstance(result, list):
                all_content.extend(result)
                logger.info(f"Got {len(result)} items from {adapter_name}")
        
        logger.info(
            f"Total content fetched: {len(all_content)} items from "
            f"{len([r for r in results if not isinstance(r, Exception)])} sources"
        )
        
        return all_content
    
    async def fetch_with_fallback(
        self,
        field: str,
        topic: str,
        min_sources: int = 2,
        max_attempts: int = 3
    ) -> List[NormalizedContent]:
        """
        Fetch content with fallback to Wikipedia if primary sources fail.
        
        Args:
            field: Learning field
            topic: Topic to search for
            min_sources: Minimum number of sources required
            max_attempts: Maximum fetch attempts
            
        Returns:
            List of NormalizedContent
        """
        for attempt in range(max_attempts):
            content = await self.fetch_multi_source(
                field=field,
                topic=topic,
                num_sources=3 + attempt  # Try more sources on retry
            )
            
            # Check if we have enough sources
            unique_sources = len(set(c.source for c in content))
            
            if unique_sources >= min_sources and len(content) >= min_sources:
                return content
            
            logger.warning(
                f"Attempt {attempt + 1}: Only got {unique_sources} sources, "
                f"need {min_sources}. Retrying..."
            )
        
        # Final fallback: ensure we have Wikipedia
        if not any(c.source == "wikipedia" for c in content):
            logger.info("Adding Wikipedia as fallback source")
            wiki_adapter = self.adapters["wikipedia"]
            wiki_content = await wiki_adapter.fetch_and_normalize(topic, limit=2)
            content.extend(wiki_content)
        
        return content
    
    async def close_all(self):
        """Close all adapter connections"""
        for adapter in self.adapters.values():
            try:
                await adapter.close()
            except Exception as e:
                logger.warning(f"Failed to close adapter: {e}")
