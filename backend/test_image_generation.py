"""
Test script for image generation service
"""
import asyncio
from services.image_generation_service import get_image_generation_service, ImageProvider


async def test_providers():
    """Test all available image generation providers"""
    service = get_image_generation_service()
    
    print("=" * 60)
    print("IMAGE GENERATION SERVICE TEST")
    print("=" * 60)
    
    # Check provider status
    print("\n1. Checking provider availability...")
    status = await service.check_provider_status()
    for provider, available in status.items():
        icon = "✅" if available else "❌"
        print(f"   {icon} {provider}: {'Available' if available else 'Not available'}")
    
    # Get recommended provider
    recommended = service.get_recommended_provider()
    print(f"\n2. Recommended provider: {recommended.value}")
    
    # Test Pollinations (always available)
    print("\n3. Testing Pollinations.ai...")
    try:
        result = await service.generate_image(
            prompt="a serene mountain landscape at sunset with vibrant colors",
            width=1024,
            height=1024,
            provider=ImageProvider.POLLINATIONS
        )
        
        if result["success"]:
            print(f"   ✅ Success!")
            print(f"   📸 Image URL: {result['image_url'][:80]}...")
            print(f"   ⏱️  Generation time: {result['generation_time_seconds']:.2f}s")
            print(f"   🎨 Provider: {result['provider']}")
        else:
            print(f"   ❌ Failed: {result['error']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test Ollama (if enabled)
    if status.get("ollama"):
        print("\n4. Testing Ollama...")
        try:
            result = await service.generate_image(
                prompt="a beautiful sunset over mountains",
                provider=ImageProvider.OLLAMA
            )
            
            if result["success"]:
                print(f"   ✅ Success!")
                print(f"   ⏱️  Generation time: {result['generation_time_seconds']:.2f}s")
                print(f"   🎨 Model: {result['metadata'].get('model', 'unknown')}")
            else:
                print(f"   ❌ Failed: {result['error']}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print("\n4. Ollama: Not enabled (set OLLAMA_ENABLED=true in .env)")
    
    # Test auto-selection
    print("\n5. Testing auto-selection (best available provider)...")
    try:
        result = await service.generate_image(
            prompt="a futuristic city at night with neon lights",
            width=1024,
            height=1024
        )
        
        if result["success"]:
            print(f"   ✅ Success!")
            print(f"   🎨 Auto-selected: {result['provider']}")
            print(f"   ⏱️  Generation time: {result['generation_time_seconds']:.2f}s")
            print(f"   📸 Image URL: {result['image_url'][:80]}...")
        else:
            print(f"   ❌ Failed: {result['error']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_providers())
