"""
Tests for Content Orchestrator
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from services.content_orchestrator import ContentOrchestrator
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def orchestrator():
    """Create ContentOrchestrator instance"""
    return ContentOrchestrator()


@pytest.fixture
def mock_content():
    """Create mock normalized content"""
    return [
        NormalizedContent(
            source="hackernews",
            source_type=SourceType.DISCUSSION,
            title="Test HN Article",
            content="Test content from HackerNews",
            url="https://news.ycombinator.com/item?id=123",
            fetched_at=datetime.now()
        ),
        NormalizedContent(
            source="reddit",
            source_type=SourceType.DISCUSSION,
            title="Test Reddit Post",
            content="Test content from Reddit",
            url="https://reddit.com/r/test/123",
            fetched_at=datetime.now()
        )
    ]


def test_orchestrator_initialization(orchestrator):
    """Test orchestrator initializes with all adapters"""
    assert "hackernews" in orchestrator.adapters
    assert "reddit" in orchestrator.adapters
    assert "finance" in orchestrator.adapters
    assert "fred" in orchestrator.adapters
    assert "google_books" in orchestrator.adapters
    assert "youtube" in orchestrator.adapters
    assert "bbc_news" in orchestrator.adapters
    assert "wikipedia" in orchestrator.adapters
    assert "rss" in orchestrator.adapters
    assert len(orchestrator.adapters) == 9


def test_get_adapters_for_field_tech(orchestrator):
    """Test adapter selection for tech field"""
    adapters = orchestrator._get_adapters_for_field("tech")
    assert "hackernews" in adapters
    assert "reddit" in adapters
    assert "youtube" in adapters


def test_get_adapters_for_field_finance(orchestrator):
    """Test adapter selection for finance field"""
    adapters = orchestrator._get_adapters_for_field("finance")
    assert "finance" in adapters
    assert "fred" in adapters


def test_get_adapters_for_field_economics(orchestrator):
    """Test adapter selection for economics field"""
    adapters = orchestrator._get_adapters_for_field("economics")
    assert "fred" in adapters
    assert "finance" in adapters


def test_get_adapters_for_field_books(orchestrator):
    """Test adapter selection for books field"""
    adapters = orchestrator._get_adapters_for_field("books")
    assert "google_books" in adapters


def test_get_adapters_for_field_video(orchestrator):
    """Test adapter selection for video field"""
    adapters = orchestrator._get_adapters_for_field("video")
    assert "youtube" in adapters


def test_get_adapters_for_field_news(orchestrator):
    """Test adapter selection for news field"""
    adapters = orchestrator._get_adapters_for_field("news")
    assert "bbc_news" in adapters


def test_get_adapters_for_field_unknown(orchestrator):
    """Test adapter selection for unknown field defaults to wikipedia + rss"""
    adapters = orchestrator._get_adapters_for_field("unknown_field_xyz")
    assert "wikipedia" in adapters
    assert "rss" in adapters


@pytest.mark.asyncio
async def test_fetch_multi_source(orchestrator, mock_content):
    """Test fetching from multiple sources"""
    # Mock the fetch_and_normalize method for all adapters
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
    
    results = await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=2,
        items_per_source=1
    )
    
    assert len(results) >= 1
    assert all(isinstance(item, NormalizedContent) for item in results)


@pytest.mark.asyncio
async def test_fetch_multi_source_with_failures(orchestrator, mock_content):
    """Test fetching handles adapter failures gracefully"""
    # Mock one adapter to succeed, one to fail
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    orchestrator.adapters["reddit"].fetch_and_normalize = AsyncMock(
        side_effect=Exception("API Error")
    )
    
    results = await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=2
    )
    
    # Should still get results from successful adapter
    assert len(results) >= 1


@pytest.mark.asyncio
async def test_fetch_multi_source_respects_limits(orchestrator, mock_content):
    """Test that num_sources and items_per_source are respected"""
    # Clear cache first to ensure fresh fetch
    await orchestrator.cache.clear()
    
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(return_value=mock_content)
    
    results = await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1,
        items_per_source=2,
        use_cache=False  # Disable cache for this test
    )
    
    # Should call fetch_and_normalize with limit=2
    called_adapters = [
        adapter for adapter in orchestrator.adapters.values()
        if adapter.fetch_and_normalize.called
    ]
    
    assert len(called_adapters) >= 1
    for adapter in called_adapters:
        adapter.fetch_and_normalize.assert_called_with("python", limit=2)


@pytest.mark.asyncio
async def test_fetch_with_fallback_success(orchestrator, mock_content):
    """Test fetch with fallback succeeds on first try"""
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
    
    results = await orchestrator.fetch_with_fallback(
        field="tech",
        topic="python",
        min_sources=2
    )
    
    assert len(results) >= 2


@pytest.mark.asyncio
async def test_fetch_with_fallback_adds_wikipedia(orchestrator, mock_content):
    """Test fetch with fallback adds Wikipedia when needed"""
    # Clear cache first
    await orchestrator.cache.clear()
    
    # Create a modified mock content with wikipedia source
    wiki_content = [
        NormalizedContent(
            source="wikipedia",
            source_type=SourceType.TEXT,
            title="Test Wikipedia Article",
            content="Test content from Wikipedia",
            url="https://en.wikipedia.org/wiki/Test",
            fetched_at=datetime.now()
        )
    ]
    
    # Mock most adapters to return empty
    for name, adapter in orchestrator.adapters.items():
        if name == "wikipedia":
            adapter.fetch_and_normalize = AsyncMock(return_value=wiki_content)
        else:
            adapter.fetch_and_normalize = AsyncMock(return_value=[])
    
    results = await orchestrator.fetch_with_fallback(
        field="tech",
        topic="python_unique_topic_123",  # Use unique topic to avoid cache
        min_sources=1,
        use_internal_fallback=False  # Disable internal fallback for this test
    )
    
    # Should have Wikipedia content
    assert any(c.source == "wikipedia" for c in results)


@pytest.mark.asyncio
async def test_fetch_with_partial_success(orchestrator, mock_content):
    """Test partial success handling"""
    await orchestrator.cache.clear()
    
    # Mock only 2 adapters to succeed
    success_count = 0
    for name, adapter in orchestrator.adapters.items():
        if success_count < 2:
            adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
            success_count += 1
        else:
            adapter.fetch_and_normalize = AsyncMock(return_value=[])
    
    content, is_complete = await orchestrator.fetch_with_partial_success(
        field="tech",
        topic="python_partial_test",
        desired_sources=3,
        min_acceptable=1
    )
    
    # Should have some content
    assert len(content) > 0
    # Should not be complete (wanted 3, got 2)
    assert not is_complete


@pytest.mark.asyncio
async def test_fetch_with_fallback_handles_all_failures(orchestrator):
    """Test that fallback returns empty list when all sources fail"""
    await orchestrator.cache.clear()
    
    # Mock all adapters to fail
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(side_effect=Exception("API Error"))
    
    results = await orchestrator.fetch_with_fallback(
        field="tech",
        topic="python_all_fail_test",
        min_sources=1,
        use_internal_fallback=False
    )
    
    # Should return empty list when all fail
    assert results == []


@pytest.mark.asyncio
async def test_fetch_with_fallback_accumulates_partial_results(orchestrator, mock_content):
    """Test that fallback accumulates results from partial successes"""
    await orchestrator.cache.clear()
    
    # Mock some adapters to succeed
    for i, (name, adapter) in enumerate(orchestrator.adapters.items()):
        if i < 2:
            adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
        else:
            adapter.fetch_and_normalize = AsyncMock(return_value=[])
    
    results = await orchestrator.fetch_with_fallback(
        field="tech",
        topic="python_accumulate_test",
        min_sources=2,
        use_internal_fallback=False
    )
    
    # Should have accumulated results from successful adapters
    assert len(results) >= 2


@pytest.mark.asyncio
async def test_fetch_multi_source_parallel_execution(orchestrator, mock_content):
    """Test that sources are fetched in parallel"""
    import time
    
    async def slow_fetch(*args, **kwargs):
        await asyncio.sleep(0.1)
        return mock_content[:1]
    
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = slow_fetch
    
    start_time = time.time()
    await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=3
    )
    elapsed = time.time() - start_time
    
    # Should take ~0.1s (parallel) not ~0.3s (sequential)
    assert elapsed < 0.25


@pytest.mark.asyncio
async def test_close_all(orchestrator):
    """Test closing all adapters"""
    # Mock close methods
    for adapter in orchestrator.adapters.values():
        adapter.close = AsyncMock()
    
    await orchestrator.close_all()
    
    # All adapters should have close called
    for adapter in orchestrator.adapters.values():
        adapter.close.assert_called_once()


@pytest.mark.asyncio
async def test_close_all_handles_errors(orchestrator):
    """Test close_all handles errors gracefully"""
    # Mock one adapter to fail on close
    orchestrator.adapters["hackernews"].close = AsyncMock(
        side_effect=Exception("Close error")
    )
    
    for name, adapter in orchestrator.adapters.items():
        if name != "hackernews":
            adapter.close = AsyncMock()
    
    # Should not raise exception
    await orchestrator.close_all()


# Import asyncio for the parallel test
import asyncio


# ============================================================================
# Cache Tests
# ============================================================================


@pytest.mark.asyncio
async def test_cache_initialization(orchestrator):
    """Test that cache is initialized"""
    assert orchestrator.cache is not None


@pytest.mark.asyncio
async def test_fetch_with_cache_hit(orchestrator, mock_content):
    """Test that cache is used on second fetch"""
    # Clear cache and use unique topic
    await orchestrator.cache.clear()
    unique_topic = "python_cache_test_unique"
    
    # Mock adapter
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # First fetch - should hit API
    results1 = await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1,
        items_per_source=2
    )
    
    # Second fetch - should hit cache
    results2 = await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1,
        items_per_source=2
    )
    
    # Adapter should only be called once (first time)
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 1
    
    # Results should be the same
    assert len(results1) == len(results2)


@pytest.mark.asyncio
async def test_fetch_without_cache(orchestrator, mock_content):
    """Test fetching with cache disabled"""
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # First fetch
    await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1,
        use_cache=False
    )
    
    # Second fetch
    await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1,
        use_cache=False
    )
    
    # Adapter should be called twice (cache disabled)
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 2


@pytest.mark.asyncio
async def test_cache_invalidation_specific(orchestrator, mock_content):
    """Test invalidating specific cache entry"""
    await orchestrator.cache.clear()
    unique_topic = "python_invalidate_test"
    
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # First fetch
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1
    )
    
    # Invalidate cache
    await orchestrator.invalidate_cache(field="tech", topic=unique_topic)
    
    # Second fetch - should hit API again
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1
    )
    
    # Adapter should be called twice
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 2


@pytest.mark.asyncio
async def test_cache_invalidation_all(orchestrator, mock_content):
    """Test clearing entire cache"""
    await orchestrator.cache.clear()
    unique_topic1 = "python_clear_test"
    unique_topic2 = "stocks_clear_test"
    
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
    
    # Fetch from multiple sources
    await orchestrator.fetch_multi_source(field="tech", topic=unique_topic1, num_sources=2)
    await orchestrator.fetch_multi_source(field="finance", topic=unique_topic2, num_sources=2)
    
    # Clear cache
    await orchestrator.invalidate_cache()
    
    # Fetch again - should hit APIs
    await orchestrator.fetch_multi_source(field="tech", topic=unique_topic1, num_sources=2)
    
    # At least one adapter should be called twice
    call_counts = [
        adapter.fetch_and_normalize.call_count 
        for adapter in orchestrator.adapters.values()
    ]
    assert any(count >= 2 for count in call_counts)


@pytest.mark.asyncio
async def test_get_cache_stats(orchestrator, mock_content):
    """Test getting cache statistics"""
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # Initial stats
    stats = orchestrator.get_cache_stats()
    assert "hits" in stats
    assert "misses" in stats
    assert "size" in stats
    
    # Fetch to populate cache
    await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1
    )
    
    # Stats should show cache miss
    stats = orchestrator.get_cache_stats()
    assert stats["misses"] >= 1
    
    # Fetch again to hit cache
    await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1
    )
    
    # Stats should show cache hit
    stats = orchestrator.get_cache_stats()
    assert stats["hits"] >= 1


@pytest.mark.asyncio
async def test_clear_expired_cache(orchestrator):
    """Test clearing expired cache entries"""
    # This is a simple test to ensure the method exists and runs
    await orchestrator.clear_expired_cache()
    # No assertion needed - just verify it doesn't crash


@pytest.mark.asyncio
async def test_cache_different_topics(orchestrator, mock_content):
    """Test that different topics are cached separately"""
    await orchestrator.cache.clear()
    topic1 = "python_topics_test_1"
    topic2 = "javascript_topics_test_2"
    
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # Fetch topic 1
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=topic1,
        num_sources=1
    )
    
    # Fetch topic 2
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=topic2,
        num_sources=1
    )
    
    # Both should hit API (different topics)
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 2
    
    # Fetch topic 1 again - should hit cache
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=topic1,
        num_sources=1
    )
    
    # Still only 2 API calls
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 2


@pytest.mark.asyncio
async def test_cache_different_limits(orchestrator, mock_content):
    """Test that different limits are cached separately"""
    await orchestrator.cache.clear()
    unique_topic = "python_limits_test"
    
    orchestrator.adapters["hackernews"].fetch_and_normalize = AsyncMock(
        return_value=mock_content[:1]
    )
    
    # Fetch with limit 2
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1,
        items_per_source=2
    )
    
    # Fetch with limit 5
    await orchestrator.fetch_multi_source(
        field="tech",
        topic=unique_topic,
        num_sources=1,
        items_per_source=5
    )
    
    # Both should hit API (different limits)
    assert orchestrator.adapters["hackernews"].fetch_and_normalize.call_count == 2
