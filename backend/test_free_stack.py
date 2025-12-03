"""
Test script for free content generation stack
Run this to verify all services are working
"""
import asyncio
import logging
from services.free_llm_service import get_free_llm_service
from services.huggingface_service import get_huggingface_service
from services.free_video_service import get_free_video_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_free_stack():
    """Test all free services"""
    
    print("\n" + "="*60)
    print("🧪 Testing Free Content Generation Stack")
    print("="*60 + "\n")
    
    # Test 1: Groq LLM
    print("1️⃣ Testing Groq LLM Service...")
    try:
        llm_service = get_free_llm_service()
        result = await llm_service.generate_text(
            "Say 'Hello from Groq!' in one sentence.",
            max_tokens=20
        )
        if result:
            print(f"   ✅ Groq LLM: {result[:50]}...")
        else:
            print("   ❌ Groq LLM: Failed")
    except Exception as e:
        print(f"   ❌ Groq LLM Error: {e}")
    
    # Test 2: Topic Extraction
    print("\n2️⃣ Testing Topic Extraction...")
    try:
        topics = await llm_service.extract_topics(
            "I want to learn about blockchain and cryptocurrency"
        )
        if topics:
            print(f"   ✅ Topics: {topics}")
        else:
            print("   ❌ Topic extraction failed")
    except Exception as e:
        print(f"   ❌ Topic Extraction Error: {e}")
    
    # Test 3: Lesson Synthesis
    print("\n3️⃣ Testing Lesson Synthesis...")
    try:
        lesson = await llm_service.synthesize_lesson(
            sources=[
                {
                    'content': 'AI is transforming technology...',
                    'source': 'Test Source'
                }
            ],
            field='tech',
            max_words=100
        )
        if lesson and lesson.get('title'):
            print(f"   ✅ Lesson: {lesson['title']}")
        else:
            print("   ❌ Lesson synthesis failed")
    except Exception as e:
        print(f"   ❌ Lesson Synthesis Error: {e}")
    
    # Test 4: Quiz Generation
    print("\n4️⃣ Testing Quiz Generation...")
    try:
        quiz = await llm_service.generate_quiz(
            "Artificial Intelligence is the simulation of human intelligence.",
            num_questions=2
        )
        if quiz and len(quiz) > 0:
            print(f"   ✅ Quiz: {len(quiz)} questions generated")
        else:
            print("   ❌ Quiz generation failed")
    except Exception as e:
        print(f"   ❌ Quiz Generation Error: {e}")
    
    # Test 5: HuggingFace Image
    print("\n5️⃣ Testing HuggingFace Image Generation...")
    try:
        hf_service = get_huggingface_service()
        image = await hf_service.generate_image(
            "simple test image",
            width=256,
            height=256
        )
        if image:
            print(f"   ✅ Image: Generated ({len(image)} bytes)")
        else:
            print("   ❌ Image generation failed")
    except Exception as e:
        print(f"   ❌ Image Generation Error: {e}")
    
    # Test 6: HuggingFace TTS
    print("\n6️⃣ Testing HuggingFace Text-to-Speech...")
    try:
        audio = await hf_service.generate_audio("Hello world")
        if audio:
            print(f"   ✅ Audio: Generated ({len(audio)} bytes)")
        else:
            print("   ❌ Audio generation failed")
    except Exception as e:
        print(f"   ❌ Audio Generation Error: {e}")
    
    # Test 7: FFmpeg Video
    print("\n7️⃣ Testing FFmpeg Video Service...")
    try:
        video_service = get_free_video_service()
        if video_service.ffmpeg_available:
            print("   ✅ FFmpeg: Available")
        else:
            print("   ❌ FFmpeg: Not found (install with: brew install ffmpeg)")
    except Exception as e:
        print(f"   ❌ FFmpeg Error: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print("\n✅ All tests complete!")
    print("\n💡 Next steps:")
    print("   1. If any tests failed, check your .env file")
    print("   2. Get API keys from:")
    print("      - Groq: https://console.groq.com/")
    print("      - HuggingFace: https://huggingface.co/settings/tokens")
    print("   3. Install FFmpeg: brew install ffmpeg")
    print("   4. Run: python backend/free_scheduler.py")
    print("\n💰 Total cost: $0.00")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(test_free_stack())
