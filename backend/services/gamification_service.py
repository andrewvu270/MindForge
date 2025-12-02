"""
Gamification Service
Handles points, streaks, achievements, and leaderboard
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class ActivityType(str, Enum):
    """Types of activities that earn points"""
    LESSON_COMPLETED = "lesson_completed"
    QUIZ_COMPLETED = "quiz_completed"
    QUIZ_PERFECT = "quiz_perfect"
    REFLECTION_SUBMITTED = "reflection_submitted"
    DAILY_STREAK = "daily_streak"
    CROSS_FIELD_LEARNING = "cross_field_learning"


class DifficultyLevel(str, Enum):
    """Lesson difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class PointsCalculator:
    """Calculates points for various activities"""
    
    # Base points for activities
    BASE_POINTS = {
        ActivityType.LESSON_COMPLETED: 10,
        ActivityType.QUIZ_COMPLETED: 5,
        ActivityType.QUIZ_PERFECT: 15,
        ActivityType.REFLECTION_SUBMITTED: 8,
        ActivityType.DAILY_STREAK: 5,
        ActivityType.CROSS_FIELD_LEARNING: 12
    }
    
    # Difficulty multipliers
    DIFFICULTY_MULTIPLIERS = {
        DifficultyLevel.BEGINNER: 1.0,
        DifficultyLevel.INTERMEDIATE: 1.5,
        DifficultyLevel.ADVANCED: 2.0,
        DifficultyLevel.EXPERT: 2.5
    }
    
    # Streak bonus multipliers
    STREAK_BONUSES = {
        7: 1.1,   # 7-day streak: 10% bonus
        14: 1.2,  # 14-day streak: 20% bonus
        30: 1.5,  # 30-day streak: 50% bonus
        60: 2.0,  # 60-day streak: 100% bonus
    }
    
    @classmethod
    def calculate_points(
        cls,
        activity_type: ActivityType,
        difficulty: Optional[DifficultyLevel] = None,
        current_streak: int = 0,
        quiz_score: Optional[float] = None,
        completion_time_minutes: Optional[int] = None
    ) -> int:
        """
        Calculate points for an activity.
        
        Args:
            activity_type: Type of activity
            difficulty: Lesson difficulty (if applicable)
            current_streak: User's current streak
            quiz_score: Quiz score percentage (if applicable)
            completion_time_minutes: Time taken (if applicable)
            
        Returns:
            Points earned
        """
        # Get base points
        base = cls.BASE_POINTS.get(activity_type, 0)
        
        # Apply difficulty multiplier
        if difficulty:
            multiplier = cls.DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)
            base = int(base * multiplier)
        
        # Apply streak bonus
        streak_multiplier = 1.0
        for streak_threshold, bonus in sorted(cls.STREAK_BONUSES.items(), reverse=True):
            if current_streak >= streak_threshold:
                streak_multiplier = bonus
                break
        
        base = int(base * streak_multiplier)
        
        # Bonus for perfect quiz
        if activity_type == ActivityType.QUIZ_COMPLETED and quiz_score == 100:
            base += cls.BASE_POINTS[ActivityType.QUIZ_PERFECT]
        
        # Speed bonus (if completed quickly)
        if completion_time_minutes and completion_time_minutes < 10:
            base += 5
        
        return max(base, 1)  # Minimum 1 point


class StreakTracker:
    """Tracks user streaks"""
    
    @staticmethod
    def calculate_streak(
        last_activity_date: Optional[date],
        current_streak: int = 0
    ) -> tuple[int, bool]:
        """
        Calculate updated streak based on last activity.
        
        Args:
            last_activity_date: Date of last activity
            current_streak: Current streak count
            
        Returns:
            Tuple of (new_streak, is_streak_broken)
        """
        today = date.today()
        
        # First activity ever
        if not last_activity_date:
            return 1, False
        
        # Same day - no change
        if last_activity_date == today:
            return current_streak, False
        
        # Consecutive day
        if last_activity_date == today - timedelta(days=1):
            return current_streak + 1, False
        
        # Streak broken
        return 1, True
    
    @staticmethod
    def get_streak_milestone(streak: int) -> Optional[str]:
        """
        Get milestone message for streak.
        
        Args:
            streak: Current streak count
            
        Returns:
            Milestone message or None
        """
        milestones = {
            7: "🔥 7-day streak! You're on fire!",
            14: "⚡ 2-week streak! Unstoppable!",
            30: "🌟 30-day streak! You're a legend!",
            60: "👑 60-day streak! Master learner!",
            100: "🏆 100-day streak! Hall of Fame!"
        }
        return milestones.get(streak)


