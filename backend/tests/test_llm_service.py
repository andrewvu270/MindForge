"""
Tests for LLM Service with retry logic and error handling
"""
import pytest
import os
from unittest.mock import AsyncMock, MagicMock, patch
from openai import RateLimitError, APITimeoutError, OpenAIError

from services.llm_service import LLMService
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def mock_contents():
    """Mock normalized content for testing"""
    return [
        NormalizedContent(
            source="hackernews",
            source_type=SourceType.DISCUSSION,
            title="Test Article 1",
            content="Content from source 1",
            url="https://example.com/1",
            metadata={}
        ),
        NormalizedContent(
            source="reddit",
            source_type=SourceType.DISCUSSION,
            title="Test Article 2",
            content="Content from source 2",
            url="https://example.com/2",
            metadata={}
        )
    ]


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_llm_service_initialization():
    """Test LLM service initializes correctly"""
    service = LLMService(api_key="test-key")
    assert service.api_key == "test-key"
    assert service.max_retries == 3
    assert service.retry_delays == [1.0, 2.0, 4.0]


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_llm_service_custom_retry_config():
    """Test LLM service with custom retry configuration"""
    service = LLMService(
        api_key="test-key",
        max_retries=5,
        retry_delays=[0.5, 1.0, 1.5]
    )
    assert service.max_retries == 5
    assert service.retry_delays == [0.5, 1.0, 1.5]


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_retry_on_rate_limit(mock_contents):
    """Test that service retries on rate limit errors"""
    service = LLMService(api_key="test-key", retry_delays=[0.1, 0.1, 0.1])
    
    # Mock the client to fail twice then succeed
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"title": "Test", "summary": "Test summary", "learning_objectives": [], "key_concepts": []}'
    
    # Create a proper mock response for RateLimitError
    mock_error_response = MagicMock()
    mock_error_response.request = MagicMock()
    
    service.client.chat.completions.create = AsyncMock(
        side_effect=[
            RateLimitError("Rate limit exceeded", response=mock_error_response, body=None),
            RateLimitError("Rate limit exceeded", response=mock_error_response, body=None),
            mock_response
        ]
    )
    
    # Should succeed after retries
    result = await service.synthesize_lesson(mock_contents, "technology")
    assert result is not None
    assert "title" in result


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_retry_on_timeout(mock_contents):
    """Test that service retries on timeout errors"""
    service = LLMService(api_key="test-key", retry_delays=[0.1, 0.1, 0.1])
    
    # Mock the client to timeout once then succeed
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"title": "Test", "summary": "Test summary", "learning_objectives": [], "key_concepts": []}'
    
    service.client.chat.completions.create = AsyncMock(
        side_effect=[
            APITimeoutError("Request timeout"),
            mock_response
        ]
    )
    
    # Should succeed after retry
    result = await service.synthesize_lesson(mock_contents, "technology")
    assert result is not None
    assert "title" in result


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_max_retries_exceeded(mock_contents):
    """Test that service fails after max retries"""
    service = LLMService(api_key="test-key", max_retries=2, retry_delays=[0.1, 0.1])
    
    # Create a proper mock response for RateLimitError
    mock_error_response = MagicMock()
    mock_error_response.request = MagicMock()
    
    # Mock the client to always fail
    service.client.chat.completions.create = AsyncMock(
        side_effect=RateLimitError("Rate limit exceeded", response=mock_error_response, body=None)
    )
    
    # Should raise error after max retries
    with pytest.raises(RateLimitError):
        await service.synthesize_lesson(mock_contents, "technology")


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_generate_quiz_with_retry():
    """Test quiz generation with retry logic"""
    service = LLMService(api_key="test-key", retry_delays=[0.1, 0.1])
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"questions": [{"question": "Q1", "options": [], "correct_answer": "A", "explanation": "..."}]}'
    
    service.client.chat.completions.create = AsyncMock(
        side_effect=[
            APITimeoutError("Timeout"),
            mock_response
        ]
    )
    
    result = await service.generate_quiz("Test lesson content", num_questions=3)
    assert result is not None
    assert len(result) > 0


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_analyze_reflection_with_retry():
    """Test reflection analysis with retry logic"""
    service = LLMService(api_key="test-key", retry_delays=[0.1, 0.1])
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"feedback": "Good reflection", "quality_score": 85, "insights": [], "suggestion": "Keep it up"}'
    
    # Create a proper mock response for RateLimitError
    mock_error_response = MagicMock()
    mock_error_response.request = MagicMock()
    
    service.client.chat.completions.create = AsyncMock(
        side_effect=[
            RateLimitError("Rate limit", response=mock_error_response, body=None),
            mock_response
        ]
    )
    
    result = await service.analyze_reflection("My reflection text")
    assert result is not None
    assert "feedback" in result
    assert result["quality_score"] == 85


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_recommend_lessons_with_retry():
    """Test lesson recommendation with retry logic"""
    service = LLMService(api_key="test-key", retry_delays=[0.1, 0.1])
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"lesson_ids": ["lesson1", "lesson2", "lesson3"]}'
    
    service.client.chat.completions.create = AsyncMock(
        side_effect=[
            APITimeoutError("Timeout"),
            mock_response
        ]
    )
    
    user_progress = {"lessons_completed": 5, "fields": ["tech"], "average_score": 85, "streak": 3}
    available_lessons = [
        {"id": "lesson1", "title": "Test 1", "field": "tech", "difficulty": "easy"},
        {"id": "lesson2", "title": "Test 2", "field": "finance", "difficulty": "medium"}
    ]
    
    result = await service.recommend_lessons(user_progress, available_lessons, num_recommendations=3)
    assert result is not None
    assert len(result) == 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
