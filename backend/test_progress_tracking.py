"""
Test script for progress tracking functionality.
"""
import asyncio
import sys
from dotenv import load_dotenv

load_dotenv()

from backend.services.progress_service import get_progress_service


async def test_progress_tracking():
    """Test the progress tracking service."""
    print("Testing Progress Tracking Service")
    print("=" * 50)
    
    progress_service = get_progress_service()
    test_user_id = "00000000-0000-0000-0000-000000000001"  # Demo user
    
    # Test 1: Get user stats
    print("\n1. Getting user stats...")
    stats = progress_service.get_user_stats(test_user_id)
    print(f"   User Stats: {stats}")
    
    # Test 2: Get user progress
    print("\n2. Getting user progress...")
    progress = progress_service.get_user_progress(test_user_id)
    print(f"   Total lessons completed: {progress['total_lessons_completed']}")
    print(f"   Current streak: {progress['current_streak']}")
    print(f"   Field progress: {len(progress['field_progress'])} fields")
    
    # Test 3: Get daily challenge progress
    print("\n3. Getting daily challenge progress...")
    daily = progress_service.get_daily_challenge_progress(test_user_id)
    print(f"   Completed today: {daily['completed_count']}/{daily['total_count']}")
    print(f"   Lessons today: {daily['lessons_today']}")
    print(f"   Quizzes today: {daily['quizzes_today']}")
    print(f"   Reflections today: {daily['reflections_today']}")
    
    # Test 4: Complete a lesson (if there are lessons)
    print("\n4. Testing lesson completion...")
    try:
        # Get a lesson to complete
        from supabase import create_client
        import os
        client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        lessons = client.table("lessons").select("id").limit(1).execute()
        
        if lessons.data:
            lesson_id = lessons.data[0]["id"]
            print(f"   Completing lesson: {lesson_id}")
            result = progress_service.complete_lesson(test_user_id, lesson_id, 300)
            print(f"   Result: {result}")
            
            # Check updated stats
            updated_stats = progress_service.get_user_stats(test_user_id)
            print(f"   Updated lessons completed: {updated_stats['lessons_completed']}")
            print(f"   Updated points: {updated_stats['total_points']}")
        else:
            print("   No lessons found to test completion")
    except Exception as e:
        print(f"   Error testing lesson completion: {e}")
    
    print("\n" + "=" * 50)
    print("Progress tracking test complete!")


if __name__ == "__main__":
    asyncio.run(test_progress_tracking())
