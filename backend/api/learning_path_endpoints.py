"""
Learning Path API Endpoints
Provides endpoints for curated learning paths and user-generated lessons
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db
from services.learning_path_service import get_learning_path_service, LearningPathService

router = APIRouter(prefix="/api/learning-paths", tags=["learning-paths"])
logger = logging.getLogger(__name__)

class GeneratePathsRequest(BaseModel):
    field_id: str
    field_name: str
    lessons_per_path: int = 5

@router.get("/{field_id}")
async def get_learning_paths(
    field_id: str,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    Get curated learning paths for a field.
    Returns structured curriculum with lessons.
    """
    try:
        paths = await service.get_paths_for_field(field_id)
        
        if not paths:
            # Return empty array instead of 404 - frontend will handle gracefully
            logger.warning(f"No learning paths found for field {field_id}")
            return []
        
        return paths
        
    except Exception as e:
        logger.error(f"Error fetching learning paths: {e}")
        import traceback
        logger.error(traceback.format_exc())
        # Return empty array instead of error
        return []

@router.post("/generate")
async def generate_learning_paths(
    request: GeneratePathsRequest,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    Generate new curated learning paths for a field.
    
    Creates 3 paths (Beginner, Intermediate, Advanced) with lesson outlines.
    The agent determines the curriculum structure and lesson topics.
    """
    try:
        paths = await service.generate_and_save_paths(
            request.field_id,
            request.field_name,
            request.lessons_per_path
        )
        
        if not paths:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate learning paths"
            )
        
        logger.info(f"✅ Generated {len(paths)} learning paths for {request.field_name}")
        return {
            "success": True,
            "paths_created": len(paths),
            "paths": paths
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating learning paths: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{field_id}/user-lessons")
async def get_user_generated_lessons(
    field_id: str,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    Get all user-generated (Frankenstein) lessons for a field.
    These are lessons created by users via the lesson generator.
    """
    try:
        lessons = await service.get_user_generated_lessons(field_id)
        
        return {
            "field_id": field_id,
            "total_lessons": len(lessons),
            "lessons": lessons
        }
        
    except Exception as e:
        logger.error(f"Error fetching user lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/lesson/{lesson_id}/generate-content")
async def generate_lesson_content(
    lesson_id: str,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    Generate full content for a path lesson.
    This fills in detailed content, video, audio, etc.
    """
    try:
        success = await service.generate_lesson_content(lesson_id)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate lesson content"
            )
        
        return {"success": True, "lesson_id": lesson_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating lesson content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

