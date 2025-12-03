"""
Check what columns actually exist in the Supabase lessons table
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("❌ SUPABASE_URL or SUPABASE_ANON_KEY not found in .env")
    exit(1)

client = create_client(supabase_url, supabase_key)

print("=" * 60)
print("CHECKING SUPABASE DATABASE SCHEMA")
print("=" * 60)

# Try to query the lessons table structure
try:
    # Get a sample lesson to see what columns exist
    response = client.table('lessons').select('*').limit(1).execute()
    
    if response.data and len(response.data) > 0:
        lesson = response.data[0]
        print("\n✅ Lessons table exists!")
        print(f"\n📋 Columns found in lessons table:")
        for key in sorted(lesson.keys()):
            print(f"  - {key}")
        
        # Check for the specific columns we need
        print("\n🔍 Checking for required columns:")
        required_cols = ['audio_clips', 'video_duration_seconds', 'images', 'sources']
        for col in required_cols:
            if col in lesson:
                print(f"  ✅ {col} - EXISTS")
            else:
                print(f"  ❌ {col} - MISSING")
    else:
        print("\n⚠️  Lessons table exists but is empty")
        print("Cannot check columns without data")
        print("\nTry inserting a test lesson first, or check the schema directly in Supabase")
        
except Exception as e:
    print(f"\n❌ Error querying lessons table: {e}")
    print("\nThis might mean:")
    print("  1. The lessons table doesn't exist")
    print("  2. Your Supabase credentials are wrong")
    print("  3. You need to run the base schema migration first")

print("\n" + "=" * 60)
