import asyncio
import sys
import os
import logging
import json
from unittest.mock import MagicMock, AsyncMock

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.curriculum_endpoints import generate_curriculum, get_curriculum
from services.curriculum_service import CurriculumService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_curriculum_api():
    print("=" * 60)
    print("TESTING CURRICULUM API")
    print("=" * 60)
    
    # Mock service
    mock_service = AsyncMock(spec=CurriculumService)
    
    mock_curriculum = {
        "id": "path_123",
        "field_id": "tech",
        "title": "Technology Mastery Path",
        "description": "A structured journey...",
        "lessons": [
            {
                "title": "Intro to Tech",
                "description": "Basics",
                "difficulty": "Beginner",
                "key_topics": ["Hardware", "Software"],
                "order": 1,
                "is_completed": False
            }
        ],
        "total_lessons": 1
    }
    
    mock_service.generate_and_save_curriculum.return_value = mock_curriculum
    mock_service.get_curriculum.return_value = mock_curriculum
    
    print("\n1. Testing Generate Curriculum Endpoint...")
    try:
        result = await generate_curriculum(field_id="tech", num_lessons=5, service=mock_service)
        print(f"✅ Generated: {result['title']}")
        print(f"   Lessons: {len(result['lessons'])}")
    except Exception as e:
        print(f"❌ Error generating: {e}")
        
    print("\n2. Testing Get Curriculum Endpoint...")
    try:
        result = await get_curriculum(field_id="tech", service=mock_service)
        print(f"✅ Retrieved: {result['title']}")
    except Exception as e:
        print(f"❌ Error retrieving: {e}")

if __name__ == "__main__":
    asyncio.run(test_curriculum_api())
