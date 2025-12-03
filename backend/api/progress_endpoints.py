"""
Progress tracking API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.progress_service import get_progress_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/progress", tags=["progress"])


class LessonCompletionRequest(BaseModel):
    user_id: str
    time_spent_seconds: Optional[int] = 300


@router.get("/{user_id}")
async def get_user_progress(user_id: str) -> Dict[str, Any]:
    """
    Get detailed user progress including field breakdown and quiz scores.
    
    Returns:
    - total_lessons_completed: Total number of lessons completed
    - total_points: Total points earned
    - current_streak: Current daily streak
    - longest_streak: Longest streak achieved
    - total_study_time_minutes: Total study time in minutes
    - field_progress: Progress breakdown by field
    - quiz_scores: Recent quiz scores
    """
    try:
        progress_service = get_progress_service()
        progress = progress_service.get_user_progress(user_id)
        return progress
    except Exception as e:
        logger.error(f"Error getting user progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """
    Get user statistics summary.
    
    Returns basic stats like points, lessons completed, streaks, etc.
    """
    try:
        progress_service = get_progress_service()
        stats = progress_service.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/lessons/{lesson_id}/complete")
async def complete_lesson(
    user_id: str,
    lesson_id: str,
    request: Optional[LessonCompletionRequest] = None
) -> Dict[str, Any]:
    """
    Mark a lesson as completed for a user.
    
    Updates:
    - user_progress table
    - user_stats (points, streak, study time)
    
    Returns completion status and points earned.
    """
    try:
        progress_service = get_progress_service()
        time_spent = request.time_spent_seconds if request else 300
        result = progress_service.complete_lesson(user_id, lesson_id, time_spent)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error completing lesson: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/daily-challenge")
async def get_daily_challenge_progress(user_id: str) -> Dict[str, Any]:
    """
    Get user's progress on today's daily challenge.
    
    Returns:
    - completed_count: Number of tasks completed today
    - total_count: Total number of daily challenge tasks
    - completed_tasks: List of completed task types
    - lessons_today: Number of lessons completed today
    - quizzes_today: Number of quizzes completed today
    - reflections_today: Number of reflections submitted today
    """
    try:
        progress_service = get_progress_service()
        progress = progress_service.get_daily_challenge_progress(user_id)
        return progress
    except Exception as e:
        logger.error(f"Error getting daily challenge progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))
