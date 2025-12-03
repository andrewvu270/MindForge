"""
Test TTS Service
"""
import asyncio
from services.tts_service import get_tts_service, TTSProvider


async def test_tts():
    """Test TTS providers"""
    service = get_tts_service()
    
    print("=" * 60)
    print("TTS SERVICE TEST")
    print("=" * 60)
    print()
    
    # Check provider status
    print("1. Checking provider availability...")
    status = await service.check_provider_status()
    for provider, available in status.items():
        status_icon = "✅" if available else "❌"
        print(f"   {status_icon} {provider}: {'Available' if available else 'Not available'}")
    print()
    
    # Test text
    test_text = "Welcome to MindForge. This is a test of the text to speech system."
    
    # Test HuggingFace if available
    if status.get("huggingface"):
        print("2. Testing HuggingFace TTS...")
        result = await service.generate_speech(test_text, provider=TTSProvider.HUGGINGFACE)
        if result.get("success"):
            print(f"   ✅ Success!")
            print(f"   🔊 Provider: {result.get('provider')}")
            print(f"   ⏱️  Generation time: {result.get('generation_time_seconds', 0):.2f}s")
            print(f"   📊 Audio data length: {len(result.get('audio_data', ''))} bytes (base64)")
        else:
            print(f"   ❌ Failed: {result.get('error')}")
    else:
        print("2. HuggingFace: Not available (set HUGGINGFACE_TOKEN in .env)")
    print()
    
    # Test eSpeak if available
    if status.get("espeak"):
        print("3. Testing eSpeak (local)...")
        result = await service.generate_speech(test_text, provider=TTSProvider.ESPEAK)
        if result.get("success"):
            print(f"   ✅ Success!")
            print(f"   🔊 Provider: {result.get('provider')}")
            print(f"   ⏱️  Generation time: {result.get('generation_time_seconds', 0):.2f}s")
            print(f"   📊 Audio data length: {len(result.get('audio_data', ''))} bytes (base64)")
        else:
            print(f"   ❌ Failed: {result.get('error')}")
    else:
        print("3. eSpeak: Not installed (install with: brew install espeak)")
    print()
    
    # Test auto-selection
    print("4. Testing auto-selection (best available provider)...")
    result = await service.generate_speech(test_text)
    if result.get("success"):
        print(f"   ✅ Success!")
        print(f"   🎨 Auto-selected: {result.get('provider')}")
        print(f"   ⏱️  Generation time: {result.get('generation_time_seconds', 0):.2f}s")
        print(f"   📊 Audio data length: {len(result.get('audio_data', ''))} bytes (base64)")
    else:
        print(f"   ❌ Failed: {result.get('error')}")
    
    print()
    print("=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_tts())
