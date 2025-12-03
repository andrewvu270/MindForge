"""
Test: Generate ONE Learning Path for Technology
Creates Beginner path with 3 lessons and full content
"""
import asyncio
import sys
from services.learning_path_service import LearningPathService
from services.auto_content_generator import AutoContentGenerator
from database import db

async def generate_tech_path():
    """Generate one learning path for Technology with full content"""
    
    print("=" * 60)
    print("GENERATING TECHNOLOGY BEGINNER PATH")
    print("=" * 60)
    print()
    
    field_id = "tech"
    field_name = "Technology"
    
    # Services
    path_service = LearningPathService()
    generator = AutoContentGenerator()
    
    print(f"📚 Step 1: Generating path structure for {field_name}...")
    print()
    
    try:
        # Generate just 1 path with 3 lessons
        paths = await path_service.generate_and_save_paths(
            field_id=field_id,
            field_name=field_name,
            lessons_per_path=3  # Only 3 lessons for testing
        )
        
        if not paths:
            print("❌ Failed to generate paths")
            return
        
        print(f"✅ Created {len(paths)} paths")
        print()
        
        # Only process the Beginner path
        beginner_path = next((p for p in paths if p['difficulty'] == 'Beginner'), None)
        
        if not beginner_path:
            print("❌ No Beginner path found")
            return
        
        print(f"📖 {beginner_path['name']} ({beginner_path['total_lessons']} lessons)")
        print(f"   {beginner_path['description']}")
        print()
        
        # Step 2: Generate full content for each lesson
        print("📝 Step 2: Generating full lesson content...")
        print()
        
        for i, lesson in enumerate(beginner_path.get('lessons', []), 1):
            lesson_id = lesson['id']
            lesson_title = lesson['title']
            
            print(f"   {i}. {lesson_title}")
            print(f"      Generating content...", end=" ", flush=True)
            
            try:
                # Generate full content using AutoContentGenerator
                # This uses the Frankenstein system to create complete lessons
                print(f"Fetching sources for '{lesson_title}'...")
                
                lessons = await generator.generate_lessons_for_field(
                    field_id=field_id,
                    count=1
                )
                
                if lessons and len(lessons) > 0:
                    lesson_data = lessons[0]
                    
                    # Update the path_lesson with full content
                    # Use the generated content but keep our title
                    db.client.table("path_lessons").update({
                        'content': lesson_data.get('content', ''),
                        'summary': lesson_data.get('summary', lesson['summary']),
                        'learning_objectives': lesson_data.get('learning_objectives', []),
                        'video_url': lesson_data.get('video_url'),
                        'audio_url': lesson_data.get('audio_url'),
                        'images': lesson_data.get('images'),
                    }).eq('id', lesson_id).execute()
                    
                    print("✅")
                    print(f"      Generated: {lesson_data.get('title', 'Untitled')}")
                    print(f"      Content: {len(lesson_data.get('content', ''))} chars")
                    if lesson_data.get('video_url'):
                        print(f"      Video: {lesson_data.get('video_url')[:60]}...")
                    print(f"      Images: {len(lesson_data.get('images', []))}")
                else:
                    print("⚠️  No content generated")
                
            except Exception as e:
                print(f"❌ Error: {e}")
            
            print()
            
            # Longer delay to avoid rate limits and connection issues
            await asyncio.sleep(5)
        
        print("=" * 60)
        print("SUCCESS!")
        print("=" * 60)
        print()
        print(f"✅ Generated Beginner path with {len(beginner_path.get('lessons', []))} lessons")
        print()
        print("Test it:")
        print(f"  GET http://localhost:8000/api/learning-paths/{field_id}")
        print()
        print("View in database:")
        print(f"  SELECT * FROM learning_paths WHERE field_id = '{field_id}';")
        print(f"  SELECT * FROM path_lessons WHERE path_id = '{beginner_path['id']}';")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(generate_tech_path())

