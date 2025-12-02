"""
Tests for Reddit API Adapter
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

from services.adapters.reddit_adapter import RedditAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def mock_reddit_self_post():
    """Mock Reddit self (text) post"""
    return {
        "id": "abc123",
        "title": "How to learn AI effectively",
        "selftext": "I've been studying AI for 6 months. Here are my tips...",
        "subreddit": "MachineLearning",
        "score": 250,
        "num_comments": 45,
        "author": "testuser",
        "created_utc": 1234567890,
        "is_self": True,
        "permalink": "/r/MachineLearning/comments/abc123/how_to_learn_ai/",
        "stickied": False,
        "promoted": False
    }


@pytest.fixture
def mock_reddit_link_post():
    """Mock Reddit link post"""
    return {
        "id": "xyz789",
        "title": "New AI Research Paper",
        "selftext": "",
        "url": "https://arxiv.org/abs/12345",
        "subreddit": "artificial",
        "score": 500,
        "num_comments": 120,
        "author": "researcher",
        "created_utc": 1234567891,
        "is_self": False,
        "domain": "arxiv.org",
        "permalink": "/r/artificial/comments/xyz789/new_ai_research/",
        "stickied": False,
        "promoted": False
    }


@pytest.mark.asyncio
async def test_normalize_self_post(mock_reddit_self_post):
    """Test normalizing a self (text) post"""
    adapter = RedditAdapter()
    normalized = adapter.normalize(mock_reddit_self_post)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "reddit"
    assert normalized.source_type == SourceType.DISCUSSION
    assert normalized.title == "How to learn AI effectively"
    assert "studying AI for 6 months" in normalized.content
    assert "250 upvotes" in normalized.content
    assert "45 comments" in normalized.content
    assert "r/MachineLearning" in normalized.content
    assert normalized.metadata["subreddit"] == "MachineLearning"
    assert normalized.metadata["score"] == 250
    assert normalized.metadata["is_self"] is True
    
    await adapter.close()


@pytest.mark.asyncio
async def test_normalize_link_post(mock_reddit_link_post):
    """Test normalizing a link post"""
    adapter = RedditAdapter()
    normalized = adapter.normalize(mock_reddit_link_post)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "reddit"
    assert normalized.source_type == SourceType.TEXT
    assert normalized.title == "New AI Research Paper"
    assert "500 upvotes" in normalized.content
    assert "120 comments" in normalized.content
    assert normalized.url == "https://arxiv.org/abs/12345"
    assert normalized.metadata["is_self"] is False
    assert normalized.metadata["domain"] == "arxiv.org"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_normalize_truncates_long_text():
    """Test that very long posts are truncated"""
    adapter = RedditAdapter()
    long_post = {
        "id": "long123",
        "title": "Long Post",
        "selftext": "A" * 1500,  # Very long text
        "subreddit": "test",
        "score": 10,
        "num_comments": 5,
        "author": "user",
        "created_utc": 1234567890,
        "is_self": True,
        "permalink": "/r/test/comments/long123/",
        "stickied": False
    }
    
    normalized = adapter.normalize(long_post)
    
    # Should be truncated to ~1000 chars plus metadata
    assert "..." in normalized.content
    assert len(normalized.content) < 1500
    
    await adapter.close()


@pytest.mark.asyncio
async def test_normalize_handles_deleted_content():
    """Test handling of deleted/removed posts"""
    adapter = RedditAdapter()
    deleted_post = {
        "id": "del123",
        "title": "Deleted Post",
        "selftext": "[deleted]",
        "subreddit": "test",
        "score": 0,
        "num_comments": 0,
        "author": "[deleted]",
        "created_utc": 1234567890,
        "is_self": True,
        "permalink": "/r/test/comments/del123/",
        "stickied": False
    }
    
    normalized = adapter.normalize(deleted_post)
    
    # Should not include [deleted] text
    assert "[deleted]" not in normalized.content or "u/[deleted]" in normalized.content
    assert normalized.title == "Deleted Post"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_get_subreddits_for_topic():
    """Test subreddit selection based on topic"""
    adapter = RedditAdapter()
    
    # Test field mappings
    tech_subs = adapter._get_subreddits_for_topic("technology")
    assert "technology" in tech_subs
    assert "programming" in tech_subs
    
    culture_subs = adapter._get_subreddits_for_topic("culture")
    assert "books" in culture_subs
    assert "art" in culture_subs
    
    # Test custom topic
    custom_subs = adapter._get_subreddits_for_topic("python")
    assert custom_subs == ["python"]
    
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_with_mocked_api():
    """Test fetching posts with mocked API"""
    adapter = RedditAdapter()
    
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": {
            "children": [
                {
                    "data": {
                        "id": "1",
                        "title": "Test Post 1",
                        "selftext": "Content 1",
                        "subreddit": "technology",
                        "score": 100,
                        "num_comments": 20,
                        "author": "user1",
                        "is_self": True,
                        "stickied": False,
                        "promoted": False,
                        "permalink": "/r/technology/comments/1/"
                    }
                },
                {
                    "data": {
                        "id": "2",
                        "title": "Test Post 2",
                        "selftext": "Content 2",
                        "subreddit": "technology",
                        "score": 150,
                        "num_comments": 30,
                        "author": "user2",
                        "is_self": True,
                        "stickied": False,
                        "promoted": False,
                        "permalink": "/r/technology/comments/2/"
                    }
                }
            ]
        }
    }
    mock_response.raise_for_status = MagicMock()
    
    adapter.client.get = AsyncMock(return_value=mock_response)
    
    # Fetch posts
    posts = await adapter.fetch("technology", limit=2)
    
    assert len(posts) == 2
    assert posts[0]["title"] == "Test Post 1"
    assert posts[1]["title"] == "Test Post 2"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_filters_stickied_posts():
    """Test that stickied and promoted posts are filtered out"""
    adapter = RedditAdapter()
    
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": {
            "children": [
                {
                    "data": {
                        "id": "1",
                        "title": "Normal Post",
                        "stickied": False,
                        "promoted": False,
                        "subreddit": "test",
                        "score": 100,
                        "num_comments": 10,
                        "author": "user1",
                        "is_self": True,
                        "permalink": "/r/test/comments/1/"
                    }
                },
                {
                    "data": {
                        "id": "2",
                        "title": "Stickied Post",
                        "stickied": True,
                        "promoted": False,
                        "subreddit": "test"
                    }
                },
                {
                    "data": {
                        "id": "3",
                        "title": "Promoted Post",
                        "stickied": False,
                        "promoted": True,
                        "subreddit": "test"
                    }
                }
            ]
        }
    }
    mock_response.raise_for_status = MagicMock()
    
    adapter.client.get = AsyncMock(return_value=mock_response)
    
    posts = await adapter.fetch("test", limit=5)
    
    # Should only get the normal post
    assert len(posts) == 1
    assert posts[0]["title"] == "Normal Post"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_get_source_name():
    """Test source name is correct"""
    adapter = RedditAdapter()
    assert adapter.get_source_name() == "reddit"
    await adapter.close()


@pytest.mark.asyncio
async def test_fetch_and_normalize_integration():
    """Test the full fetch and normalize pipeline"""
    adapter = RedditAdapter()
    
    # Mock API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": {
            "children": [
                {
                    "data": {
                        "id": "test1",
                        "title": "AI Discussion",
                        "selftext": "Let's talk about AI",
                        "subreddit": "artificial",
                        "score": 200,
                        "num_comments": 50,
                        "author": "aiuser",
                        "is_self": True,
                        "stickied": False,
                        "promoted": False,
                        "permalink": "/r/artificial/comments/test1/",
                        "created_utc": 1234567890
                    }
                }
            ]
        }
    }
    mock_response.raise_for_status = MagicMock()
    
    adapter.client.get = AsyncMock(return_value=mock_response)
    
    # Test fetch_and_normalize
    results = await adapter.fetch_and_normalize("AI", limit=2)
    
    assert len(results) > 0
    assert all(isinstance(r, NormalizedContent) for r in results)
    assert results[0].source == "reddit"
    assert results[0].title == "AI Discussion"
    
    await adapter.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
