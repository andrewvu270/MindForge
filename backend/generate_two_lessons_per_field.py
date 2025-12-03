"""
Generate 2 lessons for each field in the database
Uses the Frankenstein content generation system
"""
import asyncio
import sys
from database import db
from services.auto_content_generator import AutoContentGenerator

async def generate_lessons_for_all_fields():
    """Generate 2 lessons for each field"""
    
    print("=" * 70)
    print("GENERATING 2 LESSONS FOR EACH FIELD")
    print("=" * 70)
    print()
    
    # Get all fields from database
    try:
        response = db.client.table("categories").select("*").execute()
        fields = response.data if response.data else []
    except Exception as e:
        print(f"❌ Error fetching fields: {e}")
        return
    
    if not fields:
        print("❌ No fields found in database")
        print("Run seed_database.py first to create fields")
        return
    
    print(f"Found {len(fields)} fields:")
    for field in fields:
        print(f"  • {field['name']} (slug: {field.get('slug', 'N/A')})")
    print()
    
    # Initialize generator
    generator = AutoContentGenerator()
    
    # Generate 2 lessons for each field
    total_generated = 0
    total_failed = 0
    
    for field in fields:
        # Use slug (text) instead of UUID for field_id
        field_id = field.get('slug', field['id'])
        field_name = field['name']
        
        print(f"📚 Generating lessons for {field_name}...")
        print("-" * 70)
        
        try:
            # Generate 2 lessons
            lessons = await generator.generate_lessons_for_field(
                field_id=field_id,
                count=2
            )
            
            if lessons:
                print(f"✅ Generated {len(lessons)} lessons for {field_name}")
                for i, lesson in enumerate(lessons, 1):
                    print(f"   {i}. {lesson.get('title', 'Untitled')}")
                    print(f"      Content: {len(lesson.get('content', ''))} chars")
                    if lesson.get('video_url'):
                        print(f"      Video: {lesson.get('video_url')[:60]}...")
                    print(f"      Images: {len(lesson.get('images', []))}")
                total_generated += len(lessons)
            else:
                print(f"⚠️  No lessons generated for {field_name}")
                total_failed += 1
                
        except Exception as e:
            print(f"❌ Error generating lessons for {field_name}: {e}")
            total_failed += 1
        
        print()
        
        # Small delay between fields to avoid rate limits
        await asyncio.sleep(3)
    
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✅ Total lessons generated: {total_generated}")
    print(f"❌ Fields failed: {total_failed}")
    print()
    
    if total_generated > 0:
        print("View lessons:")
        print("  GET http://localhost:8000/api/lessons")
        print()
        print("Or check database:")
        print("  SELECT id, title, field_id FROM lessons ORDER BY created_at DESC;")
        print()

if __name__ == "__main__":
    asyncio.run(generate_lessons_for_all_fields())
