"""
Debug script to test quiz generation and see why it's failing
"""
import asyncio
import logging
import json
import os
from dotenv import load_dotenv
from services.free_llm_service import get_free_llm_service

# Load .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Print env check
print(f"GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
print(f"OPENAI_API_KEY present: {bool(os.getenv('OPENAI_API_KEY'))}")


async def test_quiz_generation():
    """Test quiz generation with detailed logging"""
    
    print("="*60)
    print("QUIZ GENERATION DEBUG TEST")
    print("="*60)
    
    llm_service = get_free_llm_service()
    
    # Sample lesson content
    lesson_content = """
    Artificial Intelligence (AI) is the simulation of human intelligence processes by machines,
    especially computer systems. These processes include learning, reasoning, and self-correction.
    
    Key concepts in AI include:
    - Machine Learning: Systems that can learn from data
    - Neural Networks: Computing systems inspired by biological neural networks
    - Deep Learning: A subset of machine learning using multiple layers
    - Natural Language Processing: Enabling computers to understand human language
    
    AI has applications in healthcare, finance, transportation, and many other fields.
    """
    
    print("\n📝 Lesson Content:")
    print(lesson_content[:200] + "...")
    
    print("\n🔄 Generating quiz questions...")
    print("-"*60)
    
    try:
        # Call the generate_quiz method
        questions = await llm_service.generate_quiz(
            lesson_content=lesson_content,
            num_questions=3
        )
        
        print("\n✅ Quiz generation completed!")
        print(f"Number of questions: {len(questions)}")
        print("\n📋 Generated Questions:")
        print("="*60)
        
        for i, q in enumerate(questions, 1):
            print(f"\nQuestion {i}:")
            print(f"  Q: {q.get('question', 'N/A')}")
            print(f"  Options: {q.get('options', [])}")
            print(f"  Correct: {q.get('correct_answer', 'N/A')}")
            print(f"  Explanation: {q.get('explanation', 'N/A')}")
        
        # Check if it's the fallback quiz
        if questions and questions[0].get('question') == "What is the main topic?":
            print("\n⚠️  WARNING: Fallback quiz was used!")
            print("This means the LLM response couldn't be parsed as JSON.")
            print("\nLet's test the raw LLM response...")
            
            # Test raw generation
            print("\n" + "="*60)
            print("TESTING RAW LLM RESPONSE")
            print("="*60)
            
            prompt = f"""Generate {3} multiple-choice quiz questions based on this lesson content.
Return ONLY a valid JSON array with no additional text.

Lesson content:
{lesson_content[:500]}

Format:
[
    {{
        "question": "Question text here?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correct_answer": "A) Option 1",
        "explanation": "Brief explanation"
    }}
]"""
            
            print("\n📤 Sending prompt to LLM...")
            raw_response = await llm_service.generate_text(prompt, max_tokens=600)
            
            print("\n📥 Raw LLM Response:")
            print("-"*60)
            print(raw_response)
            print("-"*60)
            
            # Try to parse it
            print("\n🔍 Attempting to parse as JSON...")
            try:
                parsed = json.loads(raw_response)
                print("✅ Successfully parsed as JSON!")
                print(f"Type: {type(parsed)}")
                print(f"Content: {json.dumps(parsed, indent=2)}")
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                print(f"Error at position: {e.pos}")
                print(f"Error line: {e.lineno}, column: {e.colno}")
                
                # Show the problematic part
                if e.pos:
                    start = max(0, e.pos - 50)
                    end = min(len(raw_response), e.pos + 50)
                    print(f"\nContext around error:")
                    print(raw_response[start:end])
        else:
            print("\n✅ SUCCESS: Real quiz questions were generated!")
            
    except Exception as e:
        print(f"\n❌ Error during quiz generation: {e}")
        logger.exception("Full error details:")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(test_quiz_generation())
