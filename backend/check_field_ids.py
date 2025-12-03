"""
Check what field IDs exist in the database
"""
from database import db

def check_fields():
    """Check field IDs in database"""
    
    print("=" * 60)
    print("CHECKING FIELD IDs IN DATABASE")
    print("=" * 60)
    print()
    
    try:
        response = db.client.table("categories").select("id, name").execute()
        fields = response.data if response.data else []
        
        if not fields:
            print("❌ No fields found in database")
            return
        
        print(f"Found {len(fields)} fields:")
        print()
        for field in fields:
            print(f"  ID: {field['id']:20} Name: {field['name']}")
        
        print()
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_fields()
