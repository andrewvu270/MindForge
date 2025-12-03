import asyncio
import sys
import os
import logging
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.auto_content_generator import AutoContentGenerator
from services.llm_service import LLMService
from agents.video_planning_agent import VideoPlanningAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_improved_generation():
    print("=" * 60)
    print("TESTING IMPROVED LESSON GENERATION")
    print("=" * 60)
    
    # Mock data for testing
    mock_sources = [
        {
            "source_type": "article",
            "source": "TechCrunch",
            "title": "The Future of AI Agents",
            "content": "AI agents are becoming more autonomous. They can plan and execute complex tasks. This changes how we interact with software.",
            "url": "https://example.com/ai-agents",
            "published_date": "2023-10-27"
        },
        {
            "source_type": "blog",
            "source": "OpenAI Blog",
            "title": "Introducing New Capabilities",
            "content": "We are releasing new models with better reasoning. These models can understand context better and generate more structured outputs.",
            "url": "https://example.com/openai",
            "published_date": "2023-10-26"
        }
    ]
    
    llm_service = LLMService()
    video_planner = VideoPlanningAgent()
    
    print("\n1. Testing Lesson Synthesis (Markdown Content)...")
    try:
        lesson_content = await llm_service.synthesize_lesson(
            contents=[type('obj', (object,), s) for s in mock_sources], # Mock object with attributes
            field="technology",
            max_words=300
        )
        
        # Monkey patch for the mock object since the service expects objects with attributes
        class MockContent:
            def __init__(self, data):
                self.__dict__.update(data)
        
        lesson_content = await llm_service.synthesize_lesson(
            contents=[MockContent(s) for s in mock_sources],
            field="technology",
            max_words=300
        )
        
        print("\n✅ Generated Lesson Content:")
        print(f"Title: {lesson_content.get('title')}")
        print(f"Summary: {lesson_content.get('summary')}")
        print(f"Content Preview (Markdown):\n{lesson_content.get('content')[:200]}...")
        
        if "#" in lesson_content.get('content', ''):
            print("✅ Markdown headers detected")
        else:
            print("⚠️ No Markdown headers detected")
            
    except Exception as e:
        print(f"❌ Error in synthesis: {e}")
        return

    print("\n2. Testing Video Planning & Slide Prompts...")
    try:
        # Create a mock lesson based on the synthesis
        lesson_title = lesson_content.get('title', 'AI Agents')
        full_content = lesson_content.get('content', 'Mock content')
        
        video_plan = await video_planner.plan_video_structure(
            lesson_content=full_content,
            lesson_title=lesson_title,
            field="technology",
            target_duration=60,
            difficulty="Intermediate"
        )
        
        print(f"\n✅ Video Plan: {video_plan.get('total_slides')} slides")
        
        prompts = await video_planner.generate_slide_prompts(
            video_plan=video_plan,
            lesson_title=lesson_title,
            field="technology"
        )
        
        print("\n✅ Generated Slide Prompts:")
        for i, prompt in enumerate(prompts, 1):
            print(f"Slide {i}: {prompt}")
            
        if "Wes Anderson" not in prompts[0]:
            print("✅ Prompts are using new style (no forced mascot)")
        else:
            print("⚠️ Prompts still contain forced mascot (unexpected)")
            
    except Exception as e:
        print(f"❌ Error in video planning: {e}")

if __name__ == "__main__":
    asyncio.run(test_improved_generation())
