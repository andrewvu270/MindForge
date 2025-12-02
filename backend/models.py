from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, date
from enum import Enum

# Enums
class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"

# Base Models
class Field(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    total_lessons: int
    created_at: Optional[datetime] = None

class Lesson(BaseModel):
    id: str
    title: str
    content: str
    field_id: str
    difficulty_level: DifficultyLevel
    estimated_minutes: int
    learning_objectives: List[str]
    key_concepts: List[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class QuizQuestion(BaseModel):
    id: str
    lesson_id: str
    question: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    created_at: Optional[datetime] = None

class QuizSubmission(BaseModel):
    lesson_id: str
    user_id: str
    answers: Dict[str, str]  # question_id -> answer
    submitted_at: datetime

class QuizResult(BaseModel):
    id: str
    quiz_id: str
    user_id: str
    lesson_id: str
    score: int
    total_questions: int
    percentage: float
    correct_answers: List[str]
    incorrect_answers: List[str]
    feedback: Dict[str, str]  # question_id -> explanation
    completed_at: datetime

class UserProgress(BaseModel):
    id: str
    user_id: str
    field_id: str
    lessons_completed: int
    total_lessons: int
    quiz_scores: List[float]
    average_score: float
    streak_days: int
    last_study_date: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DailyChallenge(BaseModel):
    id: str
    title: str
    description: str
    field_id: str
    lesson_ids: List[str]
    quiz_ids: List[str]
    date: date
    difficulty_level: DifficultyLevel
    created_at: Optional[datetime] = None

class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    content: str
    field_id: str
    source: str
    url: Optional[str] = None
    published_at: datetime
    reading_time_minutes: int
    relevance_score: float
    created_at: Optional[datetime] = None

class User(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_tier: str = "free"  # free, premium
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

# Database Tables (for reference)
TABLES = {
    "fields": Field,
    "lessons": Lesson,
    "quiz_questions": QuizQuestion,
    "quiz_results": QuizResult,
    "user_progress": UserProgress,
    "daily_challenges": DailyChallenge,
    "news_items": NewsItem,
    "users": User
}
