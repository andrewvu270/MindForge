"""
API endpoints for session scheduling
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import uuid
from datetime import datetime, time

from services.scheduling_service import SchedulingService, SessionType
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/schedule", tags=["scheduling"])

# Initialize service
scheduling_service = SchedulingService()


class SchedulePreferencesRequest(BaseModel):
    user_id: str
    preferred_days: List[str]  # ["Monday", "Wednesday", "Friday"]
    preferred_time: str  # "09:00:00"
    sessions_per_week: int = 3
    lesson_frequency: int = 2
    quiz_frequency: int = 2
    reflection_frequency: int = 1
    notifications_enabled: bool = True


class SessionCompletionRequest(BaseModel):
    user_id: str


@router.post("/preferences")
async def set_schedule_preferences(request: SchedulePreferencesRequest):
    """
    Set user's scheduling preferences and generate schedule.
    
    Args:
        request: Schedule preferences
        
    Returns:
        Created schedule
    """
    try:
        logger.info(f"Setting schedule preferences for user {request.user_id}")
        
        client = db.client
        
        # Store preferences
        preferences_data = {
            "user_id": request.user_id,
            "preferred_days": request.preferred_days,
            "preferred_time": request.preferred_time,
            "sessions_per_week": request.sessions_per_week,
            "lesson_frequency": request.lesson_frequency,
            "quiz_frequency": request.quiz_frequency,
            "reflection_frequency": request.reflection_frequency,
            "notifications_enabled": request.notifications_enabled,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Upsert preferences (insert or update)
        try:
            client.table("schedule_preferences").upsert(preferences_data).execute()
        except:
            # If upsert not supported, try insert
            client.table("schedule_preferences").insert(preferences_data).execute()
        
        # Generate schedule for next 4 weeks
        schedule = scheduling_service.create_user_schedule(
            user_id=request.user_id,
            preferences=request.dict(),
            weeks=4
        )
        
        # Store scheduled sessions
        for session in schedule:
            session_data = {
                "id": str(uuid.uuid4()),
                **session,
                "created_at": datetime.now().isoformat()
            }
            # Convert datetime to ISO string for database
            if isinstance(session_data.get("scheduled_time"), datetime):
                session_data["scheduled_time"] = session_data["scheduled_time"].isoformat()
            
            client.table("scheduled_sessions").insert(session_data).execute()
        
        logger.info(f"Created {len(schedule)} scheduled sessions for user {request.user_id}")
        
        return {
            "message": "Schedule created successfully",
            "sessions_created": len(schedule),
            "schedule": schedule[:7]  # Return first week
        }
        
    except Exception as e:
        logger.error(f"Failed to set schedule preferences: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to set preferences: {str(e)}"
        )


@router.get("/upcoming/{user_id}")
async def get_upcoming_sessions(
    user_id: str,
    days: int = 7
):
    """
    Get upcoming scheduled sessions for a user.
    
    Args:
        user_id: User ID
        days: Number of days to look ahead
        
    Returns:
        List of upcoming sessions
    """
    try:
        client = db.client
        
        # Get all sessions for user
        response = client.table("scheduled_sessions").select("*").eq(
            "user_id", user_id
        ).eq("completed", False).execute()
        
        all_sessions = response.data if response.data else []
        
        # Filter upcoming sessions
        upcoming = scheduling_service.get_upcoming_sessions(
            user_id=user_id,
            all_sessions=all_sessions,
            days=days
        )
        
        return {
            "sessions": upcoming,
            "count": len(upcoming)
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch upcoming sessions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch sessions: {str(e)}"
        )


@router.get("/next/{user_id}")
async def get_next_session(user_id: str):
    """
    Get the next scheduled session for a user.
    
    Args:
        user_id: User ID
        
    Returns:
        Next session or null
    """
    try:
        client = db.client
        
        # Get all incomplete sessions
        response = client.table("scheduled_sessions").select("*").eq(
            "user_id", user_id
        ).eq("completed", False).order("scheduled_time").execute()
        
        all_sessions = response.data if response.data else []
        
        # Get next session
        next_session = scheduling_service.scheduler.get_next_session(
            user_id=user_id,
            all_sessions=all_sessions
        )
        
        return {
            "next_session": next_session
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch next session: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch session: {str(e)}"
        )


@router.post("/complete/{session_id}")
async def complete_session(
    session_id: str,
    request: SessionCompletionRequest
):
    """
    Mark a session as completed.
    
    Args:
        session_id: Session ID
        request: Completion request with user_id
        
    Returns:
        Completion status and next session
    """
    try:
        client = db.client
        
        # Mark session as complete
        update_data = {
            "completed": True,
            "completed_at": datetime.now().isoformat()
        }
        
        client.table("scheduled_sessions").update(update_data).eq("id", session_id).execute()
        
        # Get all sessions for next session lookup
        response = client.table("scheduled_sessions").select("*").eq(
            "user_id", request.user_id
        ).execute()
        
        all_sessions = response.data if response.data else []
        
        # Get next session
        result = scheduling_service.complete_session(
            session_id=session_id,
            all_sessions=all_sessions
        )
        
        logger.info(f"Completed session {session_id} for user {request.user_id}")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to complete session: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete session: {str(e)}"
        )


@router.get("/preferences/{user_id}")
async def get_schedule_preferences(user_id: str):
    """
    Get user's scheduling preferences.
    
    Args:
        user_id: User ID
        
    Returns:
        Schedule preferences
    """
    try:
        client = db.client
        response = client.table("schedule_preferences").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if not response.data:
            return {
                "message": "No preferences set",
                "preferences": None
            }
        
        return {
            "preferences": response.data[0]
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch preferences: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch preferences: {str(e)}"
        )


@router.delete("/preferences/{user_id}")
async def delete_schedule_preferences(user_id: str):
    """
    Delete user's scheduling preferences and all scheduled sessions.
    
    Args:
        user_id: User ID
        
    Returns:
        Deletion status
    """
    try:
        client = db.client
        
        # Delete preferences
        client.table("schedule_preferences").delete().eq("user_id", user_id).execute()
        
        # Delete all incomplete sessions
        client.table("scheduled_sessions").delete().eq(
            "user_id", user_id
        ).eq("completed", False).execute()
        
        logger.info(f"Deleted schedule for user {user_id}")
        
        return {
            "message": "Schedule deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to delete schedule: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete schedule: {str(e)}"
        )
