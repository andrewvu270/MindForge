"""
Test script for flashcard generation and stats tracking
"""
import asyncio
import sys
from services.llm_service import LLMService

async def test_flashcard_generation():
    """Test flashcard generation"""
    print("🧪 Testing Flashcard Generation...")
    
    llm_service = LLMService()
    
    # Sample lesson content
    lesson_content = """
    Machine Learning is a subset of artificial intelligence that enables systems to learn 
    and improve from experience without being explicitly programmed. It focuses on developing 
    algorithms that can access data and use it to learn for themselves.
    
    Key concepts include:
    - Supervised Learning: Learning from labeled data
    - Unsupervised Learning: Finding patterns in unlabeled data
    - Neural Networks: Computing systems inspired by biological neural networks
    - Deep Learning: Neural networks with many layers
    """
    
    try:
        flashcards = await llm_service.generate_flashcards(
            lesson_content=lesson_content,
            num_cards=5
        )
        
        print(f"\n✅ Generated {len(flashcards)} flashcards:")
        for i, card in enumerate(flashcards, 1):
            print(f"\n{i}. {card.get('topic', 'General')}")
            print(f"   Front: {card.get('front')}")
            print(f"   Back: {card.get('back')[:100]}...")
            print(f"   Difficulty: {card.get('difficulty')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

async def test_quiz_generation():
    """Test quiz generation"""
    print("\n\n🧪 Testing Quiz Generation...")
    
    llm_service = LLMService()
    
    lesson_content = """
    Compound interest is interest calculated on both the initial principal and accumulated 
    interest from previous periods. It makes money grow exponentially over time.
    
    The formula is: A = P(1 + r/n)^(nt)
    Where:
    - A = final amount
    - P = principal (initial investment)
    - r = annual interest rate
    - n = number of times interest is compounded per year
    - t = time in years
    """
    
    try:
        questions = await llm_service.generate_quiz(
            lesson_content=lesson_content,
            num_questions=3
        )
        
        print(f"\n✅ Generated {len(questions)} quiz questions:")
        for i, q in enumerate(questions, 1):
            print(f"\n{i}. {q.get('question')}")
            for opt in q.get('options', []):
                print(f"   {opt}")
            print(f"   ✓ Correct: {q.get('correct_answer')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

async def main():
    """Run all tests"""
    print("=" * 60)
    print("FLASHCARD & QUIZ GENERATION TEST")
    print("=" * 60)
    
    # Test flashcard generation
    flashcard_success = await test_flashcard_generation()
    
    # Test quiz generation
    quiz_success = await test_quiz_generation()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Flashcard Generation: {'✅ PASS' if flashcard_success else '❌ FAIL'}")
    print(f"Quiz Generation: {'✅ PASS' if quiz_success else '❌ FAIL'}")
    print("=" * 60)
    
    return flashcard_success and quiz_success

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

