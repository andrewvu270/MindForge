from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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
    difficulty_level: str  # Changed from DifficultyLevel enum to str for flexibility
    estimated_minutes: int
    learning_objectives: Optional[List[str]] = []
    key_concepts: Optional[List[str]] = []
    video_url: Optional[str] = None
    video_duration_seconds: Optional[int] = None
    images: Optional[List[str]] = None
    audio: Optional[str] = None
    field_name: Optional[str] = None
    sources: Optional[List[dict]] = []
    is_generated: Optional[bool] = False
    is_auto_generated: Optional[bool] = False
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


# ============================================
# Frankenstein Multi-Source Learning Models
# ============================================

class SourceAttribution(BaseModel):
    """Source attribution for synthesized lessons"""
    name: str  # Source name (e.g., "hackernews", "reddit")
    title: str  # Original content title
    url: Optional[str] = None

class SynthesizedLesson(BaseModel):
    """Lesson generated from multiple external sources"""
    id: str
    category_id: str
    title: str
    summary: str  # AI-generated summary (<200 words)
    sources: List[SourceAttribution]  # Source attribution
    learning_objectives: List[str]
    key_concepts: List[str]
    estimated_minutes: int = 15
    difficulty_level: DifficultyLevel = DifficultyLevel.BEGINNER
    points: int = 10
    is_published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Reflection(BaseModel):
    """User reflection on influence skills"""
    id: str
    user_id: str
    prompt: str
    response: str
    ai_feedback: Optional[str] = None
    quality_score: Optional[float] = None  # 0-100
    insights: Optional[List[str]] = None
    suggestion: Optional[str] = None
    submitted_at: datetime

class ReflectionFeedback(BaseModel):
    """AI-generated feedback for a reflection"""
    feedback: str
    quality_score: float  # 0-100
    insights: List[str]
    suggestion: str

class Achievement(BaseModel):
    """Achievement that users can unlock"""
    id: str
    name: str
    description: str
    icon: str
    criteria: Dict[str, Any]  # Flexible criteria (e.g., {"type": "streak", "value": 7})
    points_reward: int = 0
    created_at: Optional[datetime] = None

class UserAchievement(BaseModel):
    """User's unlocked achievement"""
    user_id: str
    achievement_id: str
    unlocked_at: datetime

class LeaderboardEntry(BaseModel):
    """Entry in the leaderboard"""
    rank: int
    user_id: str
    username: str
    display_name: Optional[str] = None
    total_points: int
    current_streak: int
    longest_streak: int
    lessons_completed: int
    achievements_earned: int

class SessionType(str, Enum):
    """Types of scheduled sessions"""
    LESSON = "lesson"
    QUIZ = "quiz"
    REFLECTION = "reflection"

class ScheduledSession(BaseModel):
    """Scheduled learning session"""
    id: str
    user_id: str
    session_type: SessionType
    content_id: Optional[str] = None  # lesson_id or synthesized_lesson_id
    scheduled_time: datetime
    completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

class SchedulePreferences(BaseModel):
    """User's scheduling preferences"""
    user_id: str
    preferred_days: List[str]  # ["Monday", "Tuesday", ...]
    preferred_time: str  # "09:00:00"
    sessions_per_week: int = 3
    lesson_frequency: int = 2
    quiz_frequency: int = 2
    reflection_frequency: int = 1
    notifications_enabled: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ReflectionPrompt(BaseModel):
    """Reflection prompt for influence skills"""
    id: str
    prompt: str
    category: str = "influence"
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    created_at: Optional[datetime] = None

class UserStats(BaseModel):
    """Aggregated user statistics"""
    user_id: str
    total_points: int
    current_streak: int
    longest_streak: int
    lessons_completed: int
    quizzes_completed: int
    reflections_completed: int
    achievements_earned: int
    average_quiz_score: float
    fields_studied: List[str]

# Update TABLES dictionary with new models
TABLES.update({
    "synthesized_lessons": SynthesizedLesson,
    "reflections": Reflection,
    "achievements": Achievement,
    "user_achievements": UserAchievement,
    "scheduled_sessions": ScheduledSession,
    "schedule_preferences": SchedulePreferences,
    "reflection_prompts": ReflectionPrompt
})
