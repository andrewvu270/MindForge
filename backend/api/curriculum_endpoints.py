from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import logging

from models import LearningPath
from services.curriculum_service import get_curriculum_service, CurriculumService

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])
logger = logging.getLogger(__name__)

@router.get("/{field_id}", response_model=LearningPath)
async def get_curriculum(
    field_id: str,
    service: CurriculumService = Depends(get_curriculum_service)
):
    """
    Get the learning path (curriculum) for a specific field.
    """
    curriculum = await service.get_curriculum(field_id)
    if not curriculum:
        raise HTTPException(status_code=404, detail=f"Curriculum not found for field {field_id}")
    return curriculum

@router.post("/generate/{field_id}", response_model=LearningPath)
async def generate_curriculum(
    field_id: str,
    num_lessons: int = 5,
    service: CurriculumService = Depends(get_curriculum_service)
):
    """
    Generate a new learning path for a field.
    If one already exists, it returns the existing one.
    """
    curriculum = await service.generate_and_save_curriculum(field_id, num_lessons)
    if not curriculum:
        raise HTTPException(status_code=500, detail="Failed to generate curriculum")
    return curriculum
