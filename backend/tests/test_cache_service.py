"""
Tests for Cache Service
"""
import pytest
import asyncio
from datetime import datetime, timedelta

from services.cache_service import CacheService, CacheEntry, get_cache


@pytest.fixture
def cache():
    """Create fresh cache instance for each test"""
    return CacheService()


@pytest.fixture
def sample_data():
    """Sample data for caching"""
    return {
        "items": [
            {"id": 1, "title": "Test 1"},
            {"id": 2, "title": "Test 2"}
        ]
    }


# ============================================================================
# CacheEntry Tests
# ============================================================================


def test_cache_entry_creation():
    """Test creating a cache entry"""
    entry = CacheEntry("test_value", ttl_seconds=60)
    assert entry.value == "test_value"
    assert entry.expires_at > datetime.now()


def test_cache_entry_not_expired():
    """Test that fresh entry is not expired"""
    entry = CacheEntry("test_value", ttl_seconds=60)
    assert not entry.is_expired()


def test_cache_entry_expired():
    """Test that old entry is expired"""
    entry = CacheEntry("test_value", ttl_seconds=0)
    # Wait a tiny bit to ensure expiration
    import time
    time.sleep(0.01)
    assert entry.is_expired()


# ============================================================================
# CacheService Tests
# ============================================================================


def test_cache_initialization(cache):
    """Test cache initializes correctly"""
    assert cache._cache == {}
    assert cache._hits == 0
    assert cache._misses == 0


def test_cache_default_ttl_values(cache):
    """Test that default TTL values are set"""
    assert cache.DEFAULT_TTL["hackernews"] == 1800
    assert cache.DEFAULT_TTL["reddit"] == 1800
    assert cache.DEFAULT_TTL["finance"] == 300
    assert cache.DEFAULT_TTL["fred"] == 21600
    assert cache.DEFAULT_TTL["google_books"] == 86400
    assert cache.DEFAULT_TTL["youtube"] == 3600
    assert cache.DEFAULT_TTL["bbc_news"] == 900
    assert cache.DEFAULT_TTL["wikipedia"] == 21600


def test_generate_key(cache):
    """Test cache key generation"""
    key1 = cache._generate_key("hackernews", "python")
    key2 = cache._generate_key("hackernews", "python")
    key3 = cache._generate_key("hackernews", "javascript")
    
    # Same params should generate same key
    assert key1 == key2
    
    # Different params should generate different key
    assert key1 != key3


def test_generate_key_with_kwargs(cache):
    """Test cache key generation with additional parameters"""
    key1 = cache._generate_key("hackernews", "python", limit=5)
    key2 = cache._generate_key("hackernews", "python", limit=10)
    
    # Different kwargs should generate different keys
    assert key1 != key2


@pytest.mark.asyncio
async def test_set_and_get(cache, sample_data):
    """Test setting and getting cache values"""
    await cache.set("hackernews", "python", sample_data)
    
    result = await cache.get("hackernews", "python")
    assert result == sample_data


@pytest.mark.asyncio
async def test_get_miss(cache):
    """Test cache miss returns None"""
    result = await cache.get("hackernews", "python")
    assert result is None


@pytest.mark.asyncio
async def test_get_expired(cache, sample_data):
    """Test that expired entries return None"""
    # Set with 0 TTL (immediately expired)
    await cache.set("hackernews", "python", sample_data, ttl=0)
    
    # Wait a bit
    await asyncio.sleep(0.01)
    
    result = await cache.get("hackernews", "python")
    assert result is None


@pytest.mark.asyncio
async def test_set_with_custom_ttl(cache, sample_data):
    """Test setting cache with custom TTL"""
    await cache.set("hackernews", "python", sample_data, ttl=3600)
    
    result = await cache.get("hackernews", "python")
    assert result == sample_data


@pytest.mark.asyncio
async def test_set_uses_default_ttl(cache, sample_data):
    """Test that set uses default TTL when not specified"""
    await cache.set("hackernews", "python", sample_data)
    
    # Check that entry exists and has correct TTL
    key = cache._generate_key("hackernews", "python")
    assert key in cache._cache
    
    entry = cache._cache[key]
    # TTL should be approximately 1800 seconds (30 minutes) for hackernews
    time_diff = (entry.expires_at - datetime.now()).total_seconds()
    assert 1790 < time_diff < 1810


