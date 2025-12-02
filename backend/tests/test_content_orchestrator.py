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
    for adapter in orchestrator.adapters.values():
        adapter.fetch_and_normalize = AsyncMock(return_value=mock_content)
    
    results = await orchestrator.fetch_multi_source(
        field="tech",
        topic="python",
        num_sources=1,
        items_per_source=2
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
    # Mock most adapters to return empty
    for name, adapter in orchestrator.adapters.items():
        if name == "wikipedia":
            adapter.fetch_and_normalize = AsyncMock(return_value=mock_content[:1])
        else:
            adapter.fetch_and_normalize = AsyncMock(return_value=[])
    
    results = await orchestrator.fetch_with_fallback(
        field="tech",
        topic="python",
        min_sources=1
    )
    
    # Should have Wikipedia content
    assert any(c.source == "wikipedia" for c in results)


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
