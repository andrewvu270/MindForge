"""
Progress tracking service for user learning progress and stats.
"""
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from supabase import Client
import os

logger = logging.getLogger(__name__)


class ProgressService:
    """Service for tracking user progress and statistics."""
    
    def __init__(self):
        from supabase import create_client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics."""
        try:
            # Get or create user stats
            stats_response = self.client.table("user_stats").select("*").eq("user_id", user_id).execute()
            
            if not stats_response.data:
                # Create default stats for new user
                default_stats = {
                    "user_id": user_id,
                    "total_points": 0,
                    "lessons_completed": 0,
                    "quizzes_completed": 0,
                    "perfect_scores": 0,
                    "current_streak": 0,
                    "longest_streak": 0,
                    "total_study_time_minutes": 0,
                    "average_quiz_score": 0.0,
                    "last_activity_date": None,
                }
                self.client.table("user_stats").insert(default_stats).execute()
                return default_stats
            
            return stats_response.data[0]
        
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return {
                "user_id": user_id,
                "total_points": 0,
                "lessons_completed": 0,
                "quizzes_completed": 0,
                "perfect_scores": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "total_study_time_minutes": 0,
                "average_quiz_score": 0.0,
            }
    
    def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Get detailed user progress including field breakdown."""
        try:
            # Get user stats
            stats = self.get_user_stats(user_id)
            
            # Get progress by field
            progress_response = self.client.table("user_progress").select(
                "*, lessons(field_id, field_name, category_id, categories(name))"
            ).eq("user_id", user_id).eq("completed", True).execute()
            
            # Aggregate by field
            field_progress = {}
            for record in progress_response.data:
                lesson = record.get("lessons", {})
                field_id = lesson.get("field_id") or "unknown"
                field_name = lesson.get("field_name") or "Unknown"
                
                if field_id not in field_progress:
                    field_progress[field_id] = {
                        "field_id": field_id,
                        "field_name": field_name,
                        "completed_lessons": 0,
                        "total_points": 0,
                        "total_time_minutes": 0,
                    }
                
                field_progress[field_id]["completed_lessons"] += 1
                field_progress[field_id]["total_points"] += record.get("points_earned", 0)
                field_progress[field_id]["total_time_minutes"] += record.get("time_spent_seconds", 0) // 60
            
            # Get recent quiz scores
            quiz_response = self.client.table("quiz_attempts").select(
                "*, quizzes(lesson_id), lessons(title)"
            ).eq("user_id", user_id).order("attempted_at", desc=True).limit(10).execute()
            
            quiz_scores = []
            for attempt in quiz_response.data:
                quiz_scores.append({
                    "lesson_title": attempt.get("lessons", {}).get("title", "Unknown"),
                    "score": 100 if attempt.get("is_correct") else 0,
                    "completed_at": attempt.get("attempted_at"),
                })
            
            return {
                "user_id": user_id,
                "total_lessons_completed": stats.get("lessons_completed", 0),
                "total_points": stats.get("total_points", 0),
                "current_streak": stats.get("current_streak", 0),
                "longest_streak": stats.get("longest_streak", 0),
                "total_study_time_minutes": stats.get("total_study_time_minutes", 0),
                "field_progress": list(field_progress.values()),
                "quiz_scores": quiz_scores,
            }
        
        except Exception as e:
            logger.error(f"Error getting user progress: {e}")
            return {
                "user_id": user_id,
                "total_lessons_completed": 0,
                "total_points": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "total_study_time_minutes": 0,
                "field_progress": [],
                "quiz_scores": [],
            }
    
    def complete_lesson(self, user_id: str, lesson_id: str, time_spent_seconds: int = 300) -> Dict[str, Any]:
        """Mark a lesson as completed and update stats."""
        try:
            # Get lesson details
            lesson_response = self.client.table("lessons").select("*").eq("id", lesson_id).execute()
            if not lesson_response.data:
                raise ValueError(f"Lesson {lesson_id} not found")
            
            lesson = lesson_response.data[0]
            points = lesson.get("points", 10)
            
            # Check if already completed
            existing = self.client.table("user_progress").select("*").eq(
                "user_id", user_id
            ).eq("lesson_id", lesson_id).execute()
            
            if existing.data and existing.data[0].get("completed"):
                logger.info(f"Lesson {lesson_id} already completed by user {user_id}")
                return {"status": "already_completed", "points_earned": 0}
            
            # Create or update progress record
            progress_data = {
                "user_id": user_id,
                "lesson_id": lesson_id,
                "category_id": lesson.get("category_id"),
                "completed": True,
                "points_earned": points,
                "time_spent_seconds": time_spent_seconds,
                "completed_at": datetime.now().isoformat(),
            }
            
            if existing.data:
                self.client.table("user_progress").update(progress_data).eq(
                    "id", existing.data[0]["id"]
                ).execute()
            else:
                self.client.table("user_progress").insert(progress_data).execute()
            
            # Update user stats
            self._update_user_stats(user_id, points, time_spent_seconds)
            
            logger.info(f"Lesson {lesson_id} completed by user {user_id}, earned {points} points")
            
            return {
                "status": "completed",
                "points_earned": points,
                "lesson_id": lesson_id,
            }
        
        except Exception as e:
            logger.error(f"Error completing lesson: {e}")
            raise
    
    def _update_user_stats(self, user_id: str, points_earned: int, time_spent_seconds: int):
        """Update user statistics after completing a lesson."""
        try:
            stats = self.get_user_stats(user_id)
            
            # Calculate streak
            last_activity = stats.get("last_activity_date")
            today = date.today()
            current_streak = stats.get("current_streak", 0)
            
            if last_activity:
                last_date = datetime.fromisoformat(str(last_activity)).date() if isinstance(last_activity, str) else last_activity
                days_diff = (today - last_date).days
                
                if days_diff == 0:
                    # Same day, keep streak
                    pass
                elif days_diff == 1:
                    # Consecutive day, increment streak
                    current_streak += 1
                else:
                    # Streak broken, reset to 1
                    current_streak = 1
            else:
                # First activity
                current_streak = 1
            
            # Update stats
            updated_stats = {
                "total_points": stats.get("total_points", 0) + points_earned,
                "lessons_completed": stats.get("lessons_completed", 0) + 1,
                "current_streak": current_streak,
                "longest_streak": max(stats.get("longest_streak", 0), current_streak),
                "total_study_time_minutes": stats.get("total_study_time_minutes", 0) + (time_spent_seconds // 60),
                "last_activity_date": today.isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
            
            self.client.table("user_stats").update(updated_stats).eq("user_id", user_id).execute()
            
        except Exception as e:
            logger.error(f"Error updating user stats: {e}")
    
    def get_daily_challenge_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's progress on today's daily challenge."""
        try:
            today = date.today()
            
            # Get today's completed lessons
            completed_today = self.client.table("user_progress").select("*").eq(
                "user_id", user_id
            ).eq("completed", True).gte(
                "completed_at", today.isoformat()
            ).execute()
            
            lessons_today = len(completed_today.data)
            
            # Get today's quiz attempts
            quiz_today = self.client.table("quiz_attempts").select("*").eq(
                "user_id", user_id
            ).gte("attempted_at", today.isoformat()).execute()
            
            quizzes_today = len(quiz_today.data)
            
            # Get today's reflections
            reflection_response = self.client.table("reflections").select("*").eq(
                "user_id", user_id
            ).gte("created_at", today.isoformat()).execute()
            
            reflections_today = len(reflection_response.data) if reflection_response.data else 0
            
            # Daily challenge: 1 lesson, 1 quiz, 1 reflection, 10 flashcards (we'll assume flashcards for now)
            completed_tasks = []
            if lessons_today > 0:
                completed_tasks.append("watch")
            if quizzes_today > 0:
                completed_tasks.append("quiz")
            if reflections_today > 0:
                completed_tasks.append("reflection")
            
            # Flashcards - we'll add this when we track flashcard reviews
            # For now, assume completed if user has done 3+ activities
            if len(completed_tasks) >= 3:
                completed_tasks.append("flashcards")
            
            return {
                "completed_count": len(completed_tasks),
                "total_count": 4,
                "completed_tasks": completed_tasks,
                "lessons_today": lessons_today,
                "quizzes_today": quizzes_today,
                "reflections_today": reflections_today,
            }
        
        except Exception as e:
            logger.error(f"Error getting daily challenge progress: {e}")
            return {
                "completed_count": 0,
                "total_count": 4,
                "completed_tasks": [],
                "lessons_today": 0,
                "quizzes_today": 0,
                "reflections_today": 0,
            }


# Singleton instance
_progress_service = None


def get_progress_service() -> ProgressService:
    """Get or create the progress service singleton."""
    global _progress_service
    if _progress_service is None:
        _progress_service = ProgressService()
    return _progress_service
