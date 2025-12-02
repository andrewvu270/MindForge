"""
Caching Service for API responses
Simple in-memory cache with TTL support
"""
import asyncio
import logging
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
import hashlib
import json

logger = logging.getLogger(__name__)


class CacheEntry:
    """Single cache entry with expiration"""
    
    def __init__(self, value: Any, ttl_seconds: int):
        self.value = value
        self.expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
    
    def is_expired(self) -> bool:
        """Check if entry has expired"""
        return datetime.now() > self.expires_at


class CacheService:
    """
    In-memory cache with TTL support.
    Thread-safe for async operations.
    """
    
    # Default TTL values (in seconds)
    DEFAULT_TTL = {
        "hackernews": 1800,      # 30 minutes
        "reddit": 1800,          # 30 minutes
        "finance": 300,          # 5 minutes (market data changes frequently)
        "fred": 21600,           # 6 hours (economic data updates slowly)
        "google_books": 86400,   # 24 hours (book data rarely changes)
        "youtube": 3600,         # 1 hour
        "bbc_news": 900,         # 15 minutes (news updates frequently)
        "wikipedia": 21600,      # 6 hours
        "rss": 1800,             # 30 minutes
    }
    
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0
    
    def _generate_key(self, source: str, topic: str, **kwargs) -> str:
        """
        Generate cache key from source and parameters.
        
        Args:
            source: Source name (e.g., "hackernews")
            topic: Search topic
            **kwargs: Additional parameters
            
        Returns:
            Cache key string
        """
        # Create deterministic key from parameters
        params = {"source": source, "topic": topic, **kwargs}
        params_str = json.dumps(params, sort_keys=True)
        key_hash = hashlib.md5(params_str.encode()).hexdigest()
        return f"{source}:{key_hash}"
    
    async def get(self, source: str, topic: str, **kwargs) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            source: Source name
            topic: Search topic
            **kwargs: Additional parameters
            
        Returns:
            Cached value or None if not found/expired
        """
        key = self._generate_key(source, topic, **kwargs)
        
        async with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                self._misses += 1
                logger.debug(f"Cache MISS: {key}")
                return None
            
            if entry.is_expired():
                # Remove expired entry
                del self._cache[key]
                self._misses += 1
                logger.debug(f"Cache EXPIRED: {key}")
                return None
            
            self._hits += 1
            logger.debug(f"Cache HIT: {key}")
            return entry.value
    
    async def set(
        self,
        source: str,
        topic: str,
        value: Any,
        ttl: Optional[int] = None,
        **kwargs
    ):
        """
        Set value in cache with TTL.
        
        Args:
            source: Source name
            topic: Search topic
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if None)
            **kwargs: Additional parameters
        """
        key = self._generate_key(source, topic, **kwargs)
        
        # Use default TTL for source if not specified
        if ttl is None:
            ttl = self.DEFAULT_TTL.get(source, 1800)
        
        async with self._lock:
            self._cache[key] = CacheEntry(value, ttl)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
    
    async def invalidate(self, source: str, topic: str, **kwargs):
        """
        Invalidate a specific cache entry.
        
        Args:
            source: Source name
            topic: Search topic
            **kwargs: Additional parameters
        """
        key = self._generate_key(source, topic, **kwargs)
        
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache INVALIDATED: {key}")
    
    async def invalidate_pattern(self, source: str, topic: str):
        """
        Invalidate all cache entries matching source and topic (regardless of other params).
        
        Since we can't easily match by topic without storing metadata,
        this invalidates ALL entries for the given source.
        
        Args:
            source: Source name
            topic: Search topic (currently not used in matching, but kept for API compatibility)
        """
        async with self._lock:
            # Find all keys that match the source pattern
            keys_to_delete = [
                key for key in self._cache.keys()
                if key.startswith(f"{source}:")
            ]
            
            # Delete all matching keys
            for key in keys_to_delete:
                del self._cache[key]
            
            if keys_to_delete:
                logger.debug(f"Cache INVALIDATED {len(keys_to_delete)} entries for {source}")
    
    async def clear(self):
        """Clear all cache entries"""
        async with self._lock:
            self._cache.clear()
            logger.info("Cache cleared")
    
    async def clear_expired(self):
        """Remove all expired entries"""
        async with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry.is_expired()
            ]
            
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.info(f"Removed {len(expired_keys)} expired cache entries")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        total_requests = self._hits + self._misses
        hit_rate = (self._hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "size": len(self._cache),
            "hits": self._hits,
            "misses": self._misses,
            "total_requests": total_requests,
            "hit_rate_percent": round(hit_rate, 2)
        }
    
    def reset_stats(self):
        """Reset cache statistics"""
        self._hits = 0
        self._misses = 0


# Global cache instance
_cache_instance = None


def get_cache() -> CacheService:
    """Get or create global cache instance"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = CacheService()
    return _cache_instance
