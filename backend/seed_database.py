#!/usr/bin/env python3
"""
Script to seed the Supabase database with initial data
Run this script to populate your database with sample lessons, fields, and quiz questions
"""

import os
import sys
from dotenv import load_dotenv
from database import db
from seed_data import get_seed_data

load_dotenv()

def seed_database():
    """Seed the database with initial data"""
    print("🌱 Starting database seeding...")
    
    try:
        client = db.get_client()
        seed_data = get_seed_data()
        
        # Seed Fields
        print("📚 Seeding fields...")
        fields_response = client.table("fields").upsert(
            [field.dict() for field in seed_data["fields"]]
        ).execute()
        print(f"✅ Seeded {len(seed_data['fields'])} fields")
        
        # Seed Lessons
        print("📖 Seeding lessons...")
        lessons_response = client.table("lessons").upsert(
            [lesson.dict() for lesson in seed_data["lessons"]]
        ).execute()
        print(f"✅ Seeded {len(seed_data['lessons'])} lessons")
        
        # Seed Quiz Questions
        print("📝 Seeding quiz questions...")
        quiz_response = client.table("quiz_questions").upsert(
            [question.dict() for question in seed_data["quiz_questions"]]
        ).execute()
        print(f"✅ Seeded {len(seed_data['quiz_questions'])} quiz questions")
        
        print("\n🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        print("\n💡 Make sure your SUPABASE_URL and SUPABASE_KEY are set in .env")
        sys.exit(1)

if __name__ == "__main__":
    # Check environment variables
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Missing required environment variables:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_KEY")
        print("\n💡 Copy backend/.env.example to backend/.env and fill in your Supabase credentials")
        sys.exit(1)
    
    seed_database()
