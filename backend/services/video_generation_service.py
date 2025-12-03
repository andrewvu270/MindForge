"""
Video Generation Service

This service handles AI-generated educational video creation.
Currently a stub - integrate with video generation APIs like:
- Runway ML (https://runwayml.com)
- HeyGen (https://heygen.com) 
- D-ID (https://d-id.com)
- Pika Labs (https://pika.art)
- Synthesia (https://synthesia.io)

The flow:
1. Take lesson content
2. Generate a script/storyboard
3. Call video generation API
4. Store video URL
5. Return to frontend
"""

import os
import json
import hashlib
import tempfile
from typing import Optional, Dict, Any
from datetime import datetime
from database import db
import logging

logger = logging.getLogger(__name__)


class VideoGenerationService:
    """Service for generating educational videos from lesson content."""
    
    def __init__(self):
        # API keys would be loaded from environment
        self.runway_api_key = os.getenv("RUNWAY_API_KEY")
        self.heygen_api_key = os.getenv("HEYGEN_API_KEY")
        self.did_api_key = os.getenv("DID_API_KEY")
        
        # Supabase Storage bucket name
        self.bucket_name = "lesson-videos"
        
        # Video storage (in production, use S3/CloudFront)
        self.video_cache: Dict[str, Dict[str, Any]] = {}
    
    async def generate_video_for_lesson(
        self,
        lesson_id: str,
        lesson_title: str,
        lesson_content: str,
        field: str,
        duration_seconds: int = 180,  # 3 minutes default
        style: str = "claymorphism"
    ) -> Dict[str, Any]:
        """
        Generate an educational video for a lesson.
        
        Args:
            lesson_id: Unique lesson identifier
            lesson_title: Title of the lesson
            lesson_content: Full lesson text content
            field: Subject field (Technology, Finance, etc.)
            duration_seconds: Target video duration
            style: Visual style (claymorphism, minimalist, etc.)
        
        Returns:
            Dict with video_url, thumbnail_url, duration, status
        """
        # Check cache first
        cache_key = self._get_cache_key(lesson_id, style)
        if cache_key in self.video_cache:
            return self.video_cache[cache_key]
        
        # Generate script from content
        script = await self._generate_script(lesson_content, duration_seconds)
        
        # Generate video (stub - replace with actual API call)
        video_result = await self._call_video_api(
            script=script,
            title=lesson_title,
            field=field,
            style=style,
            duration=duration_seconds
        )
        
        # If video was generated, upload to Supabase Storage
        if video_result.get("video_file_path"):
            video_url = await self._upload_to_supabase(
                lesson_id=lesson_id,
                video_file_path=video_result["video_file_path"]
            )
            video_result["video_url"] = video_url
            
            # Update lesson in database with video URL
            await self._update_lesson_video_url(lesson_id, video_url, duration_seconds)
        
        # Cache result
        self.video_cache[cache_key] = video_result
        
        return video_result
    
    async def _generate_script(
        self,
        content: str,
        duration_seconds: int
    ) -> Dict[str, Any]:
        """
        Convert lesson content into a video script with scenes.
        
        In production, use an LLM to:
        1. Extract key points
        2. Create scene descriptions
        3. Generate narration text
        4. Add visual cues
        """
        # Estimate words per scene (avg speaking rate ~150 words/min)
        words_per_minute = 150
        total_words = (duration_seconds / 60) * words_per_minute
        
        # Split content into scenes
        sentences = content.split('. ')
        words_per_scene = total_words / max(len(sentences) // 3, 1)
        
        scenes = []
        current_scene = {"narration": "", "visual_cue": "", "duration": 0}
        word_count = 0
        
        for sentence in sentences:
            sentence_words = len(sentence.split())
            if word_count + sentence_words > words_per_scene and current_scene["narration"]:
                current_scene["duration"] = (word_count / words_per_minute) * 60
                scenes.append(current_scene)
                current_scene = {"narration": "", "visual_cue": "", "duration": 0}
                word_count = 0
            
            current_scene["narration"] += sentence + ". "
            word_count += sentence_words
        
        if current_scene["narration"]:
            current_scene["duration"] = (word_count / words_per_minute) * 60
            scenes.append(current_scene)
        
        return {
            "scenes": scenes,
            "total_duration": duration_seconds,
            "scene_count": len(scenes)
        }
    
    async def _call_video_api(
        self,
        script: Dict[str, Any],
        title: str,
        field: str,
        style: str,
        duration: int
    ) -> Dict[str, Any]:
        """
        Call the video generation API.
        
        STUB - Replace with actual API integration:
        
        For Runway ML:
            response = requests.post(
                "https://api.runwayml.com/v1/generate",
                headers={"Authorization": f"Bearer {self.runway_api_key}"},
                json={
                    "prompt": script,
                    "duration": duration,
                    "style": style
                }
            )
        
        For HeyGen:
            response = requests.post(
                "https://api.heygen.com/v1/video.generate",
                headers={"X-Api-Key": self.heygen_api_key},
                json={
                    "script": script,
                    "avatar": "professional_presenter",
                    "background": "educational"
                }
            )
        """
        # Return placeholder for now
        return {
            "status": "placeholder",
            "video_url": None,  # Would be actual video URL
            "thumbnail_url": None,
            "duration": duration,
            "title": title,
            "field": field,
            "style": style,
            "script": script,
            "created_at": datetime.utcnow().isoformat(),
            "message": "Video generation not yet implemented. Integrate with Runway/HeyGen/D-ID API."
        }
    
    async def _upload_to_supabase(self, lesson_id: str, video_file_path: str) -> str:
        """
        Upload video file to Supabase Storage bucket.
        
        Args:
            lesson_id: Lesson identifier
            video_file_path: Local path to video file
            
        Returns:
            Public URL of uploaded video
        """
        try:
            # Generate unique filename
            filename = f"{lesson_id}_{datetime.utcnow().timestamp()}.mp4"
            
            # Read video file
            with open(video_file_path, 'rb') as f:
                video_data = f.read()
            
            # Upload to Supabase Storage
            response = db.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=video_data,
                file_options={"content-type": "video/mp4"}
            )
            
            # Get public URL
            public_url = db.client.storage.from_(self.bucket_name).get_public_url(filename)
            
            logger.info(f"Uploaded video for lesson {lesson_id} to Supabase Storage: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload video to Supabase: {e}")
            raise
    
    async def _update_lesson_video_url(self, lesson_id: str, video_url: str, duration_seconds: int):
        """
        Update lesson record with video URL and duration.
        
        Args:
            lesson_id: Lesson identifier
            video_url: Public URL of video
            duration_seconds: Video duration in seconds
        """
        try:
            db.client.table("lessons").update({
                "video_url": video_url,
                "video_duration_seconds": duration_seconds,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", lesson_id).execute()
            
            logger.info(f"Updated lesson {lesson_id} with video URL")
            
        except Exception as e:
            logger.error(f"Failed to update lesson with video URL: {e}")
            raise
    
    def _get_cache_key(self, lesson_id: str, style: str) -> str:
        """Generate cache key for video."""
        return hashlib.md5(f"{lesson_id}:{style}".encode()).hexdigest()
    
    async def get_video_status(self, video_id: str) -> Dict[str, Any]:
        """Check status of video generation job."""
        # In production, poll the video API for job status
        return {
            "video_id": video_id,
            "status": "pending",
            "progress": 0,
            "estimated_completion": None
        }
    
    async def get_video_for_lesson(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Get existing video for a lesson if available."""
        for key, video in self.video_cache.items():
            if lesson_id in key:
                return video
        return None


# Singleton instance
video_service = VideoGenerationService()


# API endpoint handlers
async def generate_lesson_video(lesson_id: str, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
    """API handler for video generation."""
    return await video_service.generate_video_for_lesson(
        lesson_id=lesson_id,
        lesson_title=lesson_data.get("title", ""),
        lesson_content=lesson_data.get("content", ""),
        field=lesson_data.get("field_name", "General"),
        duration_seconds=lesson_data.get("estimated_minutes", 3) * 60
    )


async def get_lesson_video(lesson_id: str) -> Optional[Dict[str, Any]]:
    """
    API handler to get video for lesson.
    Checks database for video_url and returns it.
    """
    try:
        # Query lesson from database
        response = db.client.table("lessons").select("video_url, video_duration_seconds, title").eq("id", lesson_id).execute()
        
        if response.data and response.data[0].get("video_url"):
            lesson = response.data[0]
            return {
                "video_url": lesson["video_url"],
                "duration": lesson.get("video_duration_seconds"),
                "title": lesson.get("title"),
                "status": "ready"
            }
        
        # Fallback to cache
        cached = await video_service.get_video_for_lesson(lesson_id)
        if cached:
            return cached
            
        return None
        
    except Exception as e:
        logger.error(f"Failed to get video for lesson {lesson_id}: {e}")
        return None
