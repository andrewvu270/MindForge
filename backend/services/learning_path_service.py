"""
Learning Path Service
Manages curated learning paths and their lessons
"""
import logging
import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime

from database import db
from agents.learning_path_agent import LearningPathAgent
from services.content_orchestrator import ContentOrchestrator

logger = logging.getLogger(__name__)

class LearningPathService:
    """Service for managing learning paths"""
    
    def __init__(self):
        self.agent = LearningPathAgent()
        self.orchestrator = ContentOrchestrator()
    
    async def get_paths_for_field(self, field_id: str) -> List[Dict[str, Any]]:
        """
        Get all learning paths for a field.
        Returns paths with their lessons.
        """
        try:
            response = db.client.table("learning_paths")\
                .select("*, path_lessons(*)")\
                .eq("field_id", field_id)\
                .order("order_index")\
                .execute()
            
            if not response.data:
                return []
            
            # Format the response
            paths = []
            for path in response.data:
                lessons = path.get('path_lessons', [])
                lessons.sort(key=lambda x: x.get('order_index', 0))
                
                paths.append({
                    'id': path['id'],
                    'name': path['name'],
                    'difficulty': path['difficulty'],
                    'description': path['description'],
                    'total_lessons': len(lessons),
                    'estimated_hours': path.get('estimated_hours', 0),
                    'lessons': lessons
                })
            
            return paths
            
        except Exception as e:
            logger.error(f"Error fetching paths for field {field_id}: {e}")
            return []
    
    async def generate_and_save_paths(self, field_id: str, field_name: str, lessons_per_path: int = 5) -> List[Dict[str, Any]]:
        """
        Generate new learning paths for a field and save to database.
        This creates the path structure and lesson outlines.
        """
        try:
            # Check if paths already exist
            existing = await self.get_paths_for_field(field_id)
            if existing:
                logger.info(f"Paths already exist for {field_id}")
                return existing
            
            logger.info(f"Generating curriculum for {field_name}...")
            
            # Use agent to generate curriculum
            paths_data = await self.agent.generate_curriculum_for_field(field_name, lessons_per_path)
            
            if not paths_data:
                logger.error("Failed to generate curriculum")
                return []
            
            # Save paths and lessons to database
            saved_paths = []
            for i, path_data in enumerate(paths_data):
                # Create learning path
                path_id = str(uuid.uuid4())
                path_record = {
                    'id': path_id,
                    'field_id': field_id,
                    'field_name': field_name,
                    'name': path_data['name'],
                    'difficulty': path_data['difficulty'],
                    'description': path_data['description'],
                    'order_index': i,
                    'total_lessons': len(path_data.get('lessons', [])),
                    'estimated_hours': sum(l.get('estimated_minutes', 15) for l in path_data.get('lessons', [])) / 60.0
                }
                
                db.client.table("learning_paths").insert(path_record).execute()
                
                # Create path lessons
                lessons = []
                for j, lesson_data in enumerate(path_data.get('lessons', [])):
                    lesson_id = str(uuid.uuid4())
                    lesson_record = {
                        'id': lesson_id,
                        'path_id': path_id,
                        'title': lesson_data['title'],
                        'content': lesson_data.get('summary', ''),  # Will be filled later
                        'summary': lesson_data.get('summary', ''),
                        'order_index': j,
                        'estimated_minutes': lesson_data.get('estimated_minutes', 15),
                        'difficulty_level': path_data['difficulty'],
                        'key_concepts': lesson_data.get('key_concepts', [])
                    }
                    
                    db.client.table("path_lessons").insert(lesson_record).execute()
                    lessons.append(lesson_record)
                
                saved_paths.append({
                    **path_record,
                    'lessons': lessons
                })
                
                logger.info(f"✅ Saved {path_data['name']} with {len(lessons)} lessons")
            
            return saved_paths
            
        except Exception as e:
            logger.error(f"Error generating/saving paths: {e}")
            return []
    
    async def generate_lesson_content(self, path_lesson_id: str) -> bool:
        """
        Generate full content for a path lesson using the content orchestrator.
        This fills in the detailed content, video, audio, etc.
        """
        try:
            # Get the lesson
            response = db.client.table("path_lessons")\
                .select("*")\
                .eq("id", path_lesson_id)\
                .single()\
                .execute()
            
            if not response.data:
                logger.error(f"Lesson {path_lesson_id} not found")
                return False
            
            lesson = response.data
            
            # Generate full content using orchestrator
            # This would use the Frankenstein system to create rich content
            logger.info(f"Generating content for: {lesson['title']}")
            
            # TODO: Integrate with content orchestrator
            # For now, just mark as having content
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating lesson content: {e}")
            return False
    
    async def get_user_generated_lessons(self, field_id: str) -> List[Dict[str, Any]]:
        """
        Get all user-generated (Frankenstein) lessons for a field.
        """
        try:
            response = db.client.table("lessons")\
                .select("*")\
                .eq("field_id", field_id)\
                .eq("lesson_type", "user_generated")\
                .order("created_at", desc=True)\
                .execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Error fetching user lessons: {e}")
            return []

# Singleton instance
_learning_path_service = None

def get_learning_path_service() -> LearningPathService:
    """Get or create the learning path service singleton"""
    global _learning_path_service
    if _learning_path_service is None:
        _learning_path_service = LearningPathService()
    return _learning_path_service

