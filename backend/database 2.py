import os
from supabase import create_client, Client
from typing import List, Dict, Optional, Any
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    # Categories (Fields)
    async def get_categories(self) -> List[Dict[str, Any]]:
        response = self.client.table("categories").select("*").execute()
        return response.data if response.data else []
    
    async def get_category_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("categories").select("*").eq("slug", slug).execute()
        return response.data[0] if response.data else None
    
    # Lessons
    async def get_lessons(self, category_id: Optional[str] = None, difficulty: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        query = self.client.table("lessons").select("*, categories(*)").eq("is_published", True)
        
        if category_id:
            query = query.eq("category_id", category_id)
        if difficulty:
            query = query.eq("difficulty", difficulty)
            
        response = query.limit(limit).execute()
        return response.data if response.data else []
    
    async def get_lesson_by_id(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("lessons").select("*, categories(*)").eq("id", lesson_id).execute()
        return response.data[0] if response.data else None
    
    async def create_lesson(self, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("lessons").insert(lesson_data).execute()
        return response.data[0] if response.data else None
    
    # Quizzes
    async def get_quiz_by_lesson_id(self, lesson_id: str) -> List[Dict[str, Any]]:
        response = self.client.table("quizzes").select("*").eq("lesson_id", lesson_id).execute()
        return response.data if response.data else []
    
    async def submit_quiz_answer(self, user_id: str, quiz_id: str, selected_answer: int) -> Dict[str, Any]:
        # Get the quiz to check correct answer
        quiz_response = self.client.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not quiz_response.data:
            raise ValueError("Quiz not found")
        
        quiz = quiz_response.data[0]
        is_correct = selected_answer == quiz["correct_answer"]
        points_earned = quiz["points"] if is_correct else 0
        
        # Record the attempt
        attempt_data = {
            "user_id": user_id,
            "quiz_id": quiz_id,
            "selected_answer": selected_answer,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "attempted_at": datetime.now().isoformat()
        }
        
        response = self.client.table("quiz_attempts").insert(attempt_data).execute()
        return {
            "attempt": response.data[0] if response.data else None,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "explanation": quiz["explanation"]
        }
    
    # User Progress
    async def get_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.client.table("user_progress").select("*, lessons(*)").eq("user_id", user_id).execute()
        return response.data if response.data else []
    
    async def mark_lesson_completed(self, user_id: str, lesson_id: str, points_earned: int) -> Dict[str, Any]:
        progress_data = {
            "user_id": user_id,
            "lesson_id": lesson_id,
            "points_earned": points_earned,
            "completed_at": datetime.now().isoformat()
        }
        
        # Use upsert to handle both new and existing records
        response = self.client.table("user_progress").upsert(progress_data).execute()
        return response.data[0] if response.data else None
    
    # Users
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    
    async def update_user_points(self, user_id: str, points_to_add: int) -> Dict[str, Any]:
        # Get current user data
        user_response = self.client.table("users").select("*").eq("id", user_id).execute()
        if not user_response.data:
            raise ValueError("User not found")
        
        user = user_response.data[0]
        new_total_points = user["total_points"] + points_to_add
        
        # Update user points
        response = self.client.table("users").update({"total_points": new_total_points}).eq("id", user_id).execute()
        return response.data[0] if response.data else None
    
    # Achievements
    async def get_achievements(self) -> List[Dict[str, Any]]:
        response = self.client.table("achievements").select("*").execute()
        return response.data if response.data else []
    
    async def get_user_achievements(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.client.table("user_achievements").select("*, achievements(*)").eq("user_id", user_id).execute()
        return response.data if response.data else []
    
    async def award_achievement(self, user_id: str, achievement_id: str) -> Dict[str, Any]:
        achievement_data = {
            "user_id": user_id,
            "achievement_id": achievement_id,
            "earned_at": datetime.now().isoformat()
        }
        
        response = self.client.table("user_achievements").insert(achievement_data).execute()
        return response.data[0] if response.data else None
    
    # Leaderboard
    async def get_leaderboard(self, limit: int = 50) -> List[Dict[str, Any]]:
        response = self.client.table("users").select("*").order("total_points", desc=True).limit(limit).execute()
        return response.data if response.data else []

# Global database instance
db = DatabaseService()
