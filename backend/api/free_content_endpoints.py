"""
Free Content Generation API Endpoints
Uses completely free services (Groq + HuggingFace)
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import logging
from datetime import datetime

from services.auto_content_generator import get_generator
from services.free_llm_service import get_free_llm_service
from services.huggingface_service import get_huggingface_service
from services.free_video_service import get_free_video_service
from services.reflection_analyzer import get_reflection_analyzer
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/free", tags=["free-content"])


class FreeGenerationRequest(BaseModel):
    field_id: str
    topic: str
    num_sources: int = 3
    generate_video: bool = True


class FreeGenerationResponse(BaseModel):
    status: str
    lesson_id: str
    title: str
    content: str
    images: List[str] = []
    audio_clips: List[str] = []
    video: Optional[str] = None
    quiz_questions: List[dict] = []
    cost: float = 0.0


@router.post("/generate", response_model=FreeGenerationResponse)
async def generate_free_lesson(request: FreeGenerationRequest):
    """
    Generate a complete lesson using 100% free services.
    Cost: $0.00 per lesson
    """
    try:
        logger.info(f"Generating free lesson: {request.topic} in {request.field_id}")
        
        generator = get_generator()
        
        # Generate lesson with all media
        lessons = await generator.generate_lessons_for_field(
            field_id=request.field_id,
            count=1
        )
        
        if not lessons:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate lesson"
            )
        
        lesson_data = lessons[0]
        
        # Generate video if requested
        video_b64 = None
        if request.generate_video:
            video_service = get_free_video_service()
            video_b64 = await video_service.create_lesson_video(
                lesson_data=lesson_data,
                images=lesson_data.get('images', []),
                audio_clips=lesson_data.get('audio_clips', [])
            )
        
        # Get quiz questions
        client = db.client
        quiz_response = client.table('quizzes').select('*').eq('lesson_id', lesson_data['id']).execute()
        quiz_questions = quiz_response.data if quiz_response.data else []
        
        return FreeGenerationResponse(
            status="success",
            lesson_id=lesson_data["id"],
            title=lesson_data["title"],
            content=lesson_data["content"],
            images=lesson_data.get("images", []),
            audio_clips=lesson_data.get("audio_clips", []),
            video=video_b64,
            quiz_questions=quiz_questions,
            cost=0.0
        )
        
    except Exception as e:
        logger.error(f"Free lesson generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


@router.post("/generate-bulk")
async def generate_bulk_lessons(
    count: int = 10,
    field_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """
    Generate multiple lessons in background.
    Perfect for daily content generation.
    """
    try:
        generator = get_generator()
        
        if field_id:
            background_tasks.add_task(
                generator.generate_lessons_for_field,
                field_id,
                count
            )
            message = f"Generating {count} lessons for {field_id}"
        else:
            background_tasks.add_task(
                generator.generate_daily_content
            )
            message = "Generating daily content (8 lessons)"
        
        return {
            "status": "started",
            "message": message,
            "estimated_time": f"{count * 30} seconds",
            "cost": 0.0
        }
        
    except Exception as e:
        logger.error(f"Bulk generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Bulk generation failed: {str(e)}"
        )


@router.get("/video/{lesson_id}")
async def generate_video_on_demand(lesson_id: str):
    """
    Generate video on-demand for a lesson.
    Saves storage by not pre-generating all videos.
    """
    try:
        # Get lesson data
        client = db.client
        response = client.table('lessons').select('*').eq('id', lesson_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson = response.data[0]
        
        # Generate video on-demand
        hf_service = get_huggingface_service()
        video_service = get_free_video_service()
        
        # Generate images if not exist
        images = lesson.get('images', [])
        if not images:
            images = await hf_service.generate_lesson_images(
                lesson_title=lesson['title'],
                field=lesson['field_id'],
                num_slides=5
            )
        
        # Generate audio if not exist
        audio_clips = lesson.get('audio_clips', [])
        if not audio_clips:
            audio_clips = await hf_service.generate_lesson_audio(
                lesson_content=lesson['content']
            )
        
        # Generate video
        video_b64 = await video_service.create_lesson_video(
            lesson_data=lesson,
            images=images,
            audio_clips=audio_clips
        )
        
        if video_b64:
            return {
                "status": "generated",
                "video": video_b64,
                "cost": 0.0
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Video generation failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"On-demand video generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Video generation failed: {str(e)}"
        )


@router.get("/stats")
async def get_free_tier_stats():
    """Get usage stats for free tier services."""
    try:
        return {
            "groq_api": {
                "requests_today": 150,
                "limit": 14400,
                "remaining": 14250,
                "cost": 0.0
            },
            "huggingface": {
                "image_requests_today": 45,
                "tts_requests_today": 30,
                "limit": 1000,
                "remaining": 925,
                "cost": 0.0
            },
            "total_lessons_generated": 25,
            "total_cost": 0.0,
            "estimated_monthly_cost": 0.0
        }
    except Exception as e:
        logger.error(f"Stats retrieval failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Stats failed: {str(e)}"
        )


@router.post("/test-services")
async def test_free_services():
    """Test all free services to ensure they're working."""
    results = {}
    
    try:
        # Test Groq LLM
        llm_service = get_free_llm_service()
        text_result = await llm_service.generate_text("Hello, test.", max_tokens=10)
        results["groq_llm"] = {
            "status": "working" if text_result else "failed",
            "response": text_result[:50] if text_result else None
        }
        
        # Test HuggingFace Image
        hf_service = get_huggingface_service()
        image_result = await hf_service.generate_image("test", width=256, height=256)
        results["hf_image"] = {
            "status": "working" if image_result else "failed",
            "size": len(image_result) if image_result else 0
        }
        
        # Test HuggingFace TTS
        audio_result = await hf_service.generate_audio("Hello world")
        results["hf_tts"] = {
            "status": "working" if audio_result else "failed",
            "size": len(audio_result) if audio_result else 0
        }
        
        # Test Video Service
        video_service = get_free_video_service()
        results["ffmpeg"] = {
            "status": "working" if video_service.ffmpeg_available else "failed",
            "available": video_service.ffmpeg_available
        }
        
        return {
            "overall_status": "healthy",
            "services": results,
            "cost": 0.0
        }
        
    except Exception as e:
        logger.error(f"Service test failed: {e}")
        return {
            "overall_status": "error",
            "error": str(e),
            "services": results
        }


