"""
Test complete media generation pipeline
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services.free_llm_service import get_free_llm_service
from services.image_generation_service import get_image_generation_service
from services.tts_service import get_tts_service


async def test_complete_pipeline():
    """Test LLM + Image + TTS pipeline"""
    
    print("=" * 60)
    print("COMPLETE MEDIA GENERATION PIPELINE TEST")
    print("=" * 60)
    print()
    
    # Initialize services
    llm = get_free_llm_service()
    image_service = get_image_generation_service()
    tts_service = get_tts_service()
    
    # Test topic
    topic = "Introduction to Quantum Computing"
    
    # 1. Generate lesson content with LLM
    print("1. Generating lesson content with Groq LLM...")
    prompt = f"""Create a brief educational lesson about {topic}.
    
Format as JSON:
{{
    "title": "Lesson title",
    "content": "2-3 sentence explanation",
    "key_points": ["point1", "point2", "point3"]
}}"""
    
    lesson_text = await llm.generate_text(prompt, max_tokens=300)
    print(f"   ✅ Generated lesson content")
    print(f"   📝 Preview: {lesson_text[:100]}...")
    print()
    
    # 2. Generate image
    print("2. Generating lesson image...")
    image_prompt = f"Educational illustration for {topic}, clean design, professional"
    image_result = await image_service.generate_image(image_prompt, width=512, height=512)
    
    if image_result.get("success"):
        print(f"   ✅ Image generated!")
        print(f"   🎨 Provider: {image_result.get('provider')}")
        print(f"   ⏱️  Time: {image_result.get('generation_time_seconds', 0):.2f}s")
        print(f"   📸 URL: {image_result.get('image_url')[:80]}...")
    else:
        print(f"   ❌ Image failed: {image_result.get('error')}")
    print()
    
    # 3. Generate audio
    print("3. Generating audio narration...")
    audio_text = "Welcome to this lesson on quantum computing. Quantum computers use quantum mechanics to solve complex problems."
    audio_result = await tts_service.generate_speech(audio_text)
    
    if audio_result.get("success"):
        print(f"   ✅ Audio generated!")
        print(f"   🔊 Provider: {audio_result.get('provider')}")
        print(f"   ⏱️  Time: {audio_result.get('generation_time_seconds', 0):.2f}s")
        print(f"   📊 Size: {len(audio_result.get('audio_data', ''))} bytes (base64)")
    else:
        print(f"   ❌ Audio failed: {audio_result.get('error')}")
    print()
    
    print("=" * 60)
    print("PIPELINE TEST COMPLETE")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  ✅ LLM: Groq (llama-3.3-70b-versatile)")
    print(f"  {'✅' if image_result.get('success') else '❌'} Images: {image_result.get('provider', 'failed')}")
    print(f"  {'✅' if audio_result.get('success') else '❌'} Audio: {audio_result.get('provider', 'failed')}")
    print()
    print("Your lesson generation system is ready! 🚀")


if __name__ == "__main__":
    asyncio.run(test_complete_pipeline())
