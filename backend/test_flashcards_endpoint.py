"""
Test flashcards endpoint to diagnose the 500 error
"""
from database import db

def test_flashcards():
    """Test fetching flashcards from database"""
    
    print("=" * 60)
    print("TESTING FLASHCARDS ENDPOINT")
    print("=" * 60)
    print()
    
    try:
        print("1. Testing basic query...")
        client = db.client
        query = client.table("flashcards").select("*")
        
        print("2. Adding limit...")
        query = query.limit(50)
        
        print("3. Executing query...")
        response = query.execute()
        
        print(f"✅ Query successful!")
        print(f"   Found {len(response.data) if response.data else 0} flashcards")
        
        if response.data and len(response.data) > 0:
            print()
            print("Sample flashcard:")
            card = response.data[0]
            for key, value in card.items():
                print(f"   {key}: {str(value)[:60]}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    print("=" * 60)
    
    # Test with order by
    print()
    print("Testing with ORDER BY created_at...")
    try:
        query = client.table("flashcards").select("*").limit(50).order("created_at", desc=True)
        response = query.execute()
        print(f"✅ Order by successful!")
    except Exception as e:
        print(f"❌ Order by failed: {e}")
    
    print()

if __name__ == "__main__":
    test_flashcards()
