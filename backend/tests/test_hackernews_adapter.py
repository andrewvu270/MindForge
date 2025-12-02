"""
Tests for Hacker News API Adapter
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from services.adapters.hackernews_adapter import HackerNewsAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def mock_hn_story():
    """Mock Hacker News story data"""
    return {
        "id": 12345,
        "title": "Show HN: My AI Project",
        "text": "I built an AI tool that does amazing things. Check it out!",
        "url": "https://example.com/ai-project",
        "score": 150,
        "descendants": 42,
        "by": "testuser",
        "time": 1234567890,
        "type": "story"
    }


@pytest.fixture
def mock_hn_story_no_text():
    """Mock HN story without text (link post)"""
    return {
        "id": 67890,
        "title": "Interesting AI Article",
        "url": "https://example.com/article",
        "score": 200,
        "descendants": 75,
        "by": "anotheruser",
        "time": 1234567891,
        "type": "story"
    }


@pytest.mark.asyncio
async def test_normalize_story_with_text(mock_hn_story):
    """Test normalizing a story with text content"""
    adapter = HackerNewsAdapter()
    normalized = adapter.normalize(mock_hn_story)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "hackernews"
    assert normalized.source_type == SourceType.DISCUSSION
    assert normalized.title == "Show HN: My AI Project"
    assert "AI tool" in normalized.content
    assert "150 points" in normalized.content
    assert "42 comments" in normalized.content
    assert normalized.url == "https://example.com/ai-project"
    assert normalized.metadata["story_id"] == 12345
    assert normalized.metadata["score"] == 150
    assert normalized.metadata["author"] == "testuser"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_normalize_story_without_text(mock_hn_story_no_text):
    """Test normalizing a link post without text"""
    adapter = HackerNewsAdapter()
    normalized = adapter.normalize(mock_hn_story_no_text)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.title == "Interesting AI Article"
    assert "200 points" in normalized.content
    assert "75 comments" in normalized.content
    assert normalized.url == "https://example.com/article"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_normalize_removes_html_tags():
    """Test that HTML tags are removed from text"""
    adapter = HackerNewsAdapter()
    story_with_html = {
        "id": 11111,
        "title": "Test Story",
        "text": "<p>This is <b>bold</b> text with <a href='link'>links</a>.</p>",
        "score": 10,
        "descendants": 5,
        "by": "user",
        "time": 1234567890
    }
    
    normalized = adapter.normalize(story_with_html)
    
    # HTML tags should be removed
    assert "<p>" not in normalized.content
    assert "<b>" not in normalized.content
    assert "<a" not in normalized.content
    assert "This is bold text with links" in normalized.content
    
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_with_mocked_api():
    """Test fetching stories with mocked API responses"""
    adapter = HackerNewsAdapter()
    
    # Mock the HTTP client
    mock_response_ids = MagicMock()
    mock_response_ids.json.return_value = [1, 2, 3, 4, 5]
    mock_response_ids.raise_for_status = MagicMock()
    
    mock_response_story = MagicMock()
    mock_response_story.json.return_value = {
        "id": 1,
        "title": "AI Story",
        "text": "About artificial intelligence",
        "score": 100,
        "descendants": 20,
        "by": "user1",
        "time": 1234567890
    }
    mock_response_story.raise_for_status = MagicMock()
    
    # Mock the client.get method
    async def mock_get(url):
        if "topstories" in url:
            return mock_response_ids
        else:
            return mock_response_story
    
    adapter.client.get = AsyncMock(side_effect=mock_get)
    
    # Fetch stories
    stories = await adapter.fetch("AI", limit=2)
    
    assert len(stories) > 0
    assert all(isinstance(s, dict) for s in stories)
    
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_filters_by_topic():
    """Test that fetch filters stories by topic"""
    adapter = HackerNewsAdapter()
    
    # Mock responses with different topics
    mock_response_ids = MagicMock()
    mock_response_ids.json.return_value = [1, 2, 3]
    mock_response_ids.raise_for_status = MagicMock()
    
    stories_data = [
        {"id": 1, "title": "Python Tutorial", "score": 50, "descendants": 10, "by": "user1"},
        {"id": 2, "title": "JavaScript Framework", "score": 60, "descendants": 15, "by": "user2"},
        {"id": 3, "title": "Python Best Practices", "score": 70, "descendants": 20, "by": "user3"},
    ]
    
    call_count = [0]
    
    async def mock_get(url):
        if "topstories" in url:
            return mock_response_ids
        else:
            # Return stories in sequence
            mock_response = MagicMock()
            mock_response.json.return_value = stories_data[call_count[0]]
            mock_response.raise_for_status = MagicMock()
            call_count[0] += 1
            return mock_response
    
    adapter.client.get = AsyncMock(side_effect=mock_get)
    
    # Fetch stories about Python
    stories = await adapter.fetch("Python", limit=2)
    
    # Should only get Python-related stories
    assert len(stories) == 2
    assert all("Python" in s["title"] for s in stories)
    
    await adapter.close()


@pytest.mark.asyncio
async def test_get_source_name():
    """Test source name is correct"""
    adapter = HackerNewsAdapter()
    assert adapter.get_source_name() == "hackernews"
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_and_normalize_integration():
    """Test the full fetch and normalize pipeline"""
    adapter = HackerNewsAdapter()
    
    # Mock API responses
    mock_response_ids = MagicMock()
    mock_response_ids.json.return_value = [1, 2]
    mock_response_ids.raise_for_status = MagicMock()
    
    mock_response_story = MagicMock()
    mock_response_story.json.return_value = {
        "id": 1,
        "title": "Test AI Story",
        "text": "Content about AI",
        "score": 100,
        "descendants": 20,
        "by": "testuser",
        "time": 1234567890
    }
    mock_response_story.raise_for_status = MagicMock()
    
    async def mock_get(url):
        if "topstories" in url:
            return mock_response_ids
        else:
            return mock_response_story
    
    adapter.client.get = AsyncMock(side_effect=mock_get)
    
    # Test fetch_and_normalize
    results = await adapter.fetch_and_normalize("AI", limit=2)
    
    assert len(results) > 0
    assert all(isinstance(r, NormalizedContent) for r in results)
    assert results[0].source == "hackernews"
    assert results[0].source_type == SourceType.DISCUSSION
    
    await adapter.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
