"""
Setup Fresh Lessons
Clears hardcoded lessons and generates new ones from real sources
"""
import asyncio
import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from generate_initial_lessons import generate_lessons_for_all_fields


async def main():
    """Main setup function."""
    print("=" * 60)
    print("LESSON GENERATION")
    print("=" * 60)
    print("This will generate 2 lessons for each field:")
    print("  - Technology")
    print("  - Finance")
    print("  - Economics")
    print("  - Culture")
    print("  - Influence")
    print("  - Global Events")
    print("\nEach lesson includes:")
    print("  - AI-generated content from multiple sources")
    print("  - Quiz questions")
    print("  - Flashcards (if table exists)")
    print("=" * 60)
    
    # Ask for confirmation
    response = input("\n⚠️  Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Cancelled")
        return 1
    
    # Generate new lessons
    print("\n🚀 Generating lessons from real sources...")
    total, failed = await generate_lessons_for_all_fields()
    
    if total > 0:
        print("\n" + "=" * 60)
        print("✅ GENERATION COMPLETE!")
        print("=" * 60)
        print(f"Generated {total} lessons across 6 fields")
        print("\n🌐 View at: http://localhost:5173/lessons")
        print("=" * 60)
        return 0
    else:
        print("\n❌ No lessons were generated")
        print("Check your API keys and network connection")
        return 1


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled by user")
        sys.exit(1)

