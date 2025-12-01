from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MindForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Field definitions
class Field(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    total_lessons: int

# Lesson system
class Lesson(BaseModel):
    id: str
    title: str
    content: str
    field_id: str
    difficulty_level: int  # 1-5
    estimated_minutes: int
    learning_objectives: List[str]
    key_concepts: List[str]

# Quiz system for reinforcement
class QuizQuestion(BaseModel):
    id: str
    lesson_id: str
    question: str
    question_type: str  # 'multiple_choice', 'true_false', 'fill_blank'
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str

class QuizSubmission(BaseModel):
    lesson_id: str
    answers: Dict[str, str]  # question_id -> answer

class QuizResult(BaseModel):
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    correct_answers: List[str]
    incorrect_answers: List[str]
    feedback: Dict[str, str]  # question_id -> explanation
    completed_at: datetime

# User progress tracking
class UserProgress(BaseModel):
    user_id: str
    field_id: str
    lessons_completed: int
    total_lessons: int
    quiz_scores: List[float]
    average_score: float
    streak_days: int
    last_study_date: date

# Daily challenge
class DailyChallenge(BaseModel):
    id: str
    title: str
    description: str
    field_id: str
    lesson_ids: List[str]
    quiz_ids: List[str]
    date: date
    difficulty_level: int

# News integration
class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    content: str
    field_id: str
    source: str
    published_at: datetime
    reading_time_minutes: int
    relevance_score: float

@app.get("/")
async def root():
    return {"message": "MindForge Learning Platform API is running"}

# Fields endpoints
@app.get("/api/fields", response_model=List[Field])
async def get_fields():
    # TODO: Implement database query
    return [
        Field(id="tech", name="Technology", description="Latest in tech and AI", icon="🤖", color="#00FFF0", total_lessons=62),
        Field(id="finance", name="Finance", description="Markets and investing", icon="📈", color="#FF6B35", total_lessons=45),
        Field(id="economics", name="Economics", description="Economic principles and trends", icon="💰", color="#00FF88", total_lessons=38),
        Field(id="culture", name="Culture", description="Arts and society", icon="🌍", color="#FF00FF", total_lessons=28),
        Field(id="influence", name="Influence Skills", description="Communication and leadership", icon="💡", color="#FFD700", total_lessons=33),
        Field(id="global", name="Global Events", description="World news and politics", icon="🌐", color="#00BFFF", total_lessons=41)
    ]

# Lessons endpoints
@app.get("/api/lessons", response_model=List[Lesson])
async def get_lessons(field_id: Optional[str] = None, difficulty: Optional[int] = None):
    # TODO: Implement database query with filters
    return []

@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    # TODO: Implement database query
    return {
        "id": lesson_id,
        "title": "Introduction to Blockchain Technology",
        "content": "Blockchain is a distributed ledger technology...",
        "field_id": "tech",
        "difficulty_level": 2,
        "estimated_minutes": 15,
        "learning_objectives": ["Understand blockchain basics", "Identify key use cases"],
        "key_concepts": ["Distributed ledger", "Cryptography", "Consensus mechanisms"]
    }

# Quiz endpoints
@app.get("/api/quiz/{lesson_id}", response_model=List[QuizQuestion])
async def get_quiz(lesson_id: str):
    # TODO: Implement database query
    return [
        QuizQuestion(
            id="q1",
            lesson_id=lesson_id,
            question="What is the primary purpose of blockchain technology?",
            question_type="multiple_choice",
            options=["Secure data storage", "Fast transactions", "Decentralized trust", "Mining cryptocurrency"],
            correct_answer="Decentralized trust",
            explanation="Blockchain's main purpose is to create trust without central authorities."
        )
    ]

@app.post("/api/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    # TODO: Implement quiz grading and result calculation
    return QuizResult(
        quiz_id=f"quiz_{submission.lesson_id}",
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
        difficulty_level=2
    )

# News endpoints
@app.get("/api/news/{field_id}", response_model=List[NewsItem])
async def get_field_news(field_id: str, limit: int = 10):
    # TODO: Implement news integration
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
