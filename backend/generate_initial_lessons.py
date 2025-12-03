"""
Generate Initial Lessons Script
Creates 1 easy lesson for each field to populate the database (fast testing)
"""
import asyncio
import sys
import os
import logging

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.auto_content_generator import AutoContentGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Topics for each field (1 easy topic per field for fast testing)
FIELD_TOPICS = {
    'tech': [
        'Introduction to Artificial Intelligence'
    ],
    'finance': [
        'Personal Budgeting Basics'
    ],
    'economics': [
        'Supply and Demand Explained'
    ],
    'culture': [
        'Social Media Impact on Society'
    ],
    'influence': [
        'Active Listening Skills'
    ],
    'global': [
        'Climate Change Overview'
    ]
}


async def generate_lessons_for_all_fields():
    """Generate 1 easy lesson for each field (fast testing)."""
    generator = AutoContentGenerator()
    
    total_lessons = 0
    failed_lessons = 0
    
    print("=" * 60)
    print("GENERATING INITIAL LESSONS")
    print("=" * 60)
    print(f"Target: 1 easy lesson per field (6 total)")
    print()
    
    for field_id, topics in FIELD_TOPICS.items():
        field_name = {
            'tech': 'Technology',
            'finance': 'Finance',
            'economics': 'Economics',
            'culture': 'Culture',
            'influence': 'Influence',
            'global': 'Global Events'
        }[field_id]
        
        print(f"\n📚 Generating lessons for {field_name}...")
        print("-" * 60)
        
        for i, topic in enumerate(topics, 1):
            try:
                print(f"\n{i}. {topic}")
                print(f"   Fetching content from sources...")
                
                # Fetch content
                sources = await generator.fetch_trending_content(field_id, topic, limit=3)
                
                if len(sources) < 2:
                    print(f"   ❌ Not enough sources ({len(sources)}), skipping...")
                    failed_lessons += 1
                    continue
                
                print(f"   ✓ Found {len(sources)} sources")
                print(f"   Generating lesson...")
                
                # Generate lesson
                lesson = await generator.generate_lesson_from_sources(
                    field_id=field_id,
                    topic=topic,
                    sources=sources
                )
                
                if lesson:
                    print(f"   ✓ Lesson created: {lesson['title']}")
                    print(f"   ✓ Difficulty: {lesson['difficulty_level']}")
                    print(f"   ✓ Duration: {lesson.get('video_duration_seconds', 0)}s video")
                    total_lessons += 1
                else:
                    print(f"   ❌ Failed to generate lesson")
                    failed_lessons += 1
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
                failed_lessons += 1
    
    print("\n" + "=" * 60)
    print("GENERATION COMPLETE")
    print("=" * 60)
    print(f"✅ Successfully generated: {total_lessons} lessons")
    print(f"❌ Failed: {failed_lessons} lessons")
    print(f"📊 Success rate: {(total_lessons / (total_lessons + failed_lessons) * 100):.1f}%")
    print("=" * 60)
    
    return total_lessons, failed_lessons


async def main():
    """Main execution function."""
    try:
        total, failed = await generate_lessons_for_all_fields()
        
        if total > 0:
            print("\n✨ Lessons are now available in the database!")
            print("   You can view them at: http://localhost:5173/lessons")
            return 0
        else:
            print("\n⚠️  No lessons were generated. Check your API keys and network connection.")
            return 1
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation cancelled by user")
        return 1
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    print("\n🚀 Starting lesson generation...")
    print("   This will take a few minutes...\n")
    
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

