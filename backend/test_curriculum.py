import asyncio
import sys
import os
import logging
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.llm_service import LLMService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_curriculum_generation():
    print("=" * 60)
    print("TESTING CURRICULUM GENERATION")
    print("=" * 60)
    
    llm_service = LLMService()
    
    field = "Artificial Intelligence"
    num_lessons = 5
    
    print(f"Generating curriculum for {field} ({num_lessons} lessons)...")
    
    try:
        curriculum = await llm_service.generate_curriculum(field, num_lessons)
        
        if curriculum:
            print(f"\n✅ Successfully generated {len(curriculum)} lessons:")
            for i, lesson in enumerate(curriculum, 1):
                print(f"\nLesson {i}: {lesson.get('title')}")
                print(f"  Difficulty: {lesson.get('difficulty')}")
                print(f"  Description: {lesson.get('description')}")
                print(f"  Topics: {', '.join(lesson.get('key_topics', []))}")
        else:
            print("\n❌ Failed to generate curriculum (empty result)")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_curriculum_generation())
