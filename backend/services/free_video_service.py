"""
Free Video Generation Service
Creates videos from images and audio using FFmpeg
"""
import os
import tempfile
import subprocess
import base64
import logging
from typing import List, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class FreeVideoService:
    """Free video generation using FFmpeg"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        
        # Check if FFmpeg is available
        try:
            subprocess.run(['ffmpeg', '-version'], 
                         capture_output=True, check=True)
            self.ffmpeg_available = True
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.warning("FFmpeg not found")
            self.ffmpeg_available = False
    
    def _clean_base64(self, b64_string: str) -> str:
        """Clean and fix base64 string padding. Handles data URLs."""
        import re
        
        # Handle data URLs (e.g., "data:image/png;base64,XXXXX")
        if b64_string.startswith('data:'):
            # Extract just the base64 part after the comma
            parts = b64_string.split(',', 1)
            if len(parts) == 2:
                b64_string = parts[1]
        
        # Remove whitespace
        cleaned = ''.join(b64_string.split())
        # Remove non-base64 characters
        cleaned = re.sub(r'[^A-Za-z0-9+/=]', '', cleaned)
        # Fix padding
        missing_padding = len(cleaned) % 4
        if missing_padding:
            cleaned += '=' * (4 - missing_padding)
        return cleaned
    
    async def create_slideshow_video(
        self,
        images: List[str],
        audio_clips: List[str],
        lesson_title: str,
        duration_per_slide: float = 5.0
    ) -> Optional[str]:
        """Create slideshow video from images and audio."""
        if not self.ffmpeg_available:
            logger.error("FFmpeg not available")
            return None
        
        try:
            # Create temporary directory
            video_id = f"lesson_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            work_dir = os.path.join(self.temp_dir, video_id)
            os.makedirs(work_dir, exist_ok=True)
            
            # Save images
            image_files = []
            for i, img_b64 in enumerate(images):
                try:
                    img_path = os.path.join(work_dir, f"slide_{i:02d}.png")
                    with open(img_path, 'wb') as f:
                        cleaned_b64 = self._clean_base64(img_b64)
                        logger.debug(f"Image {i}: original={len(img_b64)}, cleaned={len(cleaned_b64)}")
                        f.write(base64.b64decode(cleaned_b64))
                    image_files.append(img_path)
                except Exception as e:
                    logger.error(f"Failed to decode image {i}: {e} (length: {len(img_b64)})")
                    raise
            
            # Save audio clips
            audio_files = []
            for i, audio_b64 in enumerate(audio_clips):
                try:
                    audio_path = os.path.join(work_dir, f"audio_{i:02d}.wav")
                    with open(audio_path, 'wb') as f:
                        cleaned_b64 = self._clean_base64(audio_b64)
                        logger.debug(f"Audio {i}: original={len(audio_b64)}, cleaned={len(cleaned_b64)}")
                        f.write(base64.b64decode(cleaned_b64))
                    audio_files.append(audio_path)
                except Exception as e:
                    logger.error(f"Failed to decode audio {i}: {e} (length: {len(audio_b64)})")
                    raise
            
            # Create video
            output_path = os.path.join(work_dir, "lesson_video.mp4")
            
            if len(audio_files) > 0:
                success = await self._create_video_with_audio(
                    image_files, audio_files, output_path, duration_per_slide
                )
            else:
                success = await self._create_silent_video(
                    image_files, output_path, duration_per_slide
                )
            
            if success and os.path.exists(output_path):
                with open(output_path, 'rb') as f:
                    video_bytes = f.read()
                
                self._cleanup_temp_files(work_dir)
                return base64.b64encode(video_bytes).decode('utf-8')
            else:
                self._cleanup_temp_files(work_dir)
                return None
                
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            return None
    
    async def _create_video_with_audio(
        self,
        image_files: List[str],
        audio_files: List[str],
        output_path: str,
        duration_per_slide: float
    ) -> bool:
        """Create video with synchronized audio."""
        try:
            # Create input file list
            input_file = os.path.join(os.path.dirname(output_path), "input.txt")
            with open(input_file, 'w') as f:
                for img_path in image_files:
                    f.write(f"file '{img_path}'\n")
                    f.write(f"duration {duration_per_slide}\n")
                if image_files:
                    f.write(f"file '{image_files[-1]}'\n")
            
            # Concatenate audio
            audio_input = os.path.join(os.path.dirname(output_path), "audio_input.txt")
            with open(audio_input, 'w') as f:
                for audio_path in audio_files:
                    f.write(f"file '{audio_path}'\n")
            
            combined_audio = os.path.join(os.path.dirname(output_path), "combined_audio.wav")
            
            subprocess.run([
                'ffmpeg', '-f', 'concat', '-safe', '0', '-i', audio_input,
                '-c', 'copy', combined_audio, '-y'
            ], check=True, capture_output=True)
            
            # Create video with audio (9:16 portrait for TikTok/Reels)
            subprocess.run([
                'ffmpeg',
                '-f', 'concat', '-safe', '0', '-i', input_file,
                '-i', combined_audio,
                '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
                '-c:v', 'libx264', '-c:a', 'aac',
                '-pix_fmt', 'yuv420p',
                '-shortest',
                output_path, '-y'
            ], check=True, capture_output=True)
            
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e}")
            return False
    
    async def _create_silent_video(
        self,
        image_files: List[str],
        output_path: str,
        duration_per_slide: float
    ) -> bool:
        """Create silent slideshow video."""
        try:
            input_file = os.path.join(os.path.dirname(output_path), "input.txt")
            with open(input_file, 'w') as f:
                for img_path in image_files:
                    f.write(f"file '{img_path}'\n")
                    f.write(f"duration {duration_per_slide}\n")
                if image_files:
                    f.write(f"file '{image_files[-1]}'\n")
            
            # Create silent video (9:16 portrait for TikTok/Reels)
            subprocess.run([
                'ffmpeg',
                '-f', 'concat', '-safe', '0', '-i', input_file,
                '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-r', '1',
                output_path, '-y'
            ], check=True, capture_output=True)
            
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e}")
            return False
    
    def _cleanup_temp_files(self, work_dir: str):
        """Clean up temporary files."""
        try:
            import shutil
            shutil.rmtree(work_dir)
        except Exception as e:
            logger.warning(f"Failed to cleanup: {e}")
    
    async def create_lesson_video(
        self,
        lesson_data: Dict,
        images: List[str],
        audio_clips: List[str],
        duration_seconds: int = 180
    ) -> Optional[str]:
        """
        Create complete lesson video with duration based on difficulty.
        
        Args:
            lesson_data: Lesson information
            images: List of base64 encoded images
            audio_clips: List of base64 encoded audio clips
            duration_seconds: Total video duration (60=Easy, 180=Intermediate, 300=Hard)
        
        Returns:
            Base64 encoded video or None
        """
        try:
            if not images:
                logger.error("No images provided")
                return None
            
            # Calculate duration per slide based on total duration
            num_slides = min(len(images), 5)
            duration_per_slide = duration_seconds / num_slides
            
            # Pad images if needed
            while len(images) < num_slides:
                images.append(images[-1] if images else "")
            
            logger.info(f"Creating {duration_seconds}s video with {num_slides} slides ({duration_per_slide:.1f}s each)")
            
            video_b64 = await self.create_slideshow_video(
                images=images[:num_slides],
                audio_clips=audio_clips[:num_slides],
                lesson_title=lesson_data.get('title', 'Lesson'),
                duration_per_slide=duration_per_slide
            )
            
            return video_b64
            
        except Exception as e:
            logger.error(f"Lesson video creation failed: {e}")
            return None


# Singleton instance
_video_service = None

def get_free_video_service() -> FreeVideoService:
    """Get or create the free video service instance."""
    global _video_service
    if _video_service is None:
        _video_service = FreeVideoService()
    return _video_service