class AchievementManager:
    """Manages user achievements"""
    
    # Achievement definitions
    ACHIEVEMENTS = {
        "first_lesson": {
            "name": "First Steps",
            "description": "Complete your first lesson",
            "icon": "🎓",
            "criteria": {"lessons_completed": 1},
            "points": 10
        },
        "ten_lessons": {
            "name": "Dedicated Learner",
            "description": "Complete 10 lessons",
            "icon": "📚",
            "criteria": {"lessons_completed": 10},
            "points": 50
        },
        "perfect_quiz": {
            "name": "Perfect Score",
            "description": "Get 100% on a quiz",
            "icon": "💯",
            "criteria": {"perfect_quizzes": 1},
            "points": 25
        },
        "week_streak": {
            "name": "Week Warrior",
            "description": "Maintain a 7-day streak",
            "icon": "🔥",
            "criteria": {"streak": 7},
            "points": 30
        },
        "multi_field": {
            "name": "Renaissance Learner",
            "description": "Complete lessons in 3 different fields",
            "icon": "🌈",
            "criteria": {"fields_studied": 3},
            "points": 40
        },
        "reflection_master": {
            "name": "Self-Aware",
            "description": "Submit 10 reflections",
            "icon": "🧘",
            "criteria": {"reflections_submitted": 10},
            "points": 35
        }
    }
    
    @classmethod
    def check_achievements(
        cls,
        user_stats: Dict,
        unlocked_achievements: List[str]
    ) -> List[Dict]:
        """
        Check which new achievements user has unlocked.
        
        Args:
            user_stats: User statistics
            unlocked_achievements: Already unlocked achievement IDs
            
        Returns:
            List of newly unlocked achievements
        """
        newly_unlocked = []
        
        for achievement_id, achievement in cls.ACHIEVEMENTS.items():
            # Skip if already unlocked
            if achievement_id in unlocked_achievements:
                continue
            
            # Check if criteria met
            criteria = achievement["criteria"]
            criteria_met = all(
                user_stats.get(key, 0) >= value
                for key, value in criteria.items()
            )
            
            if criteria_met:
                newly_unlocked.append({
                    "id": achievement_id,
                    **achievement
                })
        
        return newly_unlocked


class LeaderboardManager:
    """Manages leaderboard rankings"""
    
    @staticmethod
    def calculate_rank(
        user_points: int,
        all_user_points: List[int]
    ) -> int:
        """
        Calculate user's rank based on points.
        
        Args:
            user_points: User's total points
            all_user_points: List of all users' points
            
        Returns:
            Rank (1-indexed)
        """
        sorted_points = sorted(all_user_points, reverse=True)
        try:
            return sorted_points.index(user_points) + 1
        except ValueError:
            return len(sorted_points) + 1
    
    @staticmethod
    def get_leaderboard(
        users: List[Dict],
        limit: int = 100,
        scope: str = "global"
    ) -> List[Dict]:
        """
        Get leaderboard rankings.
        
        Args:
            users: List of user data with points
            limit: Maximum number of users to return
            scope: "global" or "friends"
            
        Returns:
            Sorted leaderboard
        """
        # Sort by points (descending), then by streak (descending)
        sorted_users = sorted(
            users,
            key=lambda u: (u.get("total_points", 0), u.get("current_streak", 0)),
            reverse=True
        )
        
        # Add ranks
        leaderboard = []
        for i, user in enumerate(sorted_users[:limit]):
            leaderboard.append({
                "rank": i + 1,
                "user_id": user.get("user_id"),
                "username": user.get("username", "Anonymous"),
                "total_points": user.get("total_points", 0),
                "current_streak": user.get("current_streak", 0),
                "lessons_completed": user.get("lessons_completed", 0)
            })
        
        return leaderboard


class GamificationService:
    """Main gamification service coordinating all components"""
    
    def __init__(self):
        self.points_calculator = PointsCalculator()
        self.streak_tracker = StreakTracker()
        self.achievement_manager = AchievementManager()
        self.leaderboard_manager = LeaderboardManager()
    
    def award_points(
        self,
        activity_type: ActivityType,
        user_stats: Dict,
        **kwargs
    ) -> Dict:
        """
        Award points for an activity and check for achievements.
        
        Args:
            activity_type: Type of activity
            user_stats: Current user statistics
            **kwargs: Additional parameters for point calculation
            
        Returns:
            Dict with points_earned, new_achievements, streak_milestone
        """
        # Calculate points
        points = self.points_calculator.calculate_points(
            activity_type=activity_type,
            current_streak=user_stats.get("current_streak", 0),
            **kwargs
        )
        
        # Update streak if it's a daily activity
        new_streak = user_stats.get("current_streak", 0)
        streak_milestone = None
        
        if activity_type in [ActivityType.LESSON_COMPLETED, ActivityType.REFLECTION_SUBMITTED]:
            new_streak, _ = self.streak_tracker.calculate_streak(
                last_activity_date=user_stats.get("last_activity_date"),
                current_streak=user_stats.get("current_streak", 0)
            )
            streak_milestone = self.streak_tracker.get_streak_milestone(new_streak)
        
        # Check for new achievements
        updated_stats = {
            **user_stats,
            "current_streak": new_streak
        }
        
        new_achievements = self.achievement_manager.check_achievements(
            user_stats=updated_stats,
            unlocked_achievements=user_stats.get("unlocked_achievements", [])
        )
        
        return {
            "points_earned": points,
            "new_streak": new_streak,
            "streak_milestone": streak_milestone,
            "new_achievements": new_achievements,
            "total_achievement_points": sum(a["points"] for a in new_achievements)
        }
