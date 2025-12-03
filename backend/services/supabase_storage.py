"""
Supabase Storage Service
Handles video and image uploads to Supabase Storage
"""
import os
import logging
import re
from typing import Optional
from supabase import create_client, Client
import base64
from datetime import datetime

logger = logging.getLogger(__name__)


class SupabaseStorageService:
    """Service for uploading files to Supabase Storage"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        # Priority: SERVICE_ROLE_KEY > SUPABASE_KEY > SUPABASE_ANON_KEY
        # Service role key bypasses RLS and is required for storage uploads
        self.supabase_key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY") or 
            os.getenv("SUPABASE_KEY") or 
            os.getenv("SUPABASE_ANON_KEY")
        )
        self.bucket_name = os.getenv("SUPABASE_BUCKET", "lesson-videos")
        
        if not self.supabase_url or not self.supabase_key:
            logger.warning("Supabase credentials not configured")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.supabase_url, self.supabase_key)
                logger.info(f"✅ Supabase Storage connected (bucket: {self.bucket_name})")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {e}")
                self.client = None
    
    def is_configured(self) -> bool:
        """Check if Supabase is properly configured."""
        return self.client is not None
    
    async def upload_video(
        self,
        video_data: bytes,
        lesson_id: str,
        file_extension: str = "mp4"
    ) -> Optional[str]:
        """
        Upload video to Supabase Storage.
        
        Args:
            video_data: Video file as bytes
            lesson_id: Lesson identifier
            file_extension: File extension (default: mp4)
            
        Returns:
            Public URL of uploaded video or None if failed
        """
        if not self.is_configured():
            logger.error("Supabase not configured")
            return None
        
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"lessons/{lesson_id}_{timestamp}.{file_extension}"
            
            # Upload to Supabase Storage
            logger.info(f"Uploading video to Supabase: {filename}")
            
            response = self.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=video_data,
                file_options={
                    "content-type": f"video/{file_extension}",
                    "cache-control": "3600",
                    "upsert": "true"  # Overwrite if exists
                }
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(filename)
            
            logger.info(f"✅ Video uploaded successfully: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload video to Supabase: {e}")
            return None
    
    async def upload_video_base64(
        self,
        video_base64: str,
        lesson_id: str,
        file_extension: str = "mp4"
    ) -> Optional[str]:
        """
        Upload base64 encoded video to Supabase Storage.
        
        Args:
            video_base64: Base64 encoded video
            lesson_id: Lesson identifier
            file_extension: File extension
            
        Returns:
            Public URL of uploaded video or None if failed
        """
        try:
            # Clean base64 string thoroughly
            # Remove all whitespace, newlines, and non-base64 characters
            video_base64_clean = ''.join(video_base64.split())
            
            # Remove any non-base64 characters (keep only A-Z, a-z, 0-9, +, /, =)
            video_base64_clean = re.sub(r'[^A-Za-z0-9+/=]', '', video_base64_clean)
            
            # Fix padding - base64 strings must be multiple of 4
            missing_padding = len(video_base64_clean) % 4
            if missing_padding:
                video_base64_clean += '=' * (4 - missing_padding)
                logger.info(f"Added {4 - missing_padding} padding characters to base64 string")
            
            logger.info(f"Cleaned base64 string: {len(video_base64_clean)} chars (original: {len(video_base64)})")
            
            # Decode base64 to bytes
            video_bytes = base64.b64decode(video_base64_clean)
            logger.info(f"Decoded video: {len(video_bytes)} bytes ({len(video_bytes) / 1024 / 1024:.2f} MB)")
            
            # Upload
            return await self.upload_video(video_bytes, lesson_id, file_extension)
            
        except Exception as e:
            logger.error(f"Failed to decode and upload video: {e}")
            logger.error(f"Base64 string length: {len(video_base64)}, cleaned: {len(video_base64_clean) if 'video_base64_clean' in locals() else 'N/A'}")
            return None
    
    async def upload_image(
        self,
        image_data: bytes,
        lesson_id: str,
        image_index: int = 0,
        file_extension: str = "png"
    ) -> Optional[str]:
        """
        Upload image to Supabase Storage.
        
        Args:
            image_data: Image file as bytes
            lesson_id: Lesson identifier
            image_index: Index of image in lesson
            file_extension: File extension
            
        Returns:
            Public URL of uploaded image or None if failed
        """
        if not self.is_configured():
            logger.error("Supabase not configured")
            return None
        
        try:
            # Generate filename
            filename = f"images/{lesson_id}_slide_{image_index}.{file_extension}"
            
            # Upload
            response = self.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=image_data,
                file_options={
                    "content-type": f"image/{file_extension}",
                    "cache-control": "3600",
                    "upsert": "true"
                }
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(filename)
            
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload image: {e}")
            return None
    
    async def delete_video(self, lesson_id: str) -> bool:
        """
        Delete video from Supabase Storage.
        
        Args:
            lesson_id: Lesson identifier
            
        Returns:
            True if deleted successfully
        """
        if not self.is_configured():
            return False
        
        try:
            # List all files for this lesson
            files = self.client.storage.from_(self.bucket_name).list(f"lessons/")
            
            # Find and delete files matching lesson_id
            deleted = False
            for file in files:
                if lesson_id in file['name']:
                    self.client.storage.from_(self.bucket_name).remove([f"lessons/{file['name']}"])
                    deleted = True
            
            return deleted
            
        except Exception as e:
            logger.error(f"Failed to delete video: {e}")
            return False
    
    def get_storage_info(self) -> dict:
        """Get storage bucket information."""
        if not self.is_configured():
            return {"configured": False}
        
        try:
            # Get bucket info
            return {
                "configured": True,
                "bucket": self.bucket_name,
                "url": self.supabase_url
            }
        except Exception as e:
            logger.error(f"Failed to get storage info: {e}")
            return {"configured": False, "error": str(e)}


# Singleton instance
_storage_service = None

def get_supabase_storage() -> SupabaseStorageService:
    """Get or create the Supabase storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = SupabaseStorageService()
    return _storage_service

