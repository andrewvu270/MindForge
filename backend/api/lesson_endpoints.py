"""
API endpoints for lesson generation
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
import uuid
from datetime import datetime

from services.content_orchestrator import ContentOrchestrator
from services.llm_service import LLMService
from agents.lesson_synthesis_agent import LessonSynthesisAgent
from agents.quiz_generation_agent import QuizGenerationAgent
from database import db

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
        
        # Step 3: Store synthesized lesson in database
        lesson_id = str(uuid.uuid4())
        
        # Map field name to field_id and field_name
        field_mapping = {
            "technology": {"id": "tech", "name": "Technology"},
            "tech": {"id": "tech", "name": "Technology"},
            "finance": {"id": "finance", "name": "Finance"},
            "economics": {"id": "economics", "name": "Economics"},
            "culture": {"id": "culture", "name": "Culture"},
            "influence": {"id": "influence", "name": "Influence"},
            "global_events": {"id": "global", "name": "Global Events"},
            "global": {"id": "global", "name": "Global Events"},
        }
        field_info = field_mapping.get(request.field.lower(), {"id": "tech", "name": "Technology"})
        
        try:
            client = db.client
            
            # Store in main lessons table so it shows up in lessons list
            lesson_data = {
                "id": lesson_id,
                "field_id": field_info["id"],
                "field_name": field_info["name"],
                "title": lesson.get("title"),
                "content": lesson.get("summary", ""),
                "sources": lesson.get("sources", []),
                "learning_objectives": lesson.get("learning_objectives", []),
                "key_concepts": lesson.get("key_concepts", []),
                "estimated_minutes": 15,
                "difficulty_level": "beginner",
                "is_auto_generated": False,  # User-generated via Frankenstein
                "created_at": datetime.now().isoformat()
            }
            
            client.table("lessons").insert(lesson_data).execute()
            logger.info(f"Stored lesson in main lessons table with ID: {lesson_id}")
            
            # Also store in synthesized_lessons for tracking
            synthesized_lesson_data = {
                "id": lesson_id,
                "category_id": field_info["id"],
                "title": lesson.get("title"),
                "summary": lesson.get("summary"),
                "sources": lesson.get("sources", []),
                "learning_objectives": lesson.get("learning_objectives", []),
                "key_concepts": lesson.get("key_concepts", []),
                "estimated_minutes": 15,
                "difficulty_level": "beginner",
                "points": 10,
                "is_published": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            try:
                client.table("synthesized_lessons").insert(synthesized_lesson_data).execute()
            except Exception as synth_err:
                logger.warning(f"Failed to store in synthesized_lessons: {synth_err}")
            
        except Exception as e:
            logger.warning(f"Failed to store lesson in database: {e}")
            # Continue even if storage fails
        
        # Step 4: Generate quiz if requested
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
        
        # Add lesson_id and content to response
        lesson["id"] = lesson_id
        lesson["content"] = lesson.get("summary", "")  # Ensure content is available
        lesson["field_id"] = field_info["id"]
        lesson["field_name"] = field_info["name"]
        lesson["estimated_minutes"] = 15
        lesson["difficulty_level"] = "beginner"
        
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
                "topic": request.topic,
                "lesson_id": lesson_id
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



@router.get("/synthesized")
async def get_synthesized_lessons(
    category_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10
):
    """
    Get synthesized lessons from the database.
    
    Args:
        category_id: Filter by category
        difficulty: Filter by difficulty level
        limit: Maximum number of lessons to return
        
    Returns:
        List of synthesized lessons
    """
    try:
        client = db.client
        query = client.table("synthesized_lessons").select("*")
        
        if category_id:
            query = query.eq("category_id", category_id)
        if difficulty:
            query = query.eq("difficulty_level", difficulty)
        
        query = query.eq("is_published", True).limit(limit).order("created_at", desc=True)
        
        response = query.execute()
        return {"lessons": response.data, "count": len(response.data)}
        
    except Exception as e:
        logger.error(f"Failed to fetch synthesized lessons: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lessons: {str(e)}"
        )


@router.get("/synthesized/{lesson_id}")
async def get_synthesized_lesson(lesson_id: str):
    """
    Get a specific synthesized lesson by ID.
    
    Args:
        lesson_id: Lesson ID
        
    Returns:
        Synthesized lesson details
    """
    try:
        client = db.client
        response = client.table("synthesized_lessons").select("*").eq("id", lesson_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch lesson {lesson_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lesson: {str(e)}"
        )
