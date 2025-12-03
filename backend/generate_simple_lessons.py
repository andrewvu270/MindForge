"""
Simple script to generate 2 lessons for each field
Uses hardcoded field IDs to avoid database mismatches
"""
import asyncio
from services.auto_content_generator import AutoContentGenerator
from database import db

# Field slug to name mapping
FIELD_SLUGS = {
    'tech': 'Technology',
    'finance': 'Finance', 
    'economics': 'Economics',
    'culture': 'Culture',
    'influence': 'Influence',
    'global': 'Global Events'
}

def get_field_mappings():
    """Get UUID to slug mappings from database"""
    try:
        response = db.client.table("categories").select("id, name").execute()
        fields = response.data if response.data else []
        
        # Create mapping: name -> (uuid, slug)
        mappings = {}
        for field in fields:
            name = field['name']
            uuid = field['id']
            # Find matching slug
            slug = None
            for s, n in FIELD_SLUGS.items():
                if n == name:
                    slug = s
                    break
            if slug:
                mappings[slug] = {'uuid': uuid, 'name': name}
        
        return mappings
    except Exception as e:
        print(f"Error getting field mappings: {e}")
        return {}

async def generate_lessons():
    """Generate 2 lessons for each field"""
    
    print("=" * 70)
    print("GENERATING 2 LESSONS FOR EACH FIELD")
    print("=" * 70)
    print()
    
    # Get field mappings from database
    mappings = get_field_mappings()
    
    if not mappings:
        print("❌ Could not load field mappings from database")
        return
    
    print(f"Loaded {len(mappings)} field mappings:")
    for slug, info in mappings.items():
        print(f"  • {info['name']} → {slug}")
    print()
    
    generator = AutoContentGenerator()
    
    total_generated = 0
    total_failed = 0
    
    for slug, info in mappings.items():
        field_name = info['name']
        print(f"📚 {field_name} ({slug})")
        print("-" * 70)
        
        try:
            # Use slug (tech, finance, etc.) for generation
            lessons = await generator.generate_lessons_for_field(
                field_id=slug,  # Use slug, not UUID
                count=2
            )
            
            if lessons:
                print(f"✅ Generated {len(lessons)} lessons")
                for i, lesson in enumerate(lessons, 1):
                    print(f"   {i}. {lesson.get('title', 'Untitled')[:60]}")
                total_generated += len(lessons)
            else:
                print(f"⚠️  No lessons generated")
                total_failed += 1
                
        except Exception as e:
            print(f"❌ Error: {str(e)[:100]}")
            total_failed += 1
        
        print()
        await asyncio.sleep(3)  # Rate limit
    
    print("=" * 70)
    print(f"✅ Generated: {total_generated} lessons")
    print(f"❌ Failed: {total_failed} fields")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(generate_lessons())
