"""
Test Groq API
"""
import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_groq():
    """Test if Groq API works"""
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment")
        return False
    
    print(f"✅ GROQ_API_KEY found: {api_key[:20]}...")
    
    try:
        client = AsyncGroq(api_key=api_key)
        
        print("\n🧪 Testing Groq text generation...")
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Groq's fast model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Explain quantum computing in one sentence."}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        result = response.choices[0].message.content
        
        print(f"✅ Groq Response: {result}")
        print(f"\n📊 Model: {response.model}")
        print(f"📊 Tokens used: {response.usage.total_tokens}")
        
        return True
        
    except Exception as e:
        print(f"❌ Groq test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_groq())
    
    if success:
        print("\n✅ Groq is working! Ready to use as primary LLM.")
    else:
        print("\n❌ Groq test failed. Will use OpenAI only.")
