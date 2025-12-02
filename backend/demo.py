"""
Demo script to test the Frankenstein microlearning system
Run this to see the full pipeline in action!
"""
import asyncio
import os
from dotenv import load_dotenv

from services.content_orchestrator import ContentOrchestrator
from services.llm_service import LLMService
from agents.lesson_synthesis_agent import LessonSynthesisAgent
from agents.quiz_generation_agent import QuizGenerationAgent
from services.gamification_service import GamificationService, ActivityType, DifficultyLevel

load_dotenv()


async def demo_lesson_generation():
    """Demo: Generate a lesson from multiple sources"""
    print("\n" + "="*60)
    print("🧪 FRANKENSTEIN LESSON GENERATION DEMO")
    print("="*60)
    
    # Initialize services
    orchestrator = ContentOrchestrator()
    llm_service = LLMService()
    synthesis_agent = LessonSynthesisAgent(llm_service)
    quiz_agent = QuizGenerationAgent(llm_service)
    
    # Step 1: Fetch from multiple sources
    print("\n📡 Step 1: Fetching from multiple sources...")
    field = "technology"
    topic = "artificial intelligence"
    
    contents = await orchestrator.fetch_multi_source(
        field=field,
        topic=topic,
        num_sources=3,
        items_per_source=2
    )
    
    print(f"✅ Fetched {len(contents)} items from {len(set(c.source for c in contents))} sources:")
    for content in contents:
        print(f"   - {content.source}: {content.title[:50]}...")
    
    # Step 2: Synthesize lesson
    print("\n🤖 Step 2: Synthesizing lesson with AI...")
    synthesis_response = await synthesis_agent.execute({
        "contents": contents,
        "field": field,
        "max_words": 200
    })
    
    if synthesis_response.status == "completed":
        lesson = synthesis_response.result
        print(f"✅ Lesson created: {lesson['title']}")
        print(f"\n📝 Summary:\n{lesson['summary'][:200]}...")
        print(f"\n🎯 Learning Objectives:")
        for obj in lesson['learning_objectives'][:3]:
            print(f"   - {obj}")
    else:
        print(f"❌ Synthesis failed: {synthesis_response.error}")
        return
    
    # Step 3: Generate quiz
    print("\n❓ Step 3: Generating quiz...")
    quiz_response = await quiz_agent.execute({
        "lesson_content": lesson['summary'],
        "num_questions": 3
    })
    
    if quiz_response.status == "completed":
        questions = quiz_response.result['questions']
        print(f"✅ Generated {len(questions)} quiz questions:")
        for i, q in enumerate(questions[:2], 1):
            print(f"\n   Q{i}: {q['question']}")
            for opt in q['options'][:2]:
                print(f"      {opt}")
    else:
        print(f"❌ Quiz generation failed: {quiz_response.error}")
    
    # Cleanup
    await orchestrator.close_all()
    
    print("\n" + "="*60)
    print("✨ Demo complete!")
    print("="*60)


def demo_gamification():
    """Demo: Gamification system"""
    print("\n" + "="*60)
    print("🎮 GAMIFICATION SYSTEM DEMO")
    print("="*60)
    
    service = GamificationService()
    
    # Simulate user completing lessons
    user_stats = {
        "current_streak": 0,
        "last_activity_date": None,
        "lessons_completed": 0,
        "perfect_quizzes": 0,
        "unlocked_achievements": []
    }
    
    print("\n📚 User completes first lesson (Intermediate difficulty)...")
    result = service.award_points(
        activity_type=ActivityType.LESSON_COMPLETED,
        user_stats={**user_stats, "lessons_completed": 1},
        difficulty=DifficultyLevel.INTERMEDIATE
    )
    
    print(f"✅ Points earned: {result['points_earned']}")
    print(f"🔥 Streak: {result['new_streak']}")
    if result['new_achievements']:
        print(f"🏆 New achievements unlocked:")
        for achievement in result['new_achievements']:
            print(f"   {achievement['icon']} {achievement['name']}: {achievement['description']}")
    
    # Simulate perfect quiz
    print("\n💯 User gets perfect score on quiz...")
    quiz_result = service.award_points(
        activity_type=ActivityType.QUIZ_COMPLETED,
        user_stats={**user_stats, "perfect_quizzes": 1},
        quiz_score=100.0
    )
    
    print(f"✅ Points earned: {quiz_result['points_earned']}")
    if quiz_result['new_achievements']:
        print(f"🏆 New achievements:")
        for achievement in quiz_result['new_achievements']:
            print(f"   {achievement['icon']} {achievement['name']}")
    
    # Show leaderboard
    print("\n🏅 Leaderboard:")
    users = [
        {"user_id": "1", "username": "Alice", "total_points": 150, "current_streak": 7, "lessons_completed": 15},
        {"user_id": "2", "username": "Bob", "total_points": 120, "current_streak": 3, "lessons_completed": 12},
        {"user_id": "3", "username": "You", "total_points": result['points_earned'] + quiz_result['points_earned'], "current_streak": 1, "lessons_completed": 1},
    ]
    
    leaderboard = service.leaderboard_manager.get_leaderboard(users, limit=3)
    for entry in leaderboard:
        print(f"   #{entry['rank']} {entry['username']}: {entry['total_points']} pts (🔥{entry['current_streak']})")
    
    print("\n" + "="*60)
    print("✨ Gamification demo complete!")
    print("="*60)


async def main():
    """Run all demos"""
    print("\n🚀 MindForge + Frankenstein Microlearning Demo")
    print("This demonstrates the multi-source AI-powered lesson generation system\n")
    
    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not set. Lesson generation will fail.")
        print("Set it with: export OPENAI_API_KEY='your-key-here'\n")
    
    # Run demos
    try:
        await demo_lesson_generation()
    except Exception as e:
        print(f"\n❌ Lesson generation demo failed: {e}")
        print("Make sure OPENAI_API_KEY is set and valid.\n")
    
    demo_gamification()
    
    print("\n✅ All demos complete!")
    print("\nNext steps:")
    print("1. Start the API server: python3 main.py")
    print("2. Test endpoints with curl (see API_EXAMPLES.md)")
    print("3. Connect your React Native frontend")


if __name__ == "__main__":
    asyncio.run(main())
