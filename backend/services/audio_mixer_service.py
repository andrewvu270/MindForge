"""
Audio Mixer Service
Combines TTS narration with background music for lesson videos
"""
import asyncio
import logging
import os
import base64
import tempfile
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)


class AudioMixerService:
    """
    Mixes TTS narration with background music.
    
    Features:
    - Automatic volume balancing (music quieter than voice)
    - Fade in/out for music
    - Multiple audio track support
    - Export to various formats
    """
    
    def __init__(self):
        self.music_volume = float(os.getenv("MUSIC_VOLUME", "0.2"))  # 20% volume for music
        self.voice_volume = float(os.getenv("VOICE_VOLUME", "1.0"))  # 100% volume for voice
        self.fade_duration = float(os.getenv("FADE_DURATION", "2.0"))  # 2s fade in/out
        
        # Check if pydub is available (for audio mixing)
        try:
            from pydub import AudioSegment
            self.pydub_available = True
            logger.info("✅ Pydub available for audio mixing")
        except ImportError:
            self.pydub_available = False
            logger.warning("⚠️ Pydub not available. Install with: pip install pydub")
    
    async def mix_lesson_audio(
        self,
        narration_clips: List[str],  # List of base64 audio clips (TTS)
        background_music_url: str,  # URL or base64 of background music
        total_duration_seconds: int = 60,
        output_format: str = "mp3"
    ) -> Dict[str, Any]:
        """
        Mix TTS narration with background music for a lesson.
        
        Args:
            narration_clips: List of TTS audio clips (base64 encoded)
            background_music_url: Background music URL or base64
            total_duration_seconds: Target duration for final audio
            output_format: Output format (mp3, wav, ogg)
            
        Returns:
            Dict with mixed_audio (base64), duration, metadata
        """
        start_time = datetime.now()
        
        if not self.pydub_available:
            return {
                "success": False,
                "error": "Audio mixing not available. Install pydub: pip install pydub"
            }
        
        try:
            from pydub import AudioSegment
            from pydub.effects import normalize
            import io
            
            # 1. Load background music
            logger.info("Loading background music...")
            if background_music_url.startswith("data:"):
                # Base64 encoded
                music_data = base64.b64decode(background_music_url.split(",")[1])
                music = AudioSegment.from_file(io.BytesIO(music_data))
            elif background_music_url.startswith("http"):
                # Download from URL
                import aiohttp
                async with aiohttp.ClientSession() as session:
                    async with session.get(background_music_url) as response:
                        music_data = await response.read()
                        music = AudioSegment.from_file(io.BytesIO(music_data))
            else:
                # Local file
                music = AudioSegment.from_file(background_music_url)
            
            # 2. Adjust music duration and volume
            target_duration_ms = total_duration_seconds * 1000
            
            # Loop music if too short
            if len(music) < target_duration_ms:
                loops_needed = (target_duration_ms // len(music)) + 1
                music = music * loops_needed
            
            # Trim to exact duration
            music = music[:target_duration_ms]
            
            # Reduce music volume
            music = music - (20 * (1 - self.music_volume))  # Reduce by dB
            
            # Add fade in/out
            fade_ms = int(self.fade_duration * 1000)
            music = music.fade_in(fade_ms).fade_out(fade_ms)
            
            # 3. Load and concatenate narration clips
            logger.info(f"Loading {len(narration_clips)} narration clips...")
            narration_segments = []
            
            for i, clip_b64 in enumerate(narration_clips):
                try:
                    clip_data = base64.b64decode(clip_b64)
                    clip = AudioSegment.from_file(io.BytesIO(clip_data))
                    
                    # Normalize volume
                    clip = normalize(clip)
                    
                    # Adjust voice volume
                    if self.voice_volume != 1.0:
                        clip = clip + (20 * (self.voice_volume - 1))
                    
                    narration_segments.append(clip)
                    logger.info(f"  ✅ Loaded clip {i+1}/{len(narration_clips)}")
                except Exception as e:
                    logger.warning(f"  ⚠️ Failed to load clip {i+1}: {e}")
            
            # Concatenate narration with pauses
            if narration_segments:
                pause = AudioSegment.silent(duration=500)  # 500ms pause between clips
                narration = narration_segments[0]
                for segment in narration_segments[1:]:
                    narration = narration + pause + segment
                
                # 4. Overlay narration on music
                logger.info("Mixing narration with music...")
                
                # If narration is shorter than music, pad with silence
                if len(narration) < len(music):
                    silence = AudioSegment.silent(duration=len(music) - len(narration))
                    narration = narration + silence
                
                # Mix: overlay narration on music
                mixed = music.overlay(narration)
            else:
                # No narration, just use music
                logger.warning("No narration clips, using music only")
                mixed = music
            
            # 5. Export mixed audio
            logger.info(f"Exporting as {output_format}...")
            output_buffer = io.BytesIO()
            mixed.export(output_buffer, format=output_format)
            output_buffer.seek(0)
            
            # Convert to base64
            mixed_audio_b64 = base64.b64encode(output_buffer.read()).decode()
            
            generation_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"✅ Audio mixing complete in {generation_time:.2f}s")
            
            return {
                "success": True,
                "mixed_audio": mixed_audio_b64,
                "format": output_format,
                "duration_seconds": len(mixed) / 1000,
                "narration_clips_used": len(narration_segments),
                "generation_time_seconds": generation_time,
                "metadata": {
                    "music_volume": self.music_volume,
                    "voice_volume": self.voice_volume,
                    "fade_duration": self.fade_duration
                }
            }
        
        except Exception as e:
            logger.error(f"Audio mixing failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_lesson_audio(
        self,
        lesson_content: str,
        field: str,
        duration_seconds: int = 60
    ) -> Dict[str, Any]:
        """
        Create complete audio for a lesson (TTS + music).
        
        This is a convenience method that:
        1. Generates TTS narration
        2. Selects appropriate background music
        3. Mixes them together
        
        Args:
            lesson_content: Text content to narrate
            field: Lesson field (for music style selection)
            duration_seconds: Target duration
            
        Returns:
            Dict with complete audio track
        """
        from services.tts_service import get_tts_service
        from services.music_service import get_music_service
        
        tts_service = get_tts_service()
        music_service = get_music_service()
        
        try:
            # 1. Generate TTS narration
            logger.info("Generating TTS narration...")
            
            # Split content into chunks
            sentences = lesson_content.split('. ')
            chunks = []
            current_chunk = ""
            
            for sentence in sentences:
                if len(current_chunk + sentence) < 200:
                    current_chunk += sentence + ". "
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence + ". "
            
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            # Generate TTS for each chunk
            narration_clips = []
            for i, chunk in enumerate(chunks[:5], 1):  # Limit to 5 clips
                logger.info(f"  Generating narration {i}/{min(len(chunks), 5)}...")
                result = await tts_service.generate_speech(chunk)
                if result.get("success"):
                    narration_clips.append(result["audio_data"])
            
            if not narration_clips:
                logger.warning("No narration generated, cannot create audio")
                return {
                    "success": False,
                    "error": "No narration clips generated"
                }
            
            # Check if background music is enabled
            import os
            enable_music = os.getenv('ENABLE_BACKGROUND_MUSIC', 'false').lower() == 'true'
            
            if enable_music:
                # 2. Select background music
                logger.info("Selecting background music...")
                music_style = music_service.get_style_for_field(field)
                music_result = await music_service.generate_music(
                    duration_seconds=duration_seconds,
                    style=music_style,
                    lesson_topic=field
                )
                
                if not music_result.get("success"):
                    logger.warning(f"Music generation failed: {music_result.get('error')}, using narration only")
                    enable_music = False
            
            if enable_music and music_result.get("success"):
                # 3. Mix narration with music
                logger.info("Mixing audio...")
                mixed_result = await self.mix_lesson_audio(
                    narration_clips=narration_clips,
                    background_music_url=music_result["music_url"],
                    total_duration_seconds=duration_seconds
                )
                
                if mixed_result.get("success"):
                    mixed_result["metadata"]["music_style"] = music_style.value
                    mixed_result["metadata"]["music_provider"] = music_result.get("provider")
                
                return mixed_result
            else:
                # Narration only (no background music)
                logger.info("Creating narration-only audio (no background music)")
                return await self._create_narration_only_audio(narration_clips, duration_seconds)
        
        except Exception as e:
            logger.error(f"Lesson audio creation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _create_narration_only_audio(
        self,
        narration_clips: List[str],
        duration_seconds: int
    ) -> Dict[str, Any]:
        """Create audio from narration clips only (no background music)."""
        try:
            # Concatenate all narration clips
            import base64
            from pydub import AudioSegment
            import io
            
            combined_audio = AudioSegment.empty()
            
            for clip_b64 in narration_clips:
                audio_bytes = base64.b64decode(clip_b64)
                audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="wav")
                combined_audio += audio_segment
            
            # Export as base64
            buffer = io.BytesIO()
            combined_audio.export(buffer, format="wav")
            audio_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "mixed_audio": audio_b64,
                "duration_seconds": len(combined_audio) / 1000,
                "metadata": {
                    "narration_clips_used": len(narration_clips),
                    "music_style": "none",
                    "type": "narration_only"
                }
            }
            
        except Exception as e:
            logger.error(f"Narration-only audio creation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def check_dependencies(self) -> Dict[str, bool]:
        """
        Check if required dependencies are installed.
        
        Returns:
            Dict of dependency status
        """
        status = {}
        
        # Check pydub
        try:
            from pydub import AudioSegment
            status["pydub"] = True
        except ImportError:
            status["pydub"] = False
        
        # Check ffmpeg (required by pydub)
        import subprocess
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                capture_output=True,
                timeout=3
            )
            status["ffmpeg"] = result.returncode == 0
        except:
            status["ffmpeg"] = False
        
        return status


# Singleton instance
_audio_mixer = None


def get_audio_mixer_service() -> AudioMixerService:
    """Get or create the audio mixer service singleton"""
    global _audio_mixer
    if _audio_mixer is None:
        _audio_mixer = AudioMixerService()
    return _audio_mixer
