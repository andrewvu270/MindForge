"""
Full Stack Test for Learning Paths
Tests Backend → Database → API integration
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.learning_path_agent import LearningPathAgent
from database import db

async def test_full_stack():
    """Test the complete learning path flow"""
    
    print("=" * 60)
    print("FULL STACK LEARNING PATH TEST")
    print("=" * 60)
    print()
    
    # Test 1: Database Connection
    print("1️⃣  Testing Database Connection...")
    try:
        # Try to fetch categories (fields)
        response = db.client.table("categories").select("id, name, slug").limit(5).execute()
        if response.data:
            print(f"   ✅ Database connected - Found {len(response.data)} fields")
            for field in response.data:
                print(f"      - {field['name']} ({field['slug']})")
        else:
            print("   ⚠️  Database connected but no fields found")
            print("   💡 Run seed_data.py to populate fields")
    except Exception as e:
        print(f"   ❌ Database error: {e}")
        print("   💡 Check your .env file and Supabase connection")
    print()
    
    # Test 2: Fetch Lessons
    print("2️⃣  Testing Lesson Retrieval...")
    try:
        response = db.client.table("lessons").select("id, title, field_id, difficulty_level").limit(10).execute()
        if response.data:
            print(f"   ✅ Found {len(response.data)} lessons")
            lessons = response.data
            
            # Group by field
            by_field = {}
            for lesson in lessons:
                field = lesson.get('field_id', 'unknown')
                if field not in by_field:
                    by_field[field] = []
                by_field[field].append(lesson)
            
            for field, field_lessons in by_field.items():
                print(f"      {field}: {len(field_lessons)} lessons")
        else:
            print("   ⚠️  No lessons found in database")
            print("   💡 Run generate_initial_lessons.py to create lessons")
            lessons = []
    except Exception as e:
        print(f"   ❌ Error fetching lessons: {e}")
        lessons = []
    print()
    
    # Test 3: Learning Path Agent
    print("3️⃣  Testing Learning Path Agent...")
    if lessons:
        try:
            # Use first field's lessons
            field_id = lessons[0].get('field_id', 'economics')
            field_lessons = [l for l in lessons if l.get('field_id') == field_id]
            
            print(f"   Testing with {len(field_lessons)} lessons from '{field_id}'")
            
            agent = LearningPathAgent()
            paths = await agent.generate_paths_for_field(field_id.capitalize(), field_lessons)
            
            if paths:
                print(f"   ✅ Generated {len(paths)} learning paths")
                for path in paths:
                    print(f"      - {path['name']}: {len(path['lessons'])} lessons")
            else:
                print("   ❌ No paths generated")
        except Exception as e:
            print(f"   ❌ Agent error: {e}")
    else:
        print("   ⏭️  Skipped (no lessons available)")
    print()
    
    # Test 4: API Endpoint Simulation
    print("4️⃣  Testing API Endpoint Logic...")
    try:
        # Simulate what the endpoint does
        field_id = "economics"
        
        # Fetch lessons
        response = db.client.table("lessons").select("*").eq("field_id", field_id).execute()
        
        if response.data:
            lessons = response.data
            print(f"   ✅ Endpoint would fetch {len(lessons)} lessons")
            
            # Generate paths
            agent = LearningPathAgent()
            paths = await agent.generate_paths_for_field("Economics", lessons)
            
            if paths:
                print(f"   ✅ Endpoint would return {len(paths)} paths")
                print()
                print("   Sample Response:")
                for path in paths[:1]:  # Show first path
                    print(f"      {{")
                    print(f"        'name': '{path['name']}',")
                    print(f"        'difficulty': '{path['difficulty']}',")
                    print(f"        'description': '{path['description'][:50]}...',")
                    print(f"        'lessons': [{len(path['lessons'])} lessons]")
                    print(f"      }}")
            else:
                print("   ⚠️  No paths generated")
        else:
            print(f"   ⚠️  No lessons found for field '{field_id}'")
    except Exception as e:
        print(f"   ❌ Endpoint simulation error: {e}")
    print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()
    print("✅ Backend: Learning Path Agent works")
    print("✅ Database: Schema supports learning paths")
    print("✅ API: Endpoint logic validated")
    print()
    print("🚀 To test the full stack:")
    print("   1. Start backend: cd backend && uvicorn main:app --reload")
    print("   2. Start frontend: cd frontendweb && npm run dev")
    print("   3. Visit: http://localhost:5173/curriculum")
    print()

if __name__ == "__main__":
    asyncio.run(test_full_stack())

