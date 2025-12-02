"""
API endpoints for daily reflections
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import uuid
from datetime import datetime, date
import random

from services.llm_service import LLMService
from agents.reflection_analysis_agent import ReflectionAnalysisAgent
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reflections", tags=["reflections"])

# Initialize services
llm_service = LLMService()
reflection_agent = ReflectionAnalysisAgent(llm_service)


class ReflectionSubmissionRequest(BaseModel):
    user_id: str
    prompt_id: str
    response: str


class ReflectionResponse(BaseModel):
    id: str
    user_id: str
    prompt: str
    response: str
    ai_feedback: Optional[str] = None
    quality_score: Optional[float] = None
    insights: Optional[List[str]] = None
    suggestion: Optional[str] = None
    submitted_at: datetime


@router.get("/daily")
async def get_daily_reflection_prompt():
    """
    Get today's reflection prompt.
    
    Returns:
        Daily reflection prompt
    """
    try:
        client = db.get_client()
        
        # Get all prompts
        response = client.table("reflection_prompts").select("*").execute()
        
        if not response.data:
            # Fallback prompts if database is empty
            fallback_prompts = [
                {
                    "id": "prompt_1",
                    "prompt": "Describe a recent situation where you successfully influenced someone's decision. What techniques did you use?",
                    "category": "influence",
                    "difficulty": "beginner"
                },
                {
                    "id": "prompt_2",
                    "prompt": "Reflect on a time when your attempt to persuade someone failed. What could you have done differently?",
                    "category": "influence",
                    "difficulty": "intermediate"
                },
                {
                    "id": "prompt_3",
                    "prompt": "How do you adapt your communication style when speaking to different audiences? Provide specific examples.",
                    "category": "influence",
                    "difficulty": "intermediate"
                }
            ]
            prompts = fallback_prompts
        else:
            prompts = response.data
        
        # Select a prompt based on day of year (consistent for the day)
        day_of_year = date.today().timetuple().tm_yday
        prompt_index = day_of_year % len(prompts)
        daily_prompt = prompts[prompt_index]
        
        return {
            "prompt_id": daily_prompt.get("id"),
            "prompt": daily_prompt.get("prompt"),
            "category": daily_prompt.get("category", "influence"),
            "difficulty": daily_prompt.get("difficulty", "beginner"),
            "date": date.today().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch daily prompt: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch prompt: {str(e)}"
        )


@router.post("", response_model=ReflectionResponse)
async def submit_reflection(request: ReflectionSubmissionRequest):
    """
    Submit a reflection and get AI feedback.
    
    Args:
        request: Reflection submission
        
    Returns:
        Reflection with AI feedback
    """
    try:
        logger.info(f"Processing reflection for user {request.user_id}")
        
        # Get user's previous reflections for context
        client = db.get_client()
        history_response = client.table("reflections").select("*").eq(
            "user_id", request.user_id
        ).order("submitted_at", desc=True).limit(3).execute()
        
        user_history = history_response.data if history_response.data else []
        
        # Get the prompt text
        prompt_response = client.table("reflection_prompts").select("*").eq(
            "id", request.prompt_id
        ).execute()
        
        prompt_text = prompt_response.data[0]["prompt"] if prompt_response.data else "Daily reflection"
        
        # Analyze reflection using AI agent
        analysis_response = await reflection_agent.execute({
            "reflection_text": request.response,
            "user_history": user_history
        })
        
        if analysis_response.status != "completed":
            raise HTTPException(
                status_code=500,
                detail=f"Reflection analysis failed: {analysis_response.error}"
            )
        
        analysis = analysis_response.result
        
        # Store reflection in database
        reflection_id = str(uuid.uuid4())
        reflection_data = {
            "id": reflection_id,
            "user_id": request.user_id,
            "prompt": prompt_text,
            "response": request.response,
            "ai_feedback": analysis.get("feedback"),
            "quality_score": analysis.get("quality_score"),
            "insights": analysis.get("insights", []),
            "suggestion": analysis.get("suggestion"),
            "submitted_at": datetime.now().isoformat()
        }
        
        client.table("reflections").insert(reflection_data).execute()
        logger.info(f"Stored reflection {reflection_id} with quality score {analysis.get('quality_score')}")
        
        return ReflectionResponse(
            id=reflection_id,
            user_id=request.user_id,
            prompt=prompt_text,
            response=request.response,
            ai_feedback=analysis.get("feedback"),
            quality_score=analysis.get("quality_score"),
            insights=analysis.get("insights"),
            suggestion=analysis.get("suggestion"),
            submitted_at=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reflection submission failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Reflection submission failed: {str(e)}"
        )


@router.get("/history/{user_id}")
async def get_reflection_history(
    user_id: str,
    limit: int = 10,
    offset: int = 0
):
    """
    Get user's reflection history.
    
    Args:
        user_id: User ID
        limit: Maximum number of reflections to return
        offset: Pagination offset
        
    Returns:
        List of past reflections
    """
    try:
        client = db.get_client()
        response = client.table("reflections").select("*").eq(
            "user_id", user_id
        ).order("submitted_at", desc=True).range(offset, offset + limit - 1).execute()
        
        reflections = response.data if response.data else []
        
        # Calculate quality score trend
        if len(reflections) >= 2:
            recent_scores = [r.get("quality_score", 0) for r in reflections[:5] if r.get("quality_score")]
            avg_recent = sum(recent_scores) / len(recent_scores) if recent_scores else 0
            
            older_scores = [r.get("quality_score", 0) for r in reflections[5:10] if r.get("quality_score")]
            avg_older = sum(older_scores) / len(older_scores) if older_scores else 0
            
            trend = "improving" if avg_recent > avg_older else "stable" if avg_recent == avg_older else "declining"
        else:
            trend = "insufficient_data"
        
        return {
            "reflections": reflections,
            "count": len(reflections),
            "quality_trend": trend,
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch reflection history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/stats/{user_id}")
async def get_reflection_stats(user_id: str):
    """
    Get reflection statistics for a user.
    
    Args:
        user_id: User ID
        
    Returns:
        Reflection statistics
    """
    try:
        client = db.get_client()
        response = client.table("reflections").select("*").eq("user_id", user_id).execute()
        
        reflections = response.data if response.data else []
        
        if not reflections:
            return {
                "total_reflections": 0,
                "average_quality_score": 0,
                "highest_quality_score": 0,
                "recent_trend": "no_data"
            }
        
        quality_scores = [r.get("quality_score", 0) for r in reflections if r.get("quality_score")]
        
        return {
            "total_reflections": len(reflections),
            "average_quality_score": sum(quality_scores) / len(quality_scores) if quality_scores else 0,
            "highest_quality_score": max(quality_scores) if quality_scores else 0,
            "lowest_quality_score": min(quality_scores) if quality_scores else 0,
            "recent_trend": "improving"  # Simplified - could calculate actual trend
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch reflection stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stats: {str(e)}"
        )
