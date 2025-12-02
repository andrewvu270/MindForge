"""
Integration tests for the full Frankenstein pipeline
"""
import pytest
import os
from unittest.mock import AsyncMock, MagicMock, patch

from services.content_orchestrator import ContentOrchestrator
from services.llm_service import LLMService
from agents.lesson_synthesis_agent import LessonSynthesisAgent
from agents.quiz_generation_agent import QuizGenerationAgent
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def mock_contents():
    """Mock normalized content from multiple sources"""
    return [
        NormalizedContent(
            source="hackernews",
            source_type=SourceType.DISCUSSION,
            title="AI Breakthrough in 2024",
            content="Discussion about recent AI advances...",
            url="https://news.ycombinator.com/item?id=123",
            metadata={}
        ),
        NormalizedContent(
            source="reddit",
            source_type=SourceType.DISCUSSION,
            title="Learning AI - Tips and Tricks",
            content="Community discussion on learning AI effectively...",
            url="https://reddit.com/r/MachineLearning/123",
            metadata={}
        ),
        NormalizedContent(
            source="wikipedia",
            source_type=SourceType.TEXT,
            title="Artificial Intelligence",
            content="AI is the simulation of human intelligence...",
            url="https://en.wikipedia.org/wiki/AI",
            metadata={}
        )
    ]


@pytest.mark.asyncio
async def test_content_orchestrator_field_mapping():
    """Test that orchestrator maps fields to correct adapters"""
    orchestrator = ContentOrchestrator()
    
    tech_adapters = orchestrator._get_adapters_for_field("technology")
    assert "hackernews" in tech_adapters
    assert "reddit" in tech_adapters
    
    finance_adapters = orchestrator._get_adapters_for_field("finance")
    assert "finance" in finance_adapters
    
    await orchestrator.close_all()


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_lesson_synthesis_agent(mock_contents):
    """Test lesson synthesis agent with mocked LLM"""
    # Mock LLM service
    mock_llm = MagicMock()
    mock_llm.synthesize_lesson = AsyncMock(return_value={
        "title": "Introduction to AI",
        "summary": "A comprehensive overview of AI...",
        "learning_objectives": ["Understand AI basics", "Learn key concepts"],
        "key_concepts": ["Machine Learning", "Neural Networks"],
        "sources": []
    })
    
    agent = LessonSynthesisAgent(llm_service=mock_llm)
    
    response = await agent.execute({
        "contents": mock_contents,
        "field": "technology",
        "max_words": 200
    })
    
    assert response.status == "completed"
    assert response.result is not None
    assert "title" in response.result
    assert response.metadata["num_sources"] == 3


@pytest.mark.asyncio
@patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
async def test_quiz_generation_agent():
    """Test quiz generation agent with mocked LLM"""
    # Mock LLM service
    mock_llm = MagicMock()
    mock_llm.generate_quiz = AsyncMock(return_value=[
        {
            "question": "What is AI?",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "correct_answer": "A) ...",
            "explanation": "..."
        }
    ])
    
    agent = QuizGenerationAgent(llm_service=mock_llm)
    
    response = await agent.execute({
        "lesson_content": "AI is artificial intelligence...",
        "num_questions": 5
    })
    
    assert response.status == "completed"
    assert "questions" in response.result
    assert len(response.result["questions"]) > 0


@pytest.mark.asyncio
async def test_agent_error_handling():
    """Test that agents handle errors gracefully"""
    mock_llm = MagicMock()
    mock_llm.synthesize_lesson = AsyncMock(side_effect=Exception("API Error"))
    
    agent = LessonSynthesisAgent(llm_service=mock_llm)
    
    response = await agent.execute({
        "contents": [],
        "field": "tech"
    })
    
    assert response.status == "failed"
    assert response.error is not None


@pytest.mark.asyncio
async def test_full_pipeline_mock(mock_contents):
    """Test the full pipeline with mocked components"""
    # Mock LLM service
    mock_llm = MagicMock()
    mock_llm.synthesize_lesson = AsyncMock(return_value={
        "title": "AI Fundamentals",
        "summary": "Learn AI basics from multiple perspectives...",
        "learning_objectives": ["Understand AI", "Apply concepts"],
        "key_concepts": ["ML", "Neural Nets"],
        "sources": []
    })
    mock_llm.generate_quiz = AsyncMock(return_value=[
        {"question": "Q1", "options": [], "correct_answer": "A", "explanation": "..."}
    ])
    
    # Create agents
    synthesis_agent = LessonSynthesisAgent(llm_service=mock_llm)
    quiz_agent = QuizGenerationAgent(llm_service=mock_llm)
    
    # Step 1: Synthesize lesson
    lesson_response = await synthesis_agent.execute({
        "contents": mock_contents,
        "field": "technology"
    })
    
    assert lesson_response.status == "completed"
    lesson = lesson_response.result
    
    # Step 2: Generate quiz
    quiz_response = await quiz_agent.execute({
        "lesson_content": lesson["summary"],
        "num_questions": 5
    })
    
    assert quiz_response.status == "completed"
    assert len(quiz_response.result["questions"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
