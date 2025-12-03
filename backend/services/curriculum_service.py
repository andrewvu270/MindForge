"""
Curriculum Service
Generates and manages structured learning paths (curricula) for fields.
"""
import logging
import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime

from database import db
from services.llm_service import get_llm_service
from models import LearningPath, PathLesson

logger = logging.getLogger(__name__)

class CurriculumService:
    """
    Service for managing learning paths (curricula).
    """
    
    def __init__(self):
        self.llm_service = get_llm_service()
        
    async def get_curriculum(self, field_id: str) -> Optional[Dict[str, Any]]:
        """
        Get existing curriculum for a field.
        
        Args:
            field_id: Field identifier
            
        Returns:
            Curriculum data or None if not found
        """
        try:
            response = db.client.table("learning_paths").select("*").eq("field_id", field_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching curriculum for {field_id}: {e}")
            return None
            
    async def generate_and_save_curriculum(self, field_id: str, num_lessons: int = 5) -> Optional[Dict[str, Any]]:
        """
        Generate a new curriculum for a field and save it to the database.
        
        Args:
            field_id: Field identifier
            num_lessons: Number of lessons in the path
            
        Returns:
            Generated curriculum data
        """
        try:
            # Check if exists first
            existing = await self.get_curriculum(field_id)
            if existing:
                logger.info(f"Curriculum already exists for {field_id}")
                return existing
                
            logger.info(f"Generating curriculum for {field_id}...")
            
            # Generate using LLM
            # Map field_id to display name
            field_names = {
                'tech': 'Technology',
                'finance': 'Finance',
                'economics': 'Economics',
                'culture': 'Culture',
                'influence': 'Influence',
                'global': 'Global Events'
            }
            field_name = field_names.get(field_id, field_id.capitalize())
            
            lessons_data = await self.llm_service.generate_curriculum(field_name, num_lessons)
            
            if not lessons_data:
                logger.error("Failed to generate curriculum data")
                return None
                
            # Create PathLesson objects
            path_lessons = []
            for i, lesson in enumerate(lessons_data):
                path_lessons.append({
                    "title": lesson.get("title", f"Lesson {i+1}"),
                    "description": lesson.get("description", ""),
                    "difficulty": lesson.get("difficulty", "Beginner"),
                    "key_topics": lesson.get("key_topics", []),
                    "order": i + 1,
                    "is_completed": False
                })
                
            # Create LearningPath object
            path_id = str(uuid.uuid4())
            learning_path = {
                "id": path_id,
                "field_id": field_id,
                "title": f"{field_name} Mastery Path",
                "description": f"A structured journey to master {field_name} from beginner to advanced.",
                "lessons": path_lessons,
                "total_lessons": len(path_lessons),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # Save to DB
            # Note: Supabase JSONB column 'lessons' will store the list of dicts
            db.client.table("learning_paths").insert(learning_path).execute()
            
            logger.info(f"✅ Saved curriculum for {field_id} with {len(path_lessons)} lessons")
            return learning_path
            
        except Exception as e:
            logger.error(f"Error generating/saving curriculum: {e}")
            return None

# Singleton instance
_curriculum_service = None

def get_curriculum_service() -> CurriculumService:
    """Get or create the curriculum service singleton"""
    global _curriculum_service
    if _curriculum_service is None:
        _curriculum_service = CurriculumService()
    return _curriculum_service
