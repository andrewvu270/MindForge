"""
Check what quiz data exists in the database
"""
from database import db

def check_quiz_data():
    """Check quiz data in database"""
    print("=" * 60)
    print("Checking Quiz Data in Database")
    print("=" * 60)
    
    try:
        client = db.client
        
        # Check total lessons
        print("\n1. Lessons:")
        lessons_response = client.table("lessons").select("id, title").limit(10).execute()
        print(f"   Total lessons (first 10): {len(lessons_response.data)}")
        for lesson in lessons_response.data[:3]:
            print(f"   - {lesson['title'][:50]}... (ID: {lesson['id']})")
        
        # Check total quiz questions
        print("\n2. Quiz Questions:")
        quiz_response = client.table("quizzes").select("*").limit(100).execute()
        print(f"   Total quiz questions: {len(quiz_response.data)}")
        
        if quiz_response.data:
            # Group by lesson_id
            by_lesson = {}
            for q in quiz_response.data:
                lesson_id = q.get('lesson_id')
                if lesson_id not in by_lesson:
                    by_lesson[lesson_id] = []
                by_lesson[lesson_id].append(q)
            
            print(f"   Questions distributed across {len(by_lesson)} lessons:")
            for lesson_id, questions in list(by_lesson.items())[:5]:
                print(f"   - Lesson {lesson_id}: {len(questions)} questions")
                # Show structure of first question
                if questions:
                    q = questions[0]
                    print(f"     Sample: {q['question'][:50]}...")
                    print(f"     Options type: {type(q.get('options'))}, Count: {len(q.get('options', []))}")
                    print(f"     Correct answer: {q.get('correct_answer')} (type: {type(q.get('correct_answer'))})")
        else:
            print("   ⚠ No quiz questions found in database!")
            print("   This explains why quiz stats show 0 of 0")
        
        # Check quiz attempts
        print("\n3. Quiz Attempts:")
        attempts_response = client.table("quiz_attempts").select("*").limit(10).execute()
        print(f"   Total quiz attempts: {len(attempts_response.data)}")
        if attempts_response.data:
            for attempt in attempts_response.data[:3]:
                print(f"   - User: {attempt['user_id']}, Score: {attempt['score']}/{attempt['total_questions']}")
        
        # Check user stats
        print("\n4. User Stats:")
        stats_response = client.table("user_stats").select("*").limit(5).execute()
        print(f"   Total user stats records: {len(stats_response.data)}")
        if stats_response.data:
            for stat in stats_response.data:
                print(f"   - User: {stat['user_id']}")
                print(f"     Points: {stat.get('total_points', 0)}")
                print(f"     Quizzes completed: {stat.get('quizzes_completed', 0)}")
                print(f"     Lessons completed: {stat.get('lessons_completed', 0)}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_quiz_data()
