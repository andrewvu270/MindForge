"""
Tests for BBC News Adapter
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timedelta

from services.adapters.bbcnews_adapter import BBCNewsAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def news_adapter():
    """Create BBC News adapter instance with mock API key"""
    return BBCNewsAdapter(api_key="test_api_key")


@pytest.fixture
def mock_news_response():
    """Mock NewsAPI response"""
    return {
        "status": "ok",
        "totalResults": 1,
        "articles": [
            {
                "source": {"id": "bbc-news", "name": "BBC News"},
                "author": "BBC News Staff",
                "title": "Breaking: Major Tech Announcement",
                "description": "A major technology company announces new product",
                "url": "https://www.bbc.com/news/technology-12345",
                "urlToImage": "https://ichef.bbci.co.uk/news/1024/image.jpg",
                "publishedAt": "2024-12-01T10:00:00Z",
                "content": "A major technology company has announced a new product today. This is expected to revolutionize the industry... [+1234 chars]"
            }
        ]
    }


@pytest.mark.asyncio
async def test_news_adapter_initialization():
    """Test BBC News adapter initializes correctly"""
    adapter = BBCNewsAdapter(api_key="test_key")
    assert adapter.api_key == "test_key"
    assert adapter.BASE_URL == "https://newsapi.org/v2"


@pytest.mark.asyncio
async def test_news_adapter_no_api_key():
    """Test adapter handles missing API key"""
    with patch.dict('os.environ', {}, clear=True):
        adapter = BBCNewsAdapter()
        assert adapter.api_key is None


@pytest.mark.asyncio
async def test_news_fetch_no_api_key():
    """Test fetch fails gracefully without API key"""
    adapter = BBCNewsAdapter(api_key=None)
    results = await adapter.fetch("technology")
    assert results == []


def test_news_normalize(news_adapter):
    """Test normalization of news data"""
    raw_data = {
        "title": "Breaking: Major Tech Announcement",
        "description": "A major technology company announces new product",
        "content": "A major technology company has announced a new product today...",
        "url": "https://www.bbc.com/news/technology-12345",
        "image_url": "https://ichef.bbci.co.uk/news/1024/image.jpg",
        "published_at": "2024-12-01T10:00:00Z",
        "author": "BBC News Staff",
        "source": "BBC News"
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "bbc_news"
    assert normalized.source_type == SourceType.NEWS
    assert "Breaking: Major Tech Announcement" in normalized.title
    assert "BBC News" in normalized.content
    assert "BBC News Staff" in normalized.content
    assert normalized.url == "https://www.bbc.com/news/technology-12345"
    assert normalized.metadata["author"] == "BBC News Staff"


def test_news_normalize_minimal_data(news_adapter):
    """Test normalization with minimal data"""
    raw_data = {
        "title": "Simple Article",
        "description": "",
        "url": "https://www.bbc.com/news/article",
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "bbc_news"
    assert "Simple Article" in normalized.title


def test_news_normalize_no_author(news_adapter):
    """Test normalization without author"""
    raw_data = {
        "title": "Anonymous Article",
        "description": "Article without author",
        "url": "https://www.bbc.com/news/article",
        "source": "BBC News"
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    assert "BBC News" in normalized.content
    assert normalized.metadata["author"] is None


def test_news_normalize_time_ago(news_adapter):
    """Test time ago calculation"""
    # Recent article (1 hour ago)
    one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat() + "Z"
    raw_data = {
        "title": "Recent Article",
        "description": "Published recently",
        "url": "https://www.bbc.com/news/recent",
        "published_at": one_hour_ago
    }
    
    normalized = news_adapter.normalize(raw_data)
    assert "hour" in normalized.content or "minute" in normalized.content


def test_news_normalize_days_ago(news_adapter):
    """Test time ago for older articles"""
    # Article from 3 days ago
    three_days_ago = (datetime.now() - timedelta(days=3)).isoformat() + "Z"
    raw_data = {
        "title": "Older Article",
        "description": "Published days ago",
        "url": "https://www.bbc.com/news/older",
        "published_at": three_days_ago
    }
    
    normalized = news_adapter.normalize(raw_data)
    assert "day" in normalized.content


def test_news_normalize_with_content(news_adapter):
    """Test normalization includes article content"""
    raw_data = {
        "title": "Article with Content",
        "description": "Short description",
        "content": "Full article content goes here with more details...",
        "url": "https://www.bbc.com/news/article",
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    assert "Short description" in normalized.content
    assert "Full article content" in normalized.content


def test_news_normalize_same_description_and_content(news_adapter):
    """Test normalization doesn't duplicate when description equals content"""
    same_text = "This is the article text"
    raw_data = {
        "title": "Article",
        "description": same_text,
        "content": same_text,
        "url": "https://www.bbc.com/news/article",
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    # Should only appear once
    assert normalized.content.count(same_text) == 1


def test_news_normalize_metadata(news_adapter):
    """Test metadata is properly stored"""
    raw_data = {
        "title": "Test Article",
        "description": "Test description",
        "url": "https://www.bbc.com/news/test",
        "image_url": "https://example.com/image.jpg",
        "published_at": "2024-12-01T10:00:00Z",
        "author": "Test Author",
        "source": "BBC News"
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    assert normalized.metadata["author"] == "Test Author"
    assert normalized.metadata["published_at"] == "2024-12-01T10:00:00Z"
    assert normalized.metadata["source_name"] == "BBC News"
    assert normalized.metadata["image_url"] == "https://example.com/image.jpg"


def test_news_normalize_invalid_date(news_adapter):
    """Test normalization handles invalid date gracefully"""
    raw_data = {
        "title": "Article",
        "description": "Test",
        "url": "https://www.bbc.com/news/article",
        "published_at": "invalid-date-format"
    }
    
    normalized = news_adapter.normalize(raw_data)
    
    # Should still work, just show the raw date
    assert "invalid-date-format" in normalized.content
