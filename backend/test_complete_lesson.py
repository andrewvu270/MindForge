"""
Test Complete Lesson Generation with All Media
"""
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services.free_llm_service import get_free_llm_service
from services.image_generation_service import get_image_generation_service
from services.audio_mixer_service import get_audio_mixer_service


async def test_complete_lesson():
    """Test complete lesson generation with text, images, and audio"""
    
    print("=" * 60)
    print("COMPLETE LESSON GENERATION TEST")
    print("=" * 60)
    print()
    
    # Initialize services
    llm = get_free_llm_service()
    image_service = get_image_generation_service()
    audio_mixer = get_audio_mixer_service()
    
    # Test lesson
    topic = "Introduction to Quantum Computing"
    field = "Technology"
    
    print(f"📚 Generating lesson: {topic}")
    print(f"🏷️  Field: {field}")
    print()
    
    # 1. Check dependencies
    print("1. Checking dependencies...")
    audio_deps = audio_mixer.check_dependencies()
    for dep, available in audio_deps.items():
        status = "✅" if available else "❌"
        print(f"   {status} {dep}: {'Available' if available else 'Not available'}")
    print()
    
    # 2. Generate lesson content with LLM
    print("2. Generating lesson content with Groq LLM...")
    prompt = f"""Create a brief educational lesson about {topic}.
    
Write 3-4 sentences explaining the key concepts in simple terms.
Make it engaging and easy to understand."""
    
    lesson_content = await llm.generate_text(prompt, max_tokens=300)
    print(f"   ✅ Generated lesson content")
    print(f"   📝 Content: {lesson_content[:150]}...")
    print()
    
    # 3. Generate images
    print("3. Generating lesson images...")
    images = []
    
    # Thumbnail
    print("   🎨 Generating thumbnail...")
    thumbnail_prompt = f"Educational illustration for {topic}, clean design, professional"
    result = await image_service.generate_image(thumbnail_prompt, width=512, height=512)
    if result.get("success"):
        images.append(result["image_url"])
        print(f"      ✅ Thumbnail: {result.get('provider')}")
    
    # Slide images
    slide_prompts = [
        f"Introduction slide for {topic}, minimalist design",
        f"Key concepts diagram, infographic style",
    ]
    
    for i, prompt in enumerate(slide_prompts, 1):
        print(f"   🎨 Generating slide {i}...")
        result = await image_service.generate_image(prompt, width=512, height=512)
        if result.get("success"):
            images.append(result["image_url"])
            print(f"      ✅ Slide {i}: {result.get('provider')}")
    
    print(f"   ✅ Generated {len(images)} images total")
    print()
    
    # 4. Generate complete audio (narration + music)
    print("4. Generating complete audio track...")
    
    if not audio_deps.get("pydub") or not audio_deps.get("ffmpeg"):
        print("   ⚠️  Audio mixing not available")
        print("   💡 Install with: pip install pydub && brew install ffmpeg")
        audio_result = {"success": False, "error": "Dependencies not installed"}
    else:
        audio_result = await audio_mixer.create_lesson_audio(
            lesson_content=lesson_content,
            field=field,
            duration_seconds=60
        )
    
    if audio_result.get("success"):
        print(f"   ✅ Audio track created!")
        print(f"   🎤 Narration clips: {audio_result.get('narration_clips_used', 0)}")
        print(f"   🎵 Music style: {audio_result.get('metadata', {}).get('music_style', 'unknown')}")
        print(f"   🎵 Music provider: {audio_result.get('metadata', {}).get('music_provider', 'unknown')}")
        print(f"   ⏱️  Duration: {audio_result.get('duration_seconds', 0):.1f}s")
        print(f"   📊 Audio size: {len(audio_result.get('mixed_audio', ''))} bytes (base64)")
    else:
        print(f"   ❌ Audio failed: {audio_result.get('error')}")
    print()
    
    # 5. Summary
    print("=" * 60)
    print("LESSON GENERATION COMPLETE")
    print("=" * 60)
    print()
    print("📊 Summary:")
    print(f"   ✅ Text: Generated with Groq")
    print(f"   {'✅' if images else '❌'} Images: {len(images)} generated")
    print(f"   {'✅' if audio_result.get('success') else '❌'} Audio: {'Mixed track ready' if audio_result.get('success') else 'Failed'}")
    print()
    
    if images and audio_result.get("success"):
        print("🎉 Complete lesson ready with text, images, and audio!")
    elif images:
        print("✅ Lesson ready with text and images (audio optional)")
    else:
        print("⚠️  Lesson has text only")
    print()
    
    # 6. Next steps
    print("💡 Next Steps:")
    if not audio_deps.get("pydub"):
        print("   1. Install audio mixing: pip install pydub")
    if not audio_deps.get("ffmpeg"):
        print("   2. Install FFmpeg: brew install ffmpeg")
    print("   3. Optional: Install Coqui TTS for better audio quality")
    print("      pip install TTS")
    print("      tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC")
    print("   4. Run: python3 setup_fresh_lessons.py")
    print()


if __name__ == "__main__":
    asyncio.run(test_complete_lesson())
