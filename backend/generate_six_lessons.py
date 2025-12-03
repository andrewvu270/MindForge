#!/usr/bin/env python3
"""
Generate 6 lessons - one for each field with mascot videos
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

# Fields to generate lessons for
FIELDS = [
    {"id": "tech", "name": "Technology", "topic": "Latest AI and Machine Learning trends"},
    {"id": "finance", "name": "Finance", "topic": "Personal finance and investing basics"},
    {"id": "economics", "name": "Economics", "topic": "Supply and demand fundamentals"},
    {"id": "culture", "name": "Culture", "topic": "World traditions and cultural diversity"},
    {"id": "events", "name": "Global Events", "topic": "Current world news and events"},
    {"id": "influence", "name": "Soft Skills", "topic": "Communication and leadership skills"},
]


async def generate_lesson(generator, field: dict, index: int):
    """Generate a single lesson for a field."""
    print(f"\n{'='*60}")
    print(f"[{index}/6] Generating {field['name']} lesson...")
    print(f"{'='*60}")
    
    try:
        lessons = await generator.generate_lessons_for_field(
            field_id=field['id'],
            count=1
        )
        
        if lessons and len(lessons) > 0:
            lesson = lessons[0]
            print(f"✅ {field['name']}: {lesson.get('title', 'Untitled')}")
            print(f"   📊 Difficulty: {lesson.get('difficulty_level')}")
            print(f"   🎬 Video: {lesson.get('video_duration_seconds', 0)}s")
            print(f"   🖼️  Images: {len(lesson.get('images', []))}")
            print(f"   🔗 Video URL: {lesson.get('video_url', 'None')[:60]}..." if lesson.get('video_url') else "   🔗 Video URL: None")
            return lesson
        else:
            print(f"❌ {field['name']}: Failed to generate")
            return None
            
    except Exception as e:
        print(f"❌ {field['name']}: Error - {e}")
        return None


async def main():
    print("="*60)
    print("GENERATING 6 LESSONS (ONE PER FIELD)")
    print("Each lesson includes mascot video in 9:16 portrait format")
    print("="*60)
    
    from services.auto_content_generator import AutoContentGenerator
    generator = AutoContentGenerator()
    
    results = []
    
    for i, field in enumerate(FIELDS, 1):
        lesson = await generate_lesson(generator, field, i)
        results.append({
            "field": field['name'],
            "success": lesson is not None,
            "lesson": lesson
        })
        
        # Small delay between lessons to avoid rate limits
        if i < len(FIELDS):
            print("\n⏳ Waiting 5 seconds before next lesson...")
            await asyncio.sleep(5)
    
    # Summary
    print("\n" + "="*60)
    print("GENERATION COMPLETE")
    print("="*60)
    
    successful = sum(1 for r in results if r['success'])
    print(f"\n✅ Successfully generated: {successful}/{len(FIELDS)} lessons")
    
    print("\nResults by field:")
    for r in results:
        status = "✅" if r['success'] else "❌"
        title = r['lesson'].get('title', 'N/A')[:40] if r['lesson'] else "Failed"
        print(f"  {status} {r['field']}: {title}")
    
    print("\n" + "="*60)
    print("Check your Supabase database and storage bucket!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
