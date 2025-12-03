"""
Quick diagnostic script to check database tables
"""
from database import db

def check_tables():
    """Check if required tables exist and have data"""
    
    tables_to_check = [
        "flashcards",
        "reflection_prompts",
        "quizzes",
        "lessons",
        "users"
    ]
    
    print("=" * 60)
    print("DATABASE TABLE CHECK")
    print("=" * 60)
    print()
    
    for table in tables_to_check:
        try:
            response = db.client.table(table).select("*", count="exact").limit(1).execute()
            count = response.count if hasattr(response, 'count') else len(response.data)
            status = "✅" if response.data is not None else "❌"
            print(f"{status} {table:25} - {count if count else 0} rows")
        except Exception as e:
            print(f"❌ {table:25} - ERROR: {str(e)[:50]}")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    check_tables()
