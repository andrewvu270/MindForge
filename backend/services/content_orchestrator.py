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
from .cache_service import get_cache

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
        """Initialize all adapters and cache"""
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
        self.cache = get_cache()
    
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
        items_per_source: int = 2,
        use_cache: bool = True
    ) -> List[NormalizedContent]:
        """
        Fetch content from multiple sources in parallel with caching.
        
        Args:
            field: Learning field (tech, finance, etc.)
            topic: Specific topic to search for
            num_sources: Number of different sources to use
            items_per_source: Items to fetch from each source
            use_cache: Whether to use cache (default: True)
            
        Returns:
            List of NormalizedContent from multiple sources
        """
        adapter_names = self._get_adapters_for_field(field)[:num_sources]
        
        logger.info(
            f"Fetching from {len(adapter_names)} sources for field '{field}', "
            f"topic '{topic}': {adapter_names}"
        )
        
        # Fetch from all adapters in parallel (with caching)
        tasks = []
        for adapter_name in adapter_names:
            adapter = self.adapters.get(adapter_name)
            if adapter:
                task = self._fetch_with_cache(
                    adapter_name, 
                    adapter, 
                    topic, 
                    items_per_source,
                    use_cache
                )
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
    
    async def _fetch_with_cache(
        self,
        adapter_name: str,
        adapter,
        topic: str,
        limit: int,
        use_cache: bool = True
    ) -> List[NormalizedContent]:
        """
        Fetch content from a single adapter with caching.
        
        Args:
            adapter_name: Name of the adapter
            adapter: Adapter instance
            topic: Search topic
            limit: Number of items to fetch
            use_cache: Whether to use cache
            
        Returns:
            List of NormalizedContent
        """
        # Check cache first
        if use_cache:
            cached_content = await self.cache.get(
                source=adapter_name,
                topic=topic,
                limit=limit
            )
            
            if cached_content is not None:
                logger.info(f"Cache HIT for {adapter_name}:{topic}")
                return cached_content
        
        # Cache miss - fetch from adapter
        logger.info(f"Cache MISS for {adapter_name}:{topic} - fetching from API")
        content = await adapter.fetch_and_normalize(topic, limit=limit)
        
        # Store in cache
        if use_cache and content:
            await self.cache.set(
                source=adapter_name,
                topic=topic,
                value=content,
                limit=limit
            )
        
        return content
    
    async def fetch_with_fallback(
        self,
        field: str,
        topic: str,
        min_sources: int = 2,
        max_attempts: int = 3,
        use_internal_fallback: bool = True
    ) -> List[NormalizedContent]:
        """
        Fetch content with multiple fallback strategies.
        
        Fallback order:
        1. Try primary sources (with retries)
        2. Add Wikipedia if needed
        3. Use internal MindForge content if all external sources fail
        
        Args:
            field: Learning field
            topic: Topic to search for
            min_sources: Minimum number of sources required
            max_attempts: Maximum fetch attempts
            use_internal_fallback: Whether to use internal content as last resort
            
        Returns:
            List of NormalizedContent (always returns something, never empty)
        """
        # Track partial successes
        all_content = []
        
        # Attempt 1-3: Try with increasing number of sources
        for attempt in range(max_attempts):
            try:
                content = await self.fetch_multi_source(
                    field=field,
                    topic=topic,
                    num_sources=3 + attempt  # Try more sources on retry
                )
                
                # Accumulate all successful content
                all_content.extend(content)
                
                # Check if we have enough unique sources
                unique_sources = len(set(c.source for c in all_content))
                
                if unique_sources >= min_sources and len(all_content) >= min_sources:
                    logger.info(f"Successfully fetched from {unique_sources} sources")
                    return all_content
                
                logger.warning(
                    f"Attempt {attempt + 1}: Only got {unique_sources} sources, "
                    f"need {min_sources}. Retrying..."
                )
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed with error: {e}")
                continue
        
        # Fallback 1: Ensure Wikipedia is included
        if not any(c.source == "wikipedia" for c in all_content):
            logger.info("Fallback: Adding Wikipedia as supplemental source")
            try:
                wiki_adapter = self.adapters["wikipedia"]
                wiki_content = await wiki_adapter.fetch_and_normalize(topic, limit=2)
                all_content.extend(wiki_content)
            except Exception as e:
                logger.error(f"Wikipedia fallback failed: {e}")
        
        # Fallback 2: Use internal MindForge content if still insufficient
        if use_internal_fallback and len(all_content) < min_sources:
            logger.warning(
                f"External sources insufficient ({len(all_content)} items). "
                "Falling back to internal MindForge content"
            )
            try:
                internal_content = await self._fetch_internal_content(field, topic)
                all_content.extend(internal_content)
            except Exception as e:
                logger.error(f"Internal content fallback failed: {e}")
        
        # Return whatever we have (even if less than min_sources)
        if all_content:
            logger.info(
                f"Returning {len(all_content)} items from "
                f"{len(set(c.source for c in all_content))} sources"
            )
        else:
            logger.error("All fallback mechanisms failed - returning empty list")
        
        return all_content
    
    async def _fetch_internal_content(
        self,
        field: str,
        topic: str,
        limit: int = 2
    ) -> List[NormalizedContent]:
        """
        Fetch content from internal MindForge database as last resort fallback.
        
        Args:
            field: Learning field
            topic: Topic to search for
            limit: Maximum number of items to return
            
        Returns:
            List of NormalizedContent from internal database
        """
        from .content_models import SourceType
        
        # This is a placeholder - in a real implementation, you'd query Supabase
        # For now, return empty list (can be implemented when database integration is ready)
        logger.info(f"Internal content fallback for field='{field}', topic='{topic}'")
        
        # TODO: Implement actual database query when Supabase integration is ready
        # Example:
        # from database import get_supabase_client
        # supabase = get_supabase_client()
        # lessons = supabase.table('lessons').select('*').eq('field_id', field).ilike('title', f'%{topic}%').limit(limit).execute()
        # return [self._convert_lesson_to_normalized_content(lesson) for lesson in lessons.data]
        
        return []
    
    async def fetch_with_partial_success(
        self,
        field: str,
        topic: str,
        desired_sources: int = 3,
        min_acceptable: int = 1
    ) -> tuple[List[NormalizedContent], bool]:
        """
        Fetch content allowing partial success.
        
        Returns content even if not all desired sources succeed.
        Useful for graceful degradation.
        
        Args:
            field: Learning field
            topic: Topic to search for
            desired_sources: Ideal number of sources
            min_acceptable: Minimum acceptable sources (returns partial if >= this)
            
        Returns:
            Tuple of (content_list, is_complete)
            - content_list: All successfully fetched content
            - is_complete: True if got desired_sources, False if partial
        """
        content = await self.fetch_multi_source(
            field=field,
            topic=topic,
            num_sources=desired_sources
        )
        
        unique_sources = len(set(c.source for c in content))
        is_complete = unique_sources >= desired_sources
        is_acceptable = unique_sources >= min_acceptable
        
        if is_complete:
            logger.info(f"Complete success: {unique_sources}/{desired_sources} sources")
        elif is_acceptable:
            logger.warning(
                f"Partial success: {unique_sources}/{desired_sources} sources "
                f"(minimum {min_acceptable} met)"
            )
        else:
            logger.error(
                f"Insufficient sources: {unique_sources}/{desired_sources} "
                f"(minimum {min_acceptable} not met)"
            )
        
        return content, is_complete
    
    async def invalidate_cache(self, field: str = None, topic: str = None):
        """
        Invalidate cache entries.
        
        Args:
            field: Optional field to invalidate (invalidates all sources for that field)
            topic: Optional topic to invalidate
        """
        if field and topic:
            # Invalidate specific field+topic combination (all limits)
            adapter_names = self._get_adapters_for_field(field)
            for adapter_name in adapter_names:
                await self.cache.invalidate_pattern(source=adapter_name, topic=topic)
            logger.info(f"Invalidated cache for field '{field}', topic '{topic}'")
        elif topic:
            # Invalidate topic across all adapters (all limits)
            for adapter_name in self.adapters.keys():
                await self.cache.invalidate_pattern(source=adapter_name, topic=topic)
            logger.info(f"Invalidated cache for topic '{topic}' across all sources")
        else:
            # Clear entire cache
            await self.cache.clear()
            logger.info("Cleared entire cache")
    
    def get_cache_stats(self) -> Dict:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        return self.cache.get_stats()
    
    async def clear_expired_cache(self):
        """Remove expired cache entries"""
        await self.cache.clear_expired()
    
    async def close_all(self):
        """Close all adapter connections"""
        for adapter in self.adapters.values():
            try:
                await adapter.close()
            except Exception as e:
                logger.warning(f"Failed to close adapter: {e}")
