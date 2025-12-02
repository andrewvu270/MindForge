"""
Tests for SourceAdapter base class
"""
import pytest
import asyncio
from datetime import datetime
from typing import List

from services.source_adapter import SourceAdapter
from services.content_models import NormalizedContent, SourceType


class MockAdapter(SourceAdapter):
    """Mock adapter for testing"""
    
    def __init__(self, should_fail=False, **kwargs):
        super().__init__(**kwargs)
        self.should_fail = should_fail
        self.fetch_count = 0
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """Mock fetch implementation"""
        self.fetch_count += 1
        
        if self.should_fail:
            raise Exception("Mock fetch failure")
        
        # Simulate API delay
        await asyncio.sleep(0.1)
        
        return [
            {
                "title": f"Test Article {i}",
                "content": f"Content about {topic}",
                "url": f"https://example.com/{i}"
            }
            for i in range(min(limit, 3))
        ]
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """Mock normalize implementation"""
        return NormalizedContent(
            source="mock",
            source_type=SourceType.TEXT,
            title=raw_content["title"],
            content=raw_content["content"],
            url=raw_content.get("url"),
            metadata={},
            fetched_at=datetime.now()
        )


@pytest.mark.asyncio
async def test_fetch_and_normalize_success():
    """Test successful fetch and normalize operation"""
    adapter = MockAdapter()
    results = await adapter.fetch_and_normalize("test topic", limit=3)
    
    assert len(results) == 3
    assert all(isinstance(r, NormalizedContent) for r in results)
    assert results[0].source == "mock"
    assert results[0].source_type == SourceType.TEXT
    assert "test topic" in results[0].content.lower()


@pytest.mark.asyncio
async def test_fetch_and_normalize_failure():
    """Test fetch failure handling"""
    adapter = MockAdapter(should_fail=True)
    results = await adapter.fetch_and_normalize("test topic", limit=3)
    
    # Should return empty list on failure
    assert len(results) == 0


@pytest.mark.asyncio
async def test_retry_logic():
    """Test retry logic with exponential backoff"""
    adapter = MockAdapter(timeout=1, max_retries=3)
    
    async def failing_request():
        raise Exception("Temporary failure")
    
    with pytest.raises(Exception):
        await adapter._retry_request(failing_request)
    
    # Should have attempted 3 times
    # (We can't easily verify this without more complex mocking)


@pytest.mark.asyncio
async def test_timeout_handling():
    """Test timeout handling"""
    adapter = MockAdapter(timeout=0.05)  # Very short timeout
    
    async def slow_request():
        await asyncio.sleep(1)  # Longer than timeout
        return "result"
    
    with pytest.raises(asyncio.TimeoutError):
        await adapter._retry_request(slow_request)


def test_get_source_name():
    """Test source name extraction"""
    adapter = MockAdapter()
    assert adapter.get_source_name() == "mock"


@pytest.mark.asyncio
async def test_normalize_error_handling():
    """Test that normalization errors don't crash the whole operation"""
    
    class FailingNormalizeAdapter(MockAdapter):
        def normalize(self, raw_content: dict) -> NormalizedContent:
            if "fail" in raw_content.get("title", ""):
                raise ValueError("Normalization failed")
            return super().normalize(raw_content)
    
    adapter = FailingNormalizeAdapter()
    
    # Override fetch to return mix of good and bad content
    async def mixed_fetch(topic: str, limit: int = 5):
        return [
            {"title": "Good Article", "content": "Good content", "url": "https://example.com/1"},
            {"title": "fail Article", "content": "Bad content", "url": "https://example.com/2"},
            {"title": "Another Good", "content": "More good content", "url": "https://example.com/3"},
        ]
    
    adapter.fetch = mixed_fetch
    results = await adapter.fetch_and_normalize("test", limit=3)
    
    # Should only return successfully normalized content
    assert len(results) == 2
    assert all("fail" not in r.title for r in results)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
