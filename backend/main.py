from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import logging
import uuid
from datetime import datetime, date
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

from database import db
from models import *
from api.lesson_endpoints import router as lesson_router
from api.gamification_endpoints import router as gamification_router
from api.quiz_endpoints import router as quiz_router
from api.reflection_endpoints import router as reflection_router
from api.scheduling_endpoints import router as scheduling_router
from api.content_generation_endpoints import router as content_generation_router
from api.free_content_endpoints import router as free_content_router

load_dotenv()

app = FastAPI(title="MindForge API", version="1.0.0")

# Add CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lesson_router)
app.include_router(gamification_router)
app.include_router(quiz_router)
app.include_router(reflection_router)
app.include_router(scheduling_router)
app.include_router(content_generation_router)
app.include_router(free_content_router)

# Field definitions (moved to models.py)

@app.get("/")
async def root():
    return {"message": "MindForge Learning Platform API is running"}

# Fields endpoints
@app.get("/api/fields", response_model=List[Field])
async def get_fields():
    try:
        response = db.client.table("categories").select("*").execute()
        # Map categories to fields format
        fields = []
        for cat in response.data:
            fields.append({
                "id": cat.get("slug", cat["id"]),
                "name": cat["name"],
                "description": cat.get("description", ""),
                "icon": cat.get("icon", "📚"),
                "color": cat.get("color", "#3B82F6"),
                "total_lessons": 0,  # Will be calculated
                "created_at": cat.get("created_at")
            })
        return fields
    except Exception as e:
        logger.error(f"Error fetching fields: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching fields: {str(e)}")

# Lessons endpoints
@app.get("/api/lessons", response_model=List[Lesson])
async def get_lessons(field_id: Optional[str] = None, difficulty: Optional[str] = None):
    """
    Get all lessons (both seed data and AI-generated).
    AI-generated lessons take priority.
    """
    try:
        lessons = []
        
        # Get auto-generated lessons from lessons table (from auto_content_generator)
        # Select only needed columns (exclude large images/audio columns for list view)
        query = db.client.table("lessons").select(
            "id,title,content,field_id,field_name,difficulty_level,estimated_minutes,"
            "learning_objectives,key_concepts,video_url,video_duration_seconds,sources,"
            "is_auto_generated,created_at"
        )
        
        if field_id:
            query = query.eq("field_id", field_id)
        if difficulty:
            query = query.eq("difficulty_level", difficulty)
            
        response = query.order("created_at", desc=True).limit(50).execute()
        auto_lessons = response.data
        
        # Add auto-generated lessons
        for lesson in auto_lessons:
            # Normalize difficulty level to lowercase
            difficulty = lesson.get("difficulty_level", "beginner")
            if isinstance(difficulty, str):
                difficulty = difficulty.lower()
            
            lessons.append({
                "id": lesson["id"],
                "field_id": lesson.get("field_id", "tech"),
                "field_name": lesson.get("field_name", "Technology"),
                "title": lesson["title"],
                "content": lesson.get("content", "")[:500],  # Truncate for list view
                "difficulty_level": difficulty,
                "estimated_minutes": lesson.get("estimated_minutes", 15),
                "learning_objectives": lesson.get("learning_objectives", []),
                "key_concepts": lesson.get("key_concepts", []),
                "video_url": lesson.get("video_url"),
                "video_duration_seconds": lesson.get("video_duration_seconds"),
                "sources": lesson.get("sources", []),
                "created_at": lesson.get("created_at"),
                "is_generated": True,
                "is_auto_generated": lesson.get("is_auto_generated", False)
            })
        
        return lessons
        
    except Exception as e:
        logger.error(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching lessons: {str(e)}")

@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    """
    Get a specific lesson by ID.
    """
    try:
        # Get from lessons table
        response = db.client.table("lessons").select("*").eq("id", lesson_id).execute()
        if response.data:
            lesson = response.data[0]
            # Normalize difficulty level to lowercase
            if "difficulty_level" in lesson and isinstance(lesson["difficulty_level"], str):
                lesson["difficulty_level"] = lesson["difficulty_level"].lower()
            return lesson
            
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching lesson {lesson_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching lesson: {str(e)}")

# Quiz endpoints are handled by quiz_router (quiz_endpoints.py)

# Lesson completion endpoint
@app.post("/api/lessons/{lesson_id}/complete")
async def complete_lesson(lesson_id: str, user_id: str = "user_1"):
    """Mark a lesson as completed for a user."""
    try:
        # Update user progress
        progress_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "lesson_id": lesson_id,
            "completed": True,
            "points_earned": 10,
            "completed_at": datetime.now().isoformat()
        }
        
        # Upsert progress
        db.client.table("user_progress").upsert(
            progress_data, 
            on_conflict="user_id,lesson_id"
        ).execute()
        
        # Update user stats
        try:
            stats_response = db.client.table("user_stats").select("*").eq("user_id", user_id).execute()
            if stats_response.data:
                current = stats_response.data[0]
                db.client.table("user_stats").update({
                    "lessons_completed": current.get("lessons_completed", 0) + 1,
                    "total_points": current.get("total_points", 0) + 10,
                    "updated_at": datetime.now().isoformat()
                }).eq("user_id", user_id).execute()
        except Exception as e:
            logger.warning(f"Failed to update user stats: {e}")
        
        return {"status": "success", "points_earned": 10}
        
    except Exception as e:
        logger.error(f"Error completing lesson: {e}")
        raise HTTPException(status_code=500, detail=f"Error completing lesson: {str(e)}")

# Progress endpoints
@app.get("/api/progress/{user_id}", response_model=Dict[str, UserProgress])
async def get_user_progress(user_id: str):
    # TODO: Implement progress tracking
    return {}

@app.post("/api/progress/{user_id}/{field_id}")
async def update_progress(user_id: str, field_id: str, lesson_completed: bool):
    # TODO: Implement progress update
    return {"status": "success"}

# Daily challenges
@app.get("/api/daily-challenge", response_model=DailyChallenge)
async def get_daily_challenge():
    # TODO: Implement daily challenge generation
    return DailyChallenge(
        id="daily_001",
        title="AI & Machine Learning Fundamentals",
        description="Complete 3 lessons and quiz on AI basics",
        field_id="tech",
        lesson_ids=["lesson_1", "lesson_2", "lesson_3"],
        quiz_ids=["quiz_1"],
        date=date.today(),
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        created_at=datetime.now()
    )

# News endpoints
@app.get("/api/news/{field_id}", response_model=List[NewsItem])
async def get_field_news(field_id: str, limit: int = 10):
    # TODO: Implement news integration
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
