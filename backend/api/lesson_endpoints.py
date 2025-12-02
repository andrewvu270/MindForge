"""
API endpoints for lesson generation
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from services.content_orchestrator import ContentOrchestrator
from services.llm_service import LLMService
from agents.lesson_synthesis_agent import LessonSynthesisAgent
from agents.quiz_generation_agent import QuizGenerationAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

# Initialize services (in production, use dependency injection)
orchestrator = ContentOrchestrator()
llm_service = LLMService()
synthesis_agent = LessonSynthesisAgent(llm_service)
quiz_agent = QuizGenerationAgent(llm_service)


class LessonGenerationRequest(BaseModel):
    field: str
    topic: str
    num_sources: Optional[int] = 3
    generate_quiz: Optional[bool] = True
    num_quiz_questions: Optional[int] = 5


class LessonGenerationResponse(BaseModel):
    lesson: dict
    quiz: Optional[dict] = None
    metadata: dict


@router.post("/generate", response_model=LessonGenerationResponse)
async def generate_lesson(request: LessonGenerationRequest):
    """
    Generate a lesson from multiple heterogeneous sources.
    This is the main "Frankenstein" endpoint!
    
    Args:
        request: Lesson generation parameters
        
    Returns:
        Generated lesson with optional quiz
    """
    try:
        logger.info(
            f"Generating lesson for field='{request.field}', "
            f"topic='{request.topic}'"
        )
        
        # Step 1: Fetch content from multiple sources
        contents = await orchestrator.fetch_with_fallback(
            field=request.field,
            topic=request.topic,
            min_sources=2
        )
        
        if len(contents) < 2:
            raise HTTPException(
                status_code=500,
                detail=f"Could not fetch enough sources. Got {len(contents)}, need at least 2"
            )
        
        logger.info(f"Fetched {len(contents)} content items from multiple sources")
        
        # Step 2: Synthesize lesson using AI agent
        synthesis_response = await synthesis_agent.execute({
            "contents": contents,
            "field": request.field,
            "max_words": 200
        })
        
        if synthesis_response.status != "completed":
            raise HTTPException(
                status_code=500,
                detail=f"Lesson synthesis failed: {synthesis_response.error}"
            )
        
        lesson = synthesis_response.result
        logger.info(f"Synthesized lesson: {lesson.get('title')}")
        
        # Step 3: Generate quiz if requested
        quiz = None
        if request.generate_quiz:
            quiz_response = await quiz_agent.execute({
                "lesson_content": lesson.get("summary", ""),
                "num_questions": request.num_quiz_questions
            })
            
            if quiz_response.status == "completed":
                quiz = quiz_response.result
                logger.info(f"Generated {len(quiz.get('questions', []))} quiz questions")
            else:
                logger.warning(f"Quiz generation failed: {quiz_response.error}")
        
        # Build response
        return LessonGenerationResponse(
            lesson=lesson,
            quiz=quiz,
            metadata={
                "num_sources": len(contents),
                "sources": [
                    {"name": c.source, "type": c.source_type}
                    for c in contents
                ],
                "field": request.field,
                "topic": request.topic
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lesson generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Lesson generation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "adapters": list(orchestrator.adapters.keys()),
        "agents": ["synthesis", "quiz"]
    }
