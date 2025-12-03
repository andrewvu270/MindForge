"""
Test storing quiz questions directly
"""
import uuid
from datetime import datetime
from database import db

def test_quiz_storage():
    """Test storing a quiz question"""
    print("=" * 60)
    print("Testing Quiz Question Storage")
    print("=" * 60)
    
    try:
        client = db.client
        
        # Get a lesson ID
        print("\n1. Getting a lesson ID...")
        lessons_response = client.table("lessons").select("id, title").limit(1).execute()
        if not lessons_response.data:
            print("❌ No lessons found")
            return False
        
        lesson = lessons_response.data[0]
        lesson_id = lesson["id"]
        print(f"✓ Using lesson: {lesson['title'][:50]}...")
        print(f"  Lesson ID: {lesson_id}")
        
        # Try storing with TEXT correct_answer
        print("\n2. Attempting to store quiz question (TEXT format)...")
        db_id = str(uuid.uuid4())
        quiz_data_text = {
            "id": db_id,
            "lesson_id": lesson_id,
            "question": "Test question: What is AI?",
            "options": ["A) Artificial Intelligence", "B) Automated Intelligence", "C) Advanced Intelligence", "D) None"],
            "correct_answer": "A) Artificial Intelligence",  # TEXT format
            "explanation": "AI stands for Artificial Intelligence",
            "points": 5,
            "created_at": datetime.now().isoformat()
        }
        
        try:
            result = client.table("quizzes").insert(quiz_data_text).execute()
            if result.data:
                print(f"✓ Successfully stored question with TEXT correct_answer")
                print(f"  Question ID: {result.data[0]['id']}")
                
                # Clean up
                client.table("quizzes").delete().eq("id", db_id).execute()
                print(f"✓ Cleaned up test question")
                return True
            else:
                print(f"❌ Insert returned no data")
        except Exception as e:
            print(f"❌ Failed with TEXT format: {e}")
            
            # Try with INTEGER correct_answer
            print("\n3. Attempting to store quiz question (INTEGER format)...")
            db_id2 = str(uuid.uuid4())
            quiz_data_int = {
                "id": db_id2,
                "lesson_id": lesson_id,
                "question": "Test question: What is AI?",
                "options": ["A) Artificial Intelligence", "B) Automated Intelligence", "C) Advanced Intelligence", "D) None"],
                "correct_answer": 0,  # INTEGER format (index)
                "explanation": "AI stands for Artificial Intelligence",
                "points": 5,
                "created_at": datetime.now().isoformat()
            }
            
            try:
                result = client.table("quizzes").insert(quiz_data_int).execute()
                if result.data:
                    print(f"✓ Successfully stored question with INTEGER correct_answer")
                    print(f"  Question ID: {result.data[0]['id']}")
                    
                    # Clean up
                    client.table("quizzes").delete().eq("id", db_id2).execute()
                    print(f"✓ Cleaned up test question")
                    return True
                else:
                    print(f"❌ Insert returned no data")
            except Exception as e2:
                print(f"❌ Failed with INTEGER format: {e2}")
                return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_quiz_storage()
