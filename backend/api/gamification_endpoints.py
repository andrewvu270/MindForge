"""
API endpoints for gamification features
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
import logging

from services.gamification_service import (
    GamificationService,
    ActivityType,
    DifficultyLevel
)
from services.progress_service import get_progress_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

# Initialize service
gamification_service = GamificationService()


class AwardPointsRequest(BaseModel):
    user_id: str
    activity_type: ActivityType
    difficulty: Optional[DifficultyLevel] = None
    quiz_score: Optional[float] = None
    completion_time_minutes: Optional[int] = None


class AwardPointsResponse(BaseModel):
    points_earned: int
    new_streak: int
    streak_milestone: Optional[str]
    new_achievements: List[Dict]
    total_achievement_points: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    total_points: int
    current_streak: int
    lessons_completed: int


class UserStatsResponse(BaseModel):
    user_id: str
    total_points: int
    current_streak: int
    longest_streak: int
    lessons_completed: int
    quizzes_completed: int
    reflections_submitted: int
    unlocked_achievements: List[str]
    rank: Optional[int] = None


@router.post("/award-points", response_model=AwardPointsResponse)
async def award_points(request: AwardPointsRequest):
    """
    Award points for completing an activity.
    
    Args:
        request: Activity details
        
    Returns:
        Points earned and any new achievements/milestones
    """
    try:
        # Get or create user stats
        if request.user_id not in user_stats_db:
            user_stats_db[request.user_id] = {
                "user_id": request.user_id,
                "total_points": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "last_activity_date": None,
                "lessons_completed": 0,
                "quizzes_completed": 0,
                "perfect_quizzes": 0,
                "reflections_submitted": 0,
                "fields_studied": 0,
                "unlocked_achievements": []
            }
        
        user_stats = user_stats_db[request.user_id]
        
        # Award points
        result = gamification_service.award_points(
            activity_type=request.activity_type,
            user_stats=user_stats,
            difficulty=request.difficulty,
            quiz_score=request.quiz_score,
            completion_time_minutes=request.completion_time_minutes
        )
        
        # Update user stats
        user_stats["total_points"] += result["points_earned"]
        user_stats["current_streak"] = result["new_streak"]
        user_stats["longest_streak"] = max(
            user_stats["longest_streak"],
            result["new_streak"]
        )
        user_stats["last_activity_date"] = date.today()
        
        # Update activity counters
        if request.activity_type == ActivityType.LESSON_COMPLETED:
            user_stats["lessons_completed"] += 1
        elif request.activity_type == ActivityType.QUIZ_COMPLETED:
            user_stats["quizzes_completed"] += 1
            if request.quiz_score == 100:
                user_stats["perfect_quizzes"] += 1
        elif request.activity_type == ActivityType.REFLECTION_SUBMITTED:
            user_stats["reflections_submitted"] += 1
        
        # Add new achievements
        for achievement in result["new_achievements"]:
            user_stats["unlocked_achievements"].append(achievement["id"])
            user_stats["total_points"] += achievement["points"]
        
        logger.info(
            f"Awarded {result['points_earned']} points to user {request.user_id}. "
            f"New total: {user_stats['total_points']}"
        )
        
        return AwardPointsResponse(**result)
        
    except Exception as e:
        logger.error(f"Failed to award points: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to award points: {str(e)}"
        )


@router.get("/stats/{user_id}", response_model=UserStatsResponse)
async def get_user_stats(user_id: str):
    """
    Get user's gamification stats from database.
    
    Args:
        user_id: User ID
        
    Returns:
        User statistics
    """
    try:
        progress_service = get_progress_service()
        stats = progress_service.get_user_stats(user_id)
        
        # Get achievements (if implemented)
        unlocked_achievements = []
        
        # Calculate rank (simplified - would need all users for real ranking)
        rank = None
        
        return UserStatsResponse(
            user_id=user_id,
            total_points=stats.get("total_points", 0),
            current_streak=stats.get("current_streak", 0),
            longest_streak=stats.get("longest_streak", 0),
            lessons_completed=stats.get("lessons_completed", 0),
            quizzes_completed=stats.get("quizzes_completed", 0),
            reflections_submitted=0,  # TODO: Add reflections count
            unlocked_achievements=unlocked_achievements,
            rank=rank
        )
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        # Return default stats on error
        return UserStatsResponse(
            user_id=user_id,
            total_points=0,
            current_streak=0,
            longest_streak=0,
            lessons_completed=0,
            quizzes_completed=0,
            reflections_submitted=0,
            unlocked_achievements=[],
            rank=None
        )


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 100, scope: str = "global"):
    """
    Get leaderboard rankings.
    
    Args:
        limit: Maximum number of entries
        scope: "global" or "friends"
        
    Returns:
        Leaderboard entries
    """
    # Convert user stats to leaderboard format
    users = [
        {
            "user_id": stats["user_id"],
            "username": stats.get("username", f"User{stats['user_id'][:8]}"),
            "total_points": stats["total_points"],
            "current_streak": stats["current_streak"],
            "lessons_completed": stats["lessons_completed"]
        }
        for stats in user_stats_db.values()
    ]
    
    leaderboard = gamification_service.leaderboard_manager.get_leaderboard(
        users=users,
        limit=limit,
        scope=scope
    )
    
    return [LeaderboardEntry(**entry) for entry in leaderboard]


@router.get("/achievements")
async def get_achievements():
    """
    Get all available achievements.
    
    Returns:
        List of achievement definitions
    """
    return {
        "achievements": [
            {
                "id": achievement_id,
                **achievement
            }
            for achievement_id, achievement in 
            gamification_service.achievement_manager.ACHIEVEMENTS.items()
        ]
    }


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """
    Get user's unlocked achievements.
    
    Args:
        user_id: User ID
        
    Returns:
        User's achievements
    """
    if user_id not in user_stats_db:
        return {"unlocked": [], "locked": list(
            gamification_service.achievement_manager.ACHIEVEMENTS.keys()
        )}
    
    user_stats = user_stats_db[user_id]
    unlocked = user_stats["unlocked_achievements"]
    all_achievements = gamification_service.achievement_manager.ACHIEVEMENTS.keys()
    locked = [a for a in all_achievements if a not in unlocked]
    
    return {
        "unlocked": [
            {
                "id": achievement_id,
                **gamification_service.achievement_manager.ACHIEVEMENTS[achievement_id]
            }
            for achievement_id in unlocked
        ],
        "locked": [
            {
                "id": achievement_id,
                **gamification_service.achievement_manager.ACHIEVEMENTS[achievement_id]
            }
            for achievement_id in locked
        ]
    }
