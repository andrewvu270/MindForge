"""
Tests for YouTube Adapter
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime

from services.adapters.youtube_adapter import YouTubeAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def youtube_adapter():
    """Create YouTube adapter instance with mock API key"""
    return YouTubeAdapter(api_key="test_api_key")


@pytest.fixture
def mock_youtube_search_response():
    """Mock YouTube search API response"""
    return {
        "items": [
            {
                "id": {"videoId": "abc123"},
                "snippet": {"title": "Test Video"}
            }
        ]
    }


@pytest.fixture
def mock_youtube_videos_response():
    """Mock YouTube videos API response"""
    return {
        "items": [
            {
                "id": "abc123",
                "snippet": {
                    "title": "Learn Python Programming",
                    "description": "A comprehensive guide to Python",
                    "channelTitle": "Tech Channel",
                    "publishedAt": "2024-01-15T10:00:00Z",
                    "thumbnails": {
                        "high": {"url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg"}
                    }
                },
                "contentDetails": {
                    "duration": "PT15M33S"
                },
                "statistics": {
                    "viewCount": "1500000",
                    "likeCount": "50000",
                    "commentCount": "1000"
                }
            }
        ]
    }


@pytest.mark.asyncio
async def test_youtube_adapter_initialization():
    """Test YouTube adapter initializes correctly"""
    adapter = YouTubeAdapter(api_key="test_key")
    assert adapter.api_key == "test_key"
    assert adapter.BASE_URL == "https://www.googleapis.com/youtube/v3"


@pytest.mark.asyncio
async def test_youtube_adapter_no_api_key():
    """Test YouTube adapter handles missing API key"""
    with patch.dict('os.environ', {}, clear=True):
        adapter = YouTubeAdapter()
        assert adapter.api_key is None


@pytest.mark.asyncio
async def test_youtube_fetch_no_api_key():
    """Test fetch fails gracefully without API key"""
    adapter = YouTubeAdapter(api_key=None)
    results = await adapter.fetch("python")
    assert results == []


def test_parse_duration(youtube_adapter):
    """Test duration parsing"""
    assert youtube_adapter._parse_duration("PT15M33S") == "15:33"
    assert youtube_adapter._parse_duration("PT1H30M45S") == "1:30:45"
    assert youtube_adapter._parse_duration("PT45S") == "0:45"
    assert youtube_adapter._parse_duration("PT2H5M") == "2:05:00"
    assert youtube_adapter._parse_duration("") == "Unknown"


def test_youtube_normalize(youtube_adapter):
    """Test normalization of YouTube data"""
    raw_data = {
        "video_id": "abc123",
        "title": "Learn Python Programming",
        "description": "A comprehensive guide to Python programming",
        "channel_title": "Tech Channel",
        "published_at": "2024-01-15T10:00:00Z",
        "duration": "PT15M33S",
        "view_count": "1500000",
        "like_count": "50000",
        "caption_text": None
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "youtube"
    assert normalized.source_type == SourceType.VIDEO_TRANSCRIPT
    assert "Learn Python Programming" in normalized.title
    assert "Tech Channel" in normalized.content
    assert "15:33" in normalized.content
    assert "1.5M views" in normalized.content
    assert "50.0K likes" in normalized.content
    assert normalized.url == "https://www.youtube.com/watch?v=abc123"


def test_youtube_normalize_with_captions(youtube_adapter):
    """Test normalization includes captions when available"""
    raw_data = {
        "video_id": "xyz789",
        "title": "Test Video",
        "description": "Test description",
        "channel_title": "Test Channel",
        "published_at": "2024-01-01T00:00:00Z",
        "duration": "PT10M",
        "view_count": "1000",
        "like_count": "100",
        "caption_text": "This is the video transcript text"
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    assert "Transcript:" in normalized.content
    assert "This is the video transcript text" in normalized.content
    assert normalized.metadata["has_captions"] is True


def test_youtube_normalize_minimal_data(youtube_adapter):
    """Test normalization with minimal data"""
    raw_data = {
        "video_id": "min123",
        "title": "Minimal Video",
        "description": "",
        "channel_title": "Channel",
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "youtube"
    assert "Minimal Video" in normalized.title


def test_youtube_normalize_long_description(youtube_adapter):
    """Test normalization truncates long descriptions"""
    long_desc = "A" * 1000
    raw_data = {
        "video_id": "long123",
        "title": "Long Description Video",
        "description": long_desc,
        "channel_title": "Channel",
        "duration": "PT5M",
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    # Should be truncated
    assert len(normalized.content) < len(long_desc)
    assert "..." in normalized.content


def test_youtube_normalize_view_count_formatting(youtube_adapter):
    """Test view count formatting"""
    # Test millions
    raw_data = {
        "video_id": "v1",
        "title": "Video",
        "channel_title": "Channel",
        "view_count": "5000000",
    }
    normalized = youtube_adapter.normalize(raw_data)
    assert "5.0M views" in normalized.content
    
    # Test thousands
    raw_data["view_count"] = "50000"
    normalized = youtube_adapter.normalize(raw_data)
    assert "50.0K views" in normalized.content
    
    # Test under 1000
    raw_data["view_count"] = "500"
    normalized = youtube_adapter.normalize(raw_data)
    assert "500 views" in normalized.content


def test_youtube_normalize_date_formatting(youtube_adapter):
    """Test published date formatting"""
    raw_data = {
        "video_id": "date123",
        "title": "Date Test Video",
        "channel_title": "Channel",
        "published_at": "2024-03-15T14:30:00Z",
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    assert "March 15, 2024" in normalized.content


def test_youtube_normalize_long_caption(youtube_adapter):
    """Test normalization truncates long captions"""
    long_caption = "Word " * 500  # Very long caption
    raw_data = {
        "video_id": "cap123",
        "title": "Caption Video",
        "channel_title": "Channel",
        "caption_text": long_caption,
    }
    
    normalized = youtube_adapter.normalize(raw_data)
    
    # Should be truncated
    assert len(normalized.content) < len(long_caption)
    assert "..." in normalized.content
