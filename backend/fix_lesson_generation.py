#!/usr/bin/env python3
"""
Quick fix script for lesson generation issues:
1. Tests database connection and schema
2. Tests Groq API connectivity
3. Provides diagnostics
"""
import asyncio
import os
import sys
from dotenv import load_dotenv
import httpx
from supabase import create_client

# Load environment
load_dotenv()

async def test_groq_api():
    """Test Groq API connectivity with timeout."""
    print("\n🔍 Testing Groq API...")
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in .env")
        return False
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": "Say 'test'"}],
                    "max_tokens": 10
                }
            )
            
            if response.status_code == 200:
                print("✅ Groq API is working!")
                return True
            else:
                print(f"❌ Groq API error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False
                
    except httpx.TimeoutException:
        print("❌ Groq API timeout - connection is too slow")
        return False
    except Exception as e:
        print(f"❌ Groq API error: {e}")
        return False

def test_database_schema():
    """Test database connection and check for audio column."""
    print("\n🔍 Testing Database Schema...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env")
        return False
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # Try to query lessons table
        result = supabase.table('lessons').select('*').limit(1).execute()
        print("✅ Database connection working!")
        
        # Check if we can see the columns
        if result.data:
            columns = result.data[0].keys() if result.data else []
            print(f"   Available columns: {', '.join(sorted(columns))}")
            
            if 'audio' in columns:
                print("✅ 'audio' column exists")
            else:
                print("⚠️  'audio' column missing - run migration 003")
                print("   Run this SQL in Supabase SQL Editor:")
                print("   ALTER TABLE lessons ADD COLUMN audio TEXT;")
        else:
            print("   No lessons in database yet")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

async def main():
    """Run all diagnostics."""
    print("=" * 60)
    print("MINDFORGE LESSON GENERATION DIAGNOSTICS")
    print("=" * 60)
    
    # Test database
    db_ok = test_database_schema()
    
    # Test Groq API
    groq_ok = await test_groq_api()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if db_ok and groq_ok:
        print("✅ All systems operational!")
        print("\nYou can now run: python backend/setup_fresh_lessons.py")
    else:
        print("❌ Issues detected:")
        if not db_ok:
            print("   - Database schema needs migration")
            print("     Run: database/migrations/003_add_media_columns.sql")
        if not groq_ok:
            print("   - Groq API connectivity issues")
            print("     Check your internet connection and API key")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
