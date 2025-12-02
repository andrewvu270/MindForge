"""
Scheduling Service
Handles automatic scheduling of learning sessions
"""
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta, time
from enum import Enum

logger = logging.getLogger(__name__)


class SessionType(str, Enum):
    """Types of scheduled sessions"""
    LESSON = "lesson"
    QUIZ = "quiz"
    REFLECTION = "reflection"


class DayOfWeek(str, Enum):
    """Days of the week"""
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


class SessionScheduler:
    """Creates and manages scheduled learning sessions"""
    
    @staticmethod
    def create_schedule(
        user_id: str,
        preferences: Dict,
        start_date: Optional[datetime] = None,
        weeks: int = 4
    ) -> List[Dict]:
        """
        Generate a schedule based on user preferences.
        
        Args:
            user_id: User ID
            preferences: Dict with scheduling preferences
            start_date: Start date for schedule (defaults to tomorrow)
            weeks: Number of weeks to schedule
            
        Returns:
            List of scheduled session dicts
        """
        if not start_date:
            start_date = datetime.now() + timedelta(days=1)
        
        # Extract preferences
        preferred_days = preferences.get("preferred_days", ["Monday", "Wednesday", "Friday"])
        preferred_time_str = preferences.get("preferred_time", "09:00:00")
        lesson_frequency = preferences.get("lesson_frequency", 2)
        quiz_frequency = preferences.get("quiz_frequency", 2)
        reflection_frequency = preferences.get("reflection_frequency", 1)
        
        # Parse preferred time
        try:
            hour, minute, second = map(int, preferred_time_str.split(":"))
            preferred_time = time(hour, minute, second)
        except:
            preferred_time = time(9, 0, 0)  # Default to 9 AM
        
        # Calculate total sessions per week
        total_sessions = lesson_frequency + quiz_frequency + reflection_frequency
        
        # Create session pattern
        session_pattern = (
            [SessionType.LESSON] * lesson_frequency +
            [SessionType.QUIZ] * quiz_frequency +
            [SessionType.REFLECTION] * reflection_frequency
        )
        
        # Generate schedule
        scheduled_sessions = []
        current_date = start_date.date()
        session_index = 0
        
        for week in range(weeks):
            sessions_this_week = 0
            day_offset = 0
            
            while sessions_this_week < total_sessions and day_offset < 7:
                check_date = current_date + timedelta(days=day_offset)
                day_name = check_date.strftime("%A")
                
                # Check if this day is preferred
                if day_name in preferred_days and sessions_this_week < len(session_pattern):
                    session_type = session_pattern[session_index % len(session_pattern)]
                    
                    scheduled_time = datetime.combine(check_date, preferred_time)
                    
                    scheduled_sessions.append({
                        "user_id": user_id,
                        "session_type": session_type.value,
                        "scheduled_time": scheduled_time,
                        "completed": False,
                        "content_id": None  # Will be assigned later
                    })
                    
                    session_index += 1
                    sessions_this_week += 1
                
                day_offset += 1
            
            # Move to next week
            current_date += timedelta(weeks=1)
        
        return scheduled_sessions
    
    @staticmethod
    def get_upcoming_sessions(
        user_id: str,
        all_sessions: List[Dict],
        days: int = 7
    ) -> List[Dict]:
        """
        Get upcoming sessions for a user.
        
        Args:
            user_id: User ID
            all_sessions: All scheduled sessions
            days: Number of days to look ahead
            
        Returns:
            List of upcoming sessions
        """
        now = datetime.now()
        cutoff = now + timedelta(days=days)
        
        upcoming = [
            session for session in all_sessions
            if session["user_id"] == user_id
            and not session["completed"]
            and now <= session["scheduled_time"] <= cutoff
        ]
        
        # Sort by scheduled time
        upcoming.sort(key=lambda s: s["scheduled_time"])
        
        return upcoming
    
    @staticmethod
    def get_next_session(
        user_id: str,
        all_sessions: List[Dict]
    ) -> Optional[Dict]:
        """
        Get the next scheduled session for a user.
        
        Args:
            user_id: User ID
            all_sessions: All scheduled sessions
            
        Returns:
            Next session or None
        """
        upcoming = SessionScheduler.get_upcoming_sessions(
            user_id=user_id,
            all_sessions=all_sessions,
            days=30
        )
        
        return upcoming[0] if upcoming else None
    
    @staticmethod
    def mark_session_complete(
        session_id: str,
        all_sessions: List[Dict]
    ) -> bool:
        """
        Mark a session as completed.
        
        Args:
            session_id: Session ID
            all_sessions: All scheduled sessions
            
        Returns:
            True if session was found and marked complete
        """
        for session in all_sessions:
            if session.get("id") == session_id:
                session["completed"] = True
                session["completed_at"] = datetime.now()
                return True
        
        return False
    
    @staticmethod
    def is_session_available(session: Dict) -> bool:
        """
        Check if a session is available to start.
        
        Args:
            session: Session dict
            
        Returns:
            True if session can be started now
        """
        now = datetime.now()
        scheduled_time = session["scheduled_time"]
        
        # Session is available if:
        # 1. Not completed
        # 2. Scheduled time has passed
        # 3. Not more than 24 hours overdue
        return (
            not session["completed"]
            and scheduled_time <= now
            and now <= scheduled_time + timedelta(hours=24)
        )
    
    @staticmethod
    def reschedule_session(
        session_id: str,
        new_time: datetime,
        all_sessions: List[Dict]
    ) -> bool:
        """
        Reschedule a session to a new time.
        
        Args:
            session_id: Session ID
            new_time: New scheduled time
            all_sessions: All scheduled sessions
            
        Returns:
            True if session was rescheduled
        """
        for session in all_sessions:
            if session.get("id") == session_id and not session["completed"]:
                session["scheduled_time"] = new_time
                return True
        
        return False


