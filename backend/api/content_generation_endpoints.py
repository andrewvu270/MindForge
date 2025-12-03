"""
API endpoints for content generation management
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging

from services.auto_content_generator import get_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content-generation"])


class GenerationRequest(BaseModel):
    field_id: Optional[str] = None
    count: int = 1


class GenerationResponse(BaseModel):
    status: str
    message: str
    lessons_generated: int


@router.post("/generate", response_model=GenerationResponse)
async def trigger_generation(
    request: GenerationRequest,
    background_tasks: BackgroundTasks
):
    """
    Manually trigger content generation.
    Can generate for all fields or a specific field.
    
    Args:
        request: Generation parameters
        background_tasks: FastAPI background tasks
        
    Returns:
        Generation status
    """
    try:
        generator = get_generator()
        
        if request.field_id:
            # Generate for specific field
            lessons = await generator.generate_lessons_for_field(
                field_id=request.field_id,
                count=request.count
            )
            
            return GenerationResponse(
                status="success",
                message=f"Generated {len(lessons)} lessons for {request.field_id}",
                lessons_generated=len(lessons)
            )
        else:
            # Generate for all fields
            lessons = await generator.generate_daily_content()
            
            return GenerationResponse(
                status="success",
                message=f"Generated {len(lessons)} lessons across all fields",
                lessons_generated=len(lessons)
            )
            
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}"
        )


@router.post("/cleanup")
async def cleanup_old_content(days_old: int = 30):
    """
    Remove auto-generated lessons older than specified days.
    
    Args:
        days_old: Remove lessons older than this many days
        
    Returns:
        Cleanup status
    """
    try:
        generator = get_generator()
        await generator.cleanup_old_lessons(days_old=days_old)
        
        return {
            "status": "success",
            "message": f"Cleaned up lessons older than {days_old} days"
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Cleanup failed: {str(e)}"
        )


@router.get("/stats")
async def get_generation_stats():
    """
    Get statistics about auto-generated content.
    
    Returns:
        Content generation statistics
    """
    try:
        from database import db
        
        client = db.client
        
        # Count auto-generated lessons
        response = client.table('lessons').select('*', count='exact').match({
            'is_auto_generated': True
        }).execute()
        
        auto_generated_count = response.count if hasattr(response, 'count') else len(response.data)
        
        # Count by field
        field_counts = {}
        for field_id in ['tech', 'finance', 'economics', 'culture', 'influence', 'global']:
            field_response = client.table('lessons').select('*', count='exact').match({
                'is_auto_generated': True,
                'field_id': field_id
            }).execute()
            field_counts[field_id] = field_response.count if hasattr(field_response, 'count') else len(field_response.data)
        
        return {
            "total_auto_generated": auto_generated_count,
            "by_field": field_counts,
            "daily_targets": {
                "tech": 2,
                "finance": 2,
                "economics": 1,
                "culture": 1,
                "influence": 1,
                "global": 1
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get stats: {str(e)}"
        )