@pytest.mark.asyncio
async def test_invalidate(cache, sample_data):
    """Test invalidating specific cache entry"""
    await cache.set("hackernews", "python", sample_data)
    
    # Verify it's cached
    result = await cache.get("hackernews", "python")
    assert result == sample_data
    
    # Invalidate
    await cache.invalidate("hackernews", "python")
    
    # Should be gone
    result = await cache.get("hackernews", "python")
    assert result is None


@pytest.mark.asyncio
async def test_clear(cache, sample_data):
    """Test clearing entire cache"""
    await cache.set("hackernews", "python", sample_data)
    await cache.set("reddit", "javascript", sample_data)
    
    await cache.clear()
    
    assert await cache.get("hackernews", "python") is None
    assert await cache.get("reddit", "javascript") is None


@pytest.mark.asyncio
async def test_clear_expired(cache, sample_data):
    """Test clearing only expired entries"""
    # Add fresh entry
    await cache.set("hackernews", "python", sample_data, ttl=3600)
    
    # Add expired entry
    await cache.set("reddit", "javascript", sample_data, ttl=0)
    await asyncio.sleep(0.01)
    
    # Clear expired
    await cache.clear_expired()
    
    # Fresh entry should still exist
    assert await cache.get("hackernews", "python") == sample_data
    
    # Expired entry should be gone
    assert await cache.get("reddit", "javascript") is None


@pytest.mark.asyncio
async def test_get_stats(cache, sample_data):
    """Test getting cache statistics"""
    # Initial stats
    stats = cache.get_stats()
    assert stats["hits"] == 0
    assert stats["misses"] == 0
    assert stats["size"] == 0
    assert stats["hit_rate_percent"] == 0
    
    # Cache miss
    await cache.get("hackernews", "python")
    stats = cache.get_stats()
    assert stats["misses"] == 1
    
    # Cache set
    await cache.set("hackernews", "python", sample_data)
    stats = cache.get_stats()
    assert stats["size"] == 1
    
    # Cache hit
    await cache.get("hackernews", "python")
    stats = cache.get_stats()
    assert stats["hits"] == 1
    assert stats["hit_rate_percent"] == 50.0  # 1 hit, 1 miss = 50%


@pytest.mark.asyncio
async def test_reset_stats(cache, sample_data):
    """Test resetting cache statistics"""
    await cache.set("hackernews", "python", sample_data)
    await cache.get("hackernews", "python")
    
    stats = cache.get_stats()
    assert stats["hits"] > 0 or stats["misses"] > 0
    
    cache.reset_stats()
    
    stats = cache.get_stats()
    assert stats["hits"] == 0
    assert stats["misses"] == 0


@pytest.mark.asyncio
async def test_concurrent_access(cache, sample_data):
    """Test that cache is thread-safe for concurrent access"""
    async def set_and_get(source, topic):
        await cache.set(source, topic, sample_data)
        result = await cache.get(source, topic)
        return result
    
    # Run multiple concurrent operations
    tasks = [
        set_and_get(f"source_{i}", f"topic_{i}")
        for i in range(10)
    ]
    
    results = await asyncio.gather(*tasks)
    
    # All should succeed
    assert all(r == sample_data for r in results)


@pytest.mark.asyncio
async def test_cache_with_kwargs(cache, sample_data):
    """Test caching with additional kwargs"""
    await cache.set("hackernews", "python", sample_data, limit=5)
    
    # Same kwargs should hit cache
    result = await cache.get("hackernews", "python", limit=5)
    assert result == sample_data
    
    # Different kwargs should miss cache
    result = await cache.get("hackernews", "python", limit=10)
    assert result is None


# ============================================================================
# Global Cache Instance Tests
# ============================================================================


def test_get_cache_singleton():
    """Test that get_cache returns singleton instance"""
    cache1 = get_cache()
    cache2 = get_cache()
    
    assert cache1 is cache2


@pytest.mark.asyncio
async def test_get_cache_persists_data(sample_data):
    """Test that global cache persists data across calls"""
    cache1 = get_cache()
    await cache1.set("test", "topic", sample_data)
    
    cache2 = get_cache()
    result = await cache2.get("test", "topic")
    
    assert result == sample_data
