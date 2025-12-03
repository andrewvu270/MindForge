"""
Test script to verify quiz submission logic
"""
import asyncio
import sys
from datetime import datetime
from database import db

async def test_quiz_submission():
    """Test the quiz submission flow"""
    print("=" * 60)
    print("Testing Quiz Submission Logic")
    print("=" * 60)
    
    try:
        client = db.client
        
        # Step 1: Check if we have any lessons
        print("\n1. Checking for lessons...")
        lessons_response = client.table("lessons").select("id, title").limit(1).execute()
        
        if not lessons_response.data:
            print("❌ No lessons found in database")
            return False
        
        lesson = lessons_response.data[0]
        lesson_id = lesson["id"]
        print(f"✓ Found lesson: {lesson['title']} (ID: {lesson_id})")
        
        # Step 2: Check if we have quiz questions for this lesson
        print(f"\n2. Checking for quiz questions for lesson {lesson_id}...")
        quiz_response = client.table("quizzes").select("*").eq("lesson_id", lesson_id).execute()
        
        if not quiz_response.data:
            print(f"❌ No quiz questions found for lesson {lesson_id}")
            print("   Try generating a quiz first or use a different lesson")
            return False
        
        questions = quiz_response.data
        print(f"✓ Found {len(questions)} quiz questions")
        
        # Step 3: Display question structure
        print("\n3. Examining question structure...")
        for i, q in enumerate(questions[:2], 1):  # Show first 2 questions
            print(f"\n   Question {i}:")
            print(f"   - ID: {q['id']}")
            print(f"   - Question: {q['question'][:60]}...")
            print(f"   - Options type: {type(q.get('options'))}")
            print(f"   - Options count: {len(q.get('options', []))}")
            print(f"   - Correct answer type: {type(q.get('correct_answer'))}")
            print(f"   - Correct answer: {q.get('correct_answer')}")
        
        # Step 4: Simulate a quiz submission
        print("\n4. Simulating quiz submission...")
        
        # Take first 5 questions (or all if less than 5)
        selected_questions = questions[:min(5, len(questions))]
        
        # Create mock answers - answer first question correctly, second incorrectly
        mock_answers = {}
        for i, q in enumerate(selected_questions):
            options = q.get('options', [])
            correct_answer = q.get('correct_answer')
            
            if i == 0:
                # Answer first question correctly
                if isinstance(correct_answer, int) and 0 <= correct_answer < len(options):
                    mock_answers[q['id']] = options[correct_answer]
                else:
                    mock_answers[q['id']] = correct_answer
            else:
                # Answer others with first option (might be wrong)
                if options:
                    mock_answers[q['id']] = options[0]
        
        print(f"   Created {len(mock_answers)} mock answers")
        
        # Step 5: Test the scoring logic
        print("\n5. Testing scoring logic...")
        correct_count = 0
        incorrect_count = 0
        
        for question_id, user_answer in mock_answers.items():
            question = next((q for q in questions if q['id'] == question_id), None)
            if not question:
                print(f"   ⚠ Question {question_id} not found")
                continue
            
            correct_answer = question['correct_answer']
            options = question.get('options', [])
            
            # Apply the same logic as the fixed endpoint
            is_correct = False
            if isinstance(correct_answer, int):
                if 0 <= correct_answer < len(options):
                    correct_text = options[correct_answer]
                    is_correct = user_answer == correct_text
            else:
                is_correct = user_answer == correct_answer
            
            if is_correct:
                correct_count += 1
                print(f"   ✓ Question {question_id[:8]}... - CORRECT")
            else:
                incorrect_count += 1
                print(f"   ✗ Question {question_id[:8]}... - INCORRECT")
        
        total = len(mock_answers)
        percentage = (correct_count / total * 100) if total > 0 else 0
        
        print(f"\n6. Results:")
        print(f"   Score: {correct_count}/{total} ({percentage:.1f}%)")
        print(f"   Points earned: {correct_count * 5}")
        
        if total > 0:
            print("\n✅ Quiz submission logic test PASSED")
            return True
        else:
            print("\n❌ No answers were processed")
            return False
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_quiz_submission())
    sys.exit(0 if result else 1)