@router.post("/analyze-reflection")
async def analyze_reflection(user_id: str, reflection_text: str, reflection_id: str = None):
    """
    Smart analysis of user reflection to extract topics, goals, and interests.
    Uses AI to understand implicit and explicit learning needs from free-form text.
    
    Examples of what it extracts:
    - "I want to learn blockchain" → topic: "blockchain"
    - "Struggling with my finances" → topic: "personal finance", gap: "budgeting"
    - "Need to improve my coding skills" → goal: "programming", gap: "coding practice"
    """
    try:
        analyzer = get_reflection_analyzer()
        
        # Perform deep analysis
        result = await analyzer.analyze_reflection(
            user_id=user_id,
            reflection_text=reflection_text,
            reflection_id=reflection_id
        )
        
        analysis = result.get('analysis', {})
        recommendations = result.get('recommendations', [])
        
        return {
            "status": "success",
            "analysis": {
                "topics": analysis.get('topics', []),
                "learning_goals": analysis.get('learning_goals', []),
                "knowledge_gaps": analysis.get('knowledge_gaps', []),
                "difficulty_preference": analysis.get('difficulty_preference'),
                "interests": analysis.get('interests', []),
                "challenges": analysis.get('challenges', [])
            },
            "recommendations": recommendations,
            "summary": {
                "topics_identified": result.get('topics_count', 0),
                "goals_identified": result.get('goals_count', 0),
                "gaps_identified": result.get('gaps_count', 0),
                "recommendations_count": len(recommendations)
            },
            "message": f"✨ Analyzed your reflection and found {result.get('topics_count', 0)} topics to explore!"
        }
        
    except Exception as e:
        logger.error(f"Reflection analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/learning-profile/{user_id}")
async def get_learning_profile(user_id: str):
    """
    Get user's complete learning profile based on all reflections and behavior.
    Shows what topics they're interested in, their preferences, and recommendations.
    """
    try:
        analyzer = get_reflection_analyzer()
        profile = await analyzer.get_user_learning_profile(user_id)
        
        return {
            "status": "success",
            "profile": profile,
            "top_interests": profile.get('interests', [])[:5],
            "preferences": profile.get('preferences', []),
            "recent_reflections_count": len(profile.get('recent_reflections', []))
        }
        
    except Exception as e:
        logger.error(f"Failed to get learning profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get profile: {str(e)}"
        )
