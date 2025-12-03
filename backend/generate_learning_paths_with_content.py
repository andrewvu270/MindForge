"""
Generate Learning Paths with Full Content
Creates curated curriculum AND generates complete lesson content
"""
import asyncio
import sys
from services.learning_path_service import LearningPathService
from services.content_orchestrator import ContentOrchestrator
from database import db

async def generate_paths_with_content():
    """Generate learning paths with full lesson content"""
    
    print("=" * 60)
    print("GENERATING LEARNING PATHS WITH FULL CONTENT")
    print("=" * 60)
    print()
    print("⚠️  This will take longer and use API credits")
    print("   - Generates lesson structure")
    print("   - Creates full content for each lesson")
    print("   - Generates video, audio, images (optional)")
    print()
    
    # Get all fields
    try:
        response = db.client.table("categories").select("id, name, slug").execute()
        fields = response.data
        
        if not fields:
            print("❌ No fields found in database")
            print("💡 Run seed_data.py first")
            return
        
        print(f"Found {len(fields)} fields:")
        for field in fields:
            print(f"  - {field['name']} ({field['slug']})")
        print()
        
    except Exception as e:
        print(f"❌ Error fetching fields: {e}")
        return
    
    # Services
    path_service = LearningPathService()
    orchestrator = ContentOrchestrator()
    
    # Generate paths for each field
    for field in fields:
        field_id = field['slug']
        field_name = field['name']
        
        print(f"📚 Generating paths for {field_name}...")
        
        try:
            # Step 1: Generate path structure
            paths = await path_service.generate_and_save_paths(
                field_id=field_id,
                field_name=field_name,
                lessons_per_path=5
            )
            
            if not paths:
                print(f"⚠️  No paths generated")
                continue
            
            print(f"✅ Created {len(paths)} paths")
            
            # Step 2: Generate content for each lesson
            for path in paths:
                print(f"\n   📖 {path['name']}:")
                
                for i, lesson in enumerate(path.get('lessons', []), 1):
                    lesson_id = lesson['id']
                    lesson_title = lesson['title']
                    
                    print(f"      {i}. Generating: {lesson_title}...", end=" ")
                    
                    try:
                        # Generate full content using Frankenstein system
                        # This creates detailed content, sources, etc.
                        result = await orchestrator.generate_lesson(
                            field=field_name,
                            topic=lesson_title,
                            num_sources=3,
                            generate_quiz=False,  # Can add later
                            generate_video=False  # Set True for videos
                        )
                        
                        if result and result.get('lesson'):
                            lesson_data = result['lesson']
                            
                            # Update the path_lesson with full content
                            db.client.table("path_lessons").update({
                                'content': lesson_data.get('content', ''),
                                'summary': lesson_data.get('summary', lesson['summary']),
                                'learning_objectives': lesson_data.get('learning_objectives', []),
                                'video_url': lesson_data.get('video_url'),
                                'audio_url': lesson_data.get('audio_url'),
                                'images': lesson_data.get('images'),
                            }).eq('id', lesson_id).execute()
                            
                            print("✅")
                        else:
                            print("⚠️  Failed")
                        
                    except Exception as e:
                        print(f"❌ Error: {e}")
                    
                    # Small delay to avoid rate limits
                    await asyncio.sleep(2)
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()
    print("✅ Learning paths with full content generated!")
    print()
    print("Next steps:")
    print("1. View paths: GET /api/learning-paths/{field_id}")
    print("2. Test in frontend: http://localhost:5173/curriculum")
    print()

if __name__ == "__main__":
    asyncio.run(generate_paths_with_content())

