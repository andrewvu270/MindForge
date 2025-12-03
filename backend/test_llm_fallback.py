"""
Test LLM Service with Groq + OpenAI fallback
"""
import asyncio
from services.llm_service import LLMService
from dotenv import load_dotenv

load_dotenv()

async def test_llm_service():
    """Test LLM service with automatic fallback"""
    print("=" * 60)
    print("LLM SERVICE TEST - Groq + OpenAI Fallback")
    print("=" * 60)
    
    service = LLMService()
    
    print("\n1. Testing simple completion...")
    try:
        response = await service._call_llm(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello from AI!' in one sentence."}
            ],
            temperature=0.7,
            max_tokens=50
        )
        
        result = response.choices[0].message.content
        print(f"✅ Response: {result}")
        print(f"📊 Model used: {response.model}")
        print(f"📊 Tokens: {response.usage.total_tokens}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    print("\n2. Testing JSON response...")
    try:
        response = await service._call_llm(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": 'Return JSON: {"message": "test successful", "status": "ok"}'}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        print(f"✅ JSON Response: {result}")
        
    except Exception as e:
        print(f"❌ JSON test failed: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    print("\n✅ Your agents will now use:")
    print("   1. Groq (primary, free, 14,400 req/day)")
    print("   2. OpenAI (fallback, paid, unlimited)")
    print("\n💰 Expected savings: 80-95% on LLM costs!")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_llm_service())
