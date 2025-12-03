#!/usr/bin/env python3
"""
Test script to generate a single easy tech lesson
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from services.auto_content_generator import AutoContentGenerator
from services.content_orchestrator import ContentOrchestrator

load_dotenv()

async def generate_single_lesson():
    """Generate one easy tech lesson."""
    print("=" * 60)
    print("GENERATING SINGLE TECH LESSON (EASY)")
    print("=" * 60)
    
    # Initialize services
    generator = AutoContentGenerator()
    orchestrator = ContentOrchestrator()
    
    # Topic for easy tech lesson
    topic = "Introduction to Cloud Computing"
    field_id = "tech"
    
    print(f"\n📚 Topic: {topic}")
    print(f"🎯 Field: Technology")
    print(f"📊 Difficulty: Easy (60 second video)")
    
    # Fetch sources
    print(f"\n🔍 Fetching content sources...")
    sources = await orchestrator.fetch_multi_source_content(
        topic=topic,
        field=field_id,
        max_sources=5
    )
    
    if not sources:
        print("❌ No sources found")
        return False
    
    print(f"✅ Found {len(sources)} sources")
    for i, source in enumerate(sources, 1):
        print(f"   {i}. {source.get('title', 'Untitled')[:60]}...")
    
    # Generate lesson
    print(f"\n🎨 Generating lesson...")
    try:
        lesson = await generator.generate_lesson_from_sources(
            field_id=field_id,
            topic=topic,
            sources=sources
        )
        
        print("\n" + "=" * 60)
        print("✅ LESSON GENERATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"\n📖 Title: {lesson.get('title')}")
        print(f"⏱️  Duration: {lesson.get('estimated_minutes', 0)} minutes")
        print(f"📊 Difficulty: {lesson.get('difficulty_level')}")
        print(f"🎬 Video: {lesson.get('video_duration_seconds', 0)} seconds")
        print(f"🖼️  Images: {len(lesson.get('images', []))} generated")
        print(f"🎵 Audio: {'✅' if lesson.get('audio') else '❌'}")
        print(f"💾 Lesson ID: {lesson.get('id')}")
        
        if lesson.get('learning_objectives'):
            print(f"\n🎯 Learning Objectives:")
            for obj in lesson.get('learning_objectives', [])[:3]:
                print(f"   • {obj}")
        
        if lesson.get('key_concepts'):
            print(f"\n🔑 Key Concepts:")
            for concept in lesson.get('key_concepts', [])[:3]:
                print(f"   • {concept}")
        
        print("\n" + "=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Failed to generate lesson: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(generate_single_lesson())
    sys.exit(0 if success else 1)
