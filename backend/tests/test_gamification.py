"""
Tests for Gamification Service
"""
import pytest
from datetime import date, timedelta

from services.gamification_service import (
    GamificationService,
    PointsCalculator,
    StreakTracker,
    AchievementManager,
    LeaderboardManager,
    ActivityType,
    DifficultyLevel
)


def test_points_calculation_basic():
    """Test basic points calculation"""
    points = PointsCalculator.calculate_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        difficulty=DifficultyLevel.BEGINNER
    )
    assert points == 10  # Base points for beginner lesson


def test_points_calculation_with_difficulty():
    """Test points with difficulty multiplier"""
    points = PointsCalculator.calculate_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        difficulty=DifficultyLevel.ADVANCED
    )
    assert points == 20  # 10 * 2.0 multiplier


def test_points_calculation_with_streak_bonus():
    """Test points with streak bonus"""
    points = PointsCalculator.calculate_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        difficulty=DifficultyLevel.BEGINNER,
        current_streak=7
    )
    assert points == 11  # 10 * 1.1 (7-day streak bonus)


def test_points_calculation_perfect_quiz():
    """Test bonus for perfect quiz"""
    points = PointsCalculator.calculate_points(
        activity_type=ActivityType.QUIZ_COMPLETED,
        quiz_score=100.0
    )
    assert points >= 20  # Base + perfect bonus


def test_streak_first_activity():
    """Test streak calculation for first activity"""
    new_streak, broken = StreakTracker.calculate_streak(
        last_activity_date=None,
        current_streak=0
    )
    assert new_streak == 1
    assert broken is False


def test_streak_consecutive_day():
    """Test streak increment on consecutive day"""
    yesterday = date.today() - timedelta(days=1)
    new_streak, broken = StreakTracker.calculate_streak(
        last_activity_date=yesterday,
        current_streak=5
    )
    assert new_streak == 6
    assert broken is False


def test_streak_same_day():
    """Test streak stays same on same day"""
    today = date.today()
    new_streak, broken = StreakTracker.calculate_streak(
        last_activity_date=today,
        current_streak=5
    )
    assert new_streak == 5
    assert broken is False


def test_streak_broken():
    """Test streak resets when broken"""
    two_days_ago = date.today() - timedelta(days=2)
    new_streak, broken = StreakTracker.calculate_streak(
        last_activity_date=two_days_ago,
        current_streak=10
    )
    assert new_streak == 1
    assert broken is True


def test_streak_milestones():
    """Test streak milestone messages"""
    assert StreakTracker.get_streak_milestone(7) is not None
    assert StreakTracker.get_streak_milestone(30) is not None
    assert StreakTracker.get_streak_milestone(5) is None


def test_achievement_unlock():
    """Test achievement unlocking"""
    user_stats = {
        "lessons_completed": 10,
        "perfect_quizzes": 1,
        "streak": 5
    }
    
    new_achievements = AchievementManager.check_achievements(
        user_stats=user_stats,
        unlocked_achievements=[]
    )
    
    # Should unlock "first_lesson" and "ten_lessons" and "perfect_quiz"
    achievement_ids = [a["id"] for a in new_achievements]
    assert "first_lesson" in achievement_ids
    assert "ten_lessons" in achievement_ids
    assert "perfect_quiz" in achievement_ids


def test_achievement_already_unlocked():
    """Test that already unlocked achievements aren't returned"""
    user_stats = {
        "lessons_completed": 10
    }
    
    new_achievements = AchievementManager.check_achievements(
        user_stats=user_stats,
        unlocked_achievements=["first_lesson", "ten_lessons"]
    )
    
    # Should not return already unlocked achievements
    achievement_ids = [a["id"] for a in new_achievements]
    assert "first_lesson" not in achievement_ids
    assert "ten_lessons" not in achievement_ids


def test_leaderboard_ranking():
    """Test leaderboard ranking calculation"""
    users = [
        {"user_id": "1", "username": "Alice", "total_points": 100, "current_streak": 5, "lessons_completed": 10},
        {"user_id": "2", "username": "Bob", "total_points": 150, "current_streak": 3, "lessons_completed": 15},
        {"user_id": "3", "username": "Charlie", "total_points": 80, "current_streak": 7, "lessons_completed": 8},
    ]
    
    leaderboard = LeaderboardManager.get_leaderboard(users)
    
    assert len(leaderboard) == 3
    assert leaderboard[0]["username"] == "Bob"  # Highest points
    assert leaderboard[0]["rank"] == 1
    assert leaderboard[1]["username"] == "Alice"
    assert leaderboard[2]["username"] == "Charlie"


def test_leaderboard_tie_breaker():
    """Test leaderboard tie-breaking by streak"""
    users = [
        {"user_id": "1", "username": "Alice", "total_points": 100, "current_streak": 10, "lessons_completed": 10},
        {"user_id": "2", "username": "Bob", "total_points": 100, "current_streak": 5, "lessons_completed": 10},
    ]
    
    leaderboard = LeaderboardManager.get_leaderboard(users)
    
    # Alice should rank higher due to longer streak
    assert leaderboard[0]["username"] == "Alice"
    assert leaderboard[1]["username"] == "Bob"


def test_gamification_service_integration():
    """Test full gamification service"""
    service = GamificationService()
    
    user_stats = {
        "current_streak": 6,
        "last_activity_date": date.today() - timedelta(days=1),
        "lessons_completed": 1,  # Will become 1 after this activity
        "unlocked_achievements": []
    }
    
    result = service.award_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        user_stats=user_stats,
        difficulty=DifficultyLevel.INTERMEDIATE
    )
    
    assert result["points_earned"] > 0
    assert result["new_streak"] == 7  # Incremented
    assert result["streak_milestone"] is not None  # 7-day milestone
    # Achievements check based on current stats
    assert result["new_achievements"] is not None


def test_gamification_service_multiple_achievements():
    """Test unlocking multiple achievements at once"""
    service = GamificationService()
    
    user_stats = {
        "current_streak": 0,
        "lessons_completed": 9,  # About to hit 10
        "perfect_quizzes": 0,
        "unlocked_achievements": []
    }
    
    # Complete 10th lesson with perfect quiz
    result = service.award_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        user_stats={**user_stats, "lessons_completed": 10},
        difficulty=DifficultyLevel.BEGINNER
    )
    
    # Should unlock both "first_lesson" and "ten_lessons"
    assert len(result["new_achievements"]) >= 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
