"""
Generate Learning Paths for All Fields
Creates curated curriculum with lesson outlines
"""
import asyncio
import sys
from services.learning_path_service import LearningPathService
from database import db

async def generate_all_paths():
    """Generate learning paths for all fields"""
    
    print("=" * 60)
    print("GENERATING LEARNING PATHS")
    print("=" * 60)
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
    
    # Generate paths for each field
    service = LearningPathService()
    
    for field in fields:
        field_id = field['slug']
        field_name = field['name']
        
        print(f"📚 Generating paths for {field_name}...")
        
        try:
            paths = await service.generate_and_save_paths(
                field_id=field_id,
                field_name=field_name,
                lessons_per_path=5
            )
            
            if paths:
                print(f"✅ Created {len(paths)} paths:")
                for path in paths:
                    print(f"   - {path['name']}: {path['total_lessons']} lessons")
            else:
                print(f"⚠️  No paths generated")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()
    print("✅ Learning paths generated!")
    print()
    print("Next steps:")
    print("1. View paths: GET /api/learning-paths/{field_id}")
    print("2. Generate lesson content (optional)")
    print("3. Test in frontend: http://localhost:5173/curriculum")
    print()

if __name__ == "__main__":
    asyncio.run(generate_all_paths())

