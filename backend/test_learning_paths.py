"""
Test script for Learning Path Agent
"""
import asyncio
import sys
from agents.learning_path_agent import LearningPathAgent

async def test_learning_path_generation():
    """Test the learning path agent with sample lessons"""
    
    # Sample lessons for Economics field
    sample_lessons = [
        {
            'id': '1',
            'title': 'Introduction to Supply and Demand',
            'difficulty_level': 'Beginner',
            'estimated_minutes': 5
        },
        {
            'id': '2',
            'title': 'Understanding Market Equilibrium',
            'difficulty_level': 'Beginner',
            'estimated_minutes': 7
        },
        {
            'id': '3',
            'title': 'Consumer Behavior Theory',
            'difficulty_level': 'Intermediate',
            'estimated_minutes': 8
        },
        {
            'id': '4',
            'title': 'Production and Cost Analysis',
            'difficulty_level': 'Intermediate',
            'estimated_minutes': 10
        },
        {
            'id': '5',
            'title': 'Market Structures: Perfect Competition',
            'difficulty_level': 'Intermediate',
            'estimated_minutes': 9
        },
        {
            'id': '6',
            'title': 'Monopoly and Market Power',
            'difficulty_level': 'Advanced',
            'estimated_minutes': 12
        },
        {
            'id': '7',
            'title': 'Game Theory in Economics',
            'difficulty_level': 'Advanced',
            'estimated_minutes': 15
        },
        {
            'id': '8',
            'title': 'Macroeconomic Policy Analysis',
            'difficulty_level': 'Advanced',
            'estimated_minutes': 14
        },
    ]
    
    print("🧪 Testing Learning Path Agent...")
    print(f"📚 Sample lessons: {len(sample_lessons)}")
    print()
    
    agent = LearningPathAgent()
    
    try:
        paths = await agent.generate_paths_for_field('Economics', sample_lessons)
        
        print(f"✅ Generated {len(paths)} learning paths\n")
        
        for path in paths:
            print(f"📖 {path['name']} ({path['difficulty']})")
            print(f"   Description: {path['description']}")
            print(f"   Lessons: {len(path['lessons'])}")
            print(f"   Rationale: {path['rationale'][:100]}...")
            print()
            
            for i, lesson in enumerate(path['lessons'], 1):
                print(f"      {i}. {lesson['title']} ({lesson['estimated_minutes']} min)")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_learning_path_generation())
    sys.exit(0 if success else 1)

