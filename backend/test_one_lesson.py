#!/usr/bin/env python3
"""
Simple test to generate one tech lesson
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

async def main():
    """Generate one easy tech lesson."""
    print("=" * 60)
    print("GENERATING ONE EASY TECH LESSON")
    print("=" * 60)
    
    # Import here to avoid issues
    from services.auto_content_generator import AutoContentGenerator
    from services.adapters.hackernews_adapter import HackerNewsAdapter
    from services.adapters.reddit_adapter import RedditAdapter
    
    generator = AutoContentGenerator()
    
    # Fetch some tech sources manually
    print("\n🔍 Fetching tech content...")
    sources = []
    
    # Try HackerNews
    try:
        hn = HackerNewsAdapter()
        hn_sources = await hn.fetch("artificial intelligence", limit=3)
        sources.extend(hn_sources)
        print(f"✅ Got {len(hn_sources)} from HackerNews")
    except Exception as e:
        print(f"⚠️  HackerNews failed: {e}")
    
    # Try Reddit
    try:
        reddit = RedditAdapter()
        reddit_sources = await reddit.fetch("machine learning", limit=2)
        sources.extend(reddit_sources)
        print(f"✅ Got {len(reddit_sources)} from Reddit")
    except Exception as e:
        print(f"⚠️  Reddit failed: {e}")
    
    if not sources:
        print("❌ No sources found, creating fallback lesson")
        sources = [{
            'type': 'article',
            'source': 'Manual',
            'title': 'Introduction to AI',
            'content': 'Artificial Intelligence is transforming technology. Machine learning enables computers to learn from data. Neural networks mimic human brain structure. Deep learning processes complex patterns. AI applications include image recognition, natural language processing, and autonomous systems.',
            'url': 'https://example.com',
            'published_date': '2024-12-03'
        }]
    
    print(f"\n📚 Total sources: {len(sources)}")
    
    # Generate lesson
    print("\n🎨 Generating lesson (this may take 30-60 seconds)...")
    try:
        lesson = await generator.generate_lesson_from_sources(
            field_id="tech",
            topic="Introduction to Artificial Intelligence",
            sources=sources
        )
        
        if lesson is None:
            print("\n" + "=" * 60)
            print("❌ LESSON GENERATION RETURNED NONE")
            print("=" * 60)
            print("This usually means:")
            print("  - Supabase connection timed out")
            print("  - LLM failed to generate valid content")
            print("  - Database insert failed")
            print("\nCheck the logs above for specific errors.")
        else:
            print("\n" + "=" * 60)
            print("✅ SUCCESS! LESSON CREATED")
            print("=" * 60)
            print(f"\n📖 Title: {lesson.get('title')}")
            print(f"📊 Difficulty: {lesson.get('difficulty_level')}")
            print(f"⏱️  Reading time: {lesson.get('estimated_minutes')} min")
            print(f"🎬 Video duration: {lesson.get('video_duration_seconds')}s")
            print(f"🖼️  Images: {len(lesson.get('images', []))}")
            print(f"🎵 Audio: {'Yes' if lesson.get('audio') else 'No'}")
            print(f"🔗 Video URL: {lesson.get('video_url', 'None')[:80] if lesson.get('video_url') else 'None'}...")
            print(f"💾 ID: {lesson.get('id')}")
            
            print("\n📝 Content preview:")
            content = lesson.get('content', '')
            print(content[:200] + "..." if len(content) > 200 else content)
            
            print("\n" + "=" * 60)
            print("Check your Supabase database to see the lesson!")
            print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
