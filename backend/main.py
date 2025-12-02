from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from datetime import datetime, date
from dotenv import load_dotenv

from database import db
from models import *
from seed_data import get_seed_data
from api.lesson_endpoints import router as lesson_router
from api.gamification_endpoints import router as gamification_router

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

# Field definitions (moved to models.py)

@app.get("/")
async def root():
    return {"message": "MindForge Learning Platform API is running"}

# Fields endpoints
@app.get("/api/fields", response_model=List[Field])
async def get_fields():
    try:
        client = db.get_client()
        response = client.table("fields").select("*").execute()
        return response.data
    except Exception as e:
        # Fallback to seed data if database not available
        return get_seed_data()["fields"]

# Lessons endpoints
@app.get("/api/lessons", response_model=List[Lesson])
async def get_lessons(field_id: Optional[str] = None, difficulty: Optional[str] = None):
    try:
        client = db.get_client()
        query = client.table("lessons").select("*")
        
        if field_id:
            query = query.eq("field_id", field_id)
        if difficulty:
            query = query.eq("difficulty_level", difficulty)
            
        response = query.execute()
        return response.data
    except Exception as e:
        # Fallback to seed data
        seed_lessons = get_seed_data()["lessons"]
        if field_id:
            seed_lessons = [l for l in seed_lessons if l.field_id == field_id]
        if difficulty:
            seed_lessons = [l for l in seed_lessons if l.difficulty_level == difficulty]
        return seed_lessons

@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    try:
        client = db.get_client()
        response = client.table("lessons").select("*").eq("id", lesson_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Lesson not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        # Fallback to seed data
        seed_lessons = get_seed_data()["lessons"]
        lesson = next((l for l in seed_lessons if l.id == lesson_id), None)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        return lesson

# Quiz endpoints
@app.get("/api/quiz/{lesson_id}", response_model=List[QuizQuestion])
async def get_quiz(lesson_id: str):
    try:
        client = db.get_client()
        response = client.table("quiz_questions").select("*").eq("lesson_id", lesson_id).execute()
        return response.data
    except Exception as e:
        # Fallback to seed data
        seed_questions = get_seed_data()["quiz_questions"]
        return [q for q in seed_questions if q.lesson_id == lesson_id]

@app.post("/api/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    # TODO: Implement quiz grading and result calculation
    return QuizResult(
        id=f"result_{submission.lesson_id}_{submission.user_id}",
        quiz_id=f"quiz_{submission.lesson_id}",
        user_id=submission.user_id,
        lesson_id=submission.lesson_id,
        score=3,
        total_questions=5,
        percentage=60.0,
        correct_answers=["q1", "q2", "q3"],
        incorrect_answers=["q4", "q5"],
        feedback={"q1": "Good understanding of blockchain basics"},
        completed_at=datetime.now()
    )

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
