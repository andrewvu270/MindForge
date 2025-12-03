#!/usr/bin/env python3
"""Test HuggingFace Z-Image-Turbo"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    from services.image_generation_service import ImageGenerationService
    
    service = ImageGenerationService()
    
    print("Testing HuggingFace Z-Image-Turbo...")
    print(f"Token configured: {bool(service.hf_token)}")
    
    try:
        result = await service._generate_huggingface(
            "A futuristic AI robot teaching students",
            width=1024,
            height=1024
        )
        print(f"✅ Success!")
        print(f"   Provider: {result['metadata']['provider']}")
        print(f"   Model: {result['metadata']['model']}")
        print(f"   Image URL length: {len(result['image_url'])}")
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