class NotificationManager:
    """Manages notifications for scheduled sessions"""
    
    @staticmethod
    def should_send_reminder(
        session: Dict,
        reminder_minutes_before: int = 30
    ) -> bool:
        """
        Check if a reminder should be sent for a session.
        
        Args:
            session: Session dict
            reminder_minutes_before: Minutes before session to send reminder
            
        Returns:
            True if reminder should be sent
        """
        now = datetime.now()
        scheduled_time = session["scheduled_time"]
        reminder_time = scheduled_time - timedelta(minutes=reminder_minutes_before)
        
        # Send reminder if:
        # 1. Not completed
        # 2. Current time is past reminder time
        # 3. Current time is before scheduled time
        return (
            not session["completed"]
            and now >= reminder_time
            and now < scheduled_time
        )
    
    @staticmethod
    def get_reminder_message(session: Dict) -> str:
        """
        Generate reminder message for a session.
        
        Args:
            session: Session dict
            
        Returns:
            Reminder message
        """
        session_type = session["session_type"]
        scheduled_time = session["scheduled_time"]
        
        time_str = scheduled_time.strftime("%I:%M %p")
        
        messages = {
            SessionType.LESSON.value: f"📚 Your lesson is scheduled for {time_str}. Ready to learn?",
            SessionType.QUIZ.value: f"📝 Quiz time at {time_str}! Test your knowledge.",
            SessionType.REFLECTION.value: f"🧘 Reflection session at {time_str}. Time to grow!"
        }
        
        return messages.get(session_type, f"Session scheduled for {time_str}")
    
    @staticmethod
    def send_notification(
        user_id: str,
        message: str,
        notification_type: str = "reminder"
    ) -> bool:
        """
        Send a notification to a user.
        
        Args:
            user_id: User ID
            message: Notification message
            notification_type: Type of notification
            
        Returns:
            True if notification was sent successfully
        """
        # TODO: Implement actual notification sending
        # This could use push notifications, email, SMS, etc.
        logger.info(f"Notification to {user_id}: {message}")
        return True


class SchedulingService:
    """Main scheduling service coordinating all components"""
    
    def __init__(self):
        self.scheduler = SessionScheduler()
        self.notification_manager = NotificationManager()
    
    def create_user_schedule(
        self,
        user_id: str,
        preferences: Dict,
        weeks: int = 4
    ) -> List[Dict]:
        """
        Create a complete schedule for a user.
        
        Args:
            user_id: User ID
            preferences: Scheduling preferences
            weeks: Number of weeks to schedule
            
        Returns:
            List of scheduled sessions
        """
        return self.scheduler.create_schedule(
            user_id=user_id,
            preferences=preferences,
            weeks=weeks
        )
    
    def get_upcoming_sessions(
        self,
        user_id: str,
        all_sessions: List[Dict],
        days: int = 7
    ) -> List[Dict]:
        """Get upcoming sessions for a user"""
        return self.scheduler.get_upcoming_sessions(
            user_id=user_id,
            all_sessions=all_sessions,
            days=days
        )
    
    def complete_session(
        self,
        session_id: str,
        all_sessions: List[Dict]
    ) -> Dict:
        """
        Mark a session as complete and trigger next scheduling.
        
        Args:
            session_id: Session ID
            all_sessions: All scheduled sessions
            
        Returns:
            Dict with completion status and next session info
        """
        success = self.scheduler.mark_session_complete(session_id, all_sessions)
        
        if success:
            # Find the completed session
            completed_session = next(
                (s for s in all_sessions if s.get("id") == session_id),
                None
            )
            
            if completed_session:
                # Get next session
                next_session = self.scheduler.get_next_session(
                    user_id=completed_session["user_id"],
                    all_sessions=all_sessions
                )
                
                return {
                    "success": True,
                    "completed_session": completed_session,
                    "next_session": next_session
                }
        
        return {"success": False, "error": "Session not found"}
    
    def send_reminders(
        self,
        all_sessions: List[Dict],
        reminder_minutes: int = 30
    ) -> int:
        """
        Send reminders for upcoming sessions.
        
        Args:
            all_sessions: All scheduled sessions
            reminder_minutes: Minutes before session to send reminder
            
        Returns:
            Number of reminders sent
        """
        reminders_sent = 0
        
        for session in all_sessions:
            if self.notification_manager.should_send_reminder(session, reminder_minutes):
                message = self.notification_manager.get_reminder_message(session)
                success = self.notification_manager.send_notification(
                    user_id=session["user_id"],
                    message=message
                )
                if success:
                    reminders_sent += 1
        
        return reminders_sent
