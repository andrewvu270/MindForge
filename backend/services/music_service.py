"""
Music Generation Service
Generates background music for educational videos
"""
import aiohttp
import logging
import os
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class MusicProvider(Enum):
    """Available music generation providers"""
    HUGGINGFACE = "huggingface"  # Free AI music generation
    ROYALTY_FREE = "royalty_free"  # Curated royalty-free tracks
    LOCAL = "local"  # Local music library


class MusicStyle(Enum):
    """Music styles for different lesson types"""
    UPBEAT = "upbeat"  # Technology, Innovation
    CALM = "calm"  # Finance, Economics
    INSPIRING = "inspiring"  # Culture, Personal Development
    FOCUS = "focus"  # Study, Learning
    AMBIENT = "ambient"  # Background, Neutral


class MusicService:
    """
    Multi-provider music generation with automatic fallback.
    
    Provider Priority:
    1. HuggingFace (AI-generated music)
    2. Royalty-free libraries (curated tracks)
    3. Local music files
    """
    
    def __init__(self):
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.music_dir = os.getenv("MUSIC_LIBRARY_PATH", "./assets/music")
        
        # Provider availability
        self.providers_available = {
            MusicProvider.HUGGINGFACE: bool(self.hf_token),
            MusicProvider.ROYALTY_FREE: True,  # Always available (URLs)
            MusicProvider.LOCAL: os.path.exists(self.music_dir)
        }
        
        # Royalty-free music URLs (from free sources)
        self.royalty_free_tracks = {
            MusicStyle.UPBEAT: [
                "https://cdn.pixabay.com/audio/2022/03/10/audio_d1718372d8.mp3",  # Upbeat Corporate
                "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",  # Tech Innovation
            ],
            MusicStyle.CALM: [
                "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c0e0c2e0.mp3",  # Calm Piano
                "https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3",  # Peaceful
            ],
            MusicStyle.INSPIRING: [
                "https://cdn.pixabay.com/audio/2022/03/24/audio_d1718372d8.mp3",  # Inspiring
                "https://cdn.pixabay.com/audio/2022/05/17/audio_1808fbf07a.mp3",  # Motivational
            ],
            MusicStyle.FOCUS: [
                "https://cdn.pixabay.com/audio/2022/01/18/audio_c8c0e0c2e0.mp3",  # Focus
                "https://cdn.pixabay.com/audio/2021/11/23/audio_0625c1539c.mp3",  # Study
            ],
            MusicStyle.AMBIENT: [
                "https://cdn.pixabay.com/audio/2022/02/07/audio_d1718372d8.mp3",  # Ambient
                "https://cdn.pixabay.com/audio/2021/09/14/audio_1808fbf07a.mp3",  # Background
            ]
        }
        
        logger.info(f"Music providers: {self.providers_available}")
    
    async def generate_music(
        self,
        duration_seconds: int = 60,
        style: MusicStyle = MusicStyle.AMBIENT,
        lesson_topic: Optional[str] = None,
        provider: Optional[MusicProvider] = None
    ) -> Dict[str, Any]:
        """
        Generate or select background music for a lesson.
        
        Args:
            duration_seconds: Desired music duration
            style: Music style/mood
            lesson_topic: Topic of the lesson (for AI generation)
            provider: Specific provider to use (None = auto-select)
            
        Returns:
            Dict with music_url, provider, duration, etc.
        """
        start_time = datetime.now()
        
        # Try providers in order of preference
        providers_to_try = (
            [provider] if provider 
            else [MusicProvider.HUGGINGFACE, MusicProvider.ROYALTY_FREE, MusicProvider.LOCAL]
        )
        
        last_error = None
        for prov in providers_to_try:
            if not self.providers_available.get(prov, False):
                continue
            
            try:
                logger.info(f"Attempting music generation with {prov.value}")
                
                if prov == MusicProvider.HUGGINGFACE:
                    result = await self._generate_huggingface(duration_seconds, style, lesson_topic)
                elif prov == MusicProvider.ROYALTY_FREE:
                    result = await self._select_royalty_free(style)
                elif prov == MusicProvider.LOCAL:
                    result = await self._select_local(style)
                else:
                    continue
                
                generation_time = (datetime.now() - start_time).total_seconds()
                
                return {
                    "success": True,
                    "music_url": result["music_url"],
                    "provider": prov.value,
                    "style": style.value,
                    "duration_seconds": duration_seconds,
                    "generation_time_seconds": generation_time,
                    "metadata": result.get("metadata", {})
                }
            
            except Exception as e:
                logger.warning(f"{prov.value} music generation failed: {e}")
                last_error = e
                continue
        
        # All providers failed
        return {
            "success": False,
            "error": f"All music providers failed. Last error: {last_error}",
            "style": style.value,
            "providers_tried": [p.value for p in providers_to_try]
        }
    
    async def _generate_huggingface(
        self,
        duration_seconds: int,
        style: MusicStyle,
        lesson_topic: Optional[str]
    ) -> Dict[str, Any]:
        """
        Generate music using HuggingFace AI models.
        
        Models to try:
        1. facebook/musicgen-small (text-to-music)
        2. facebook/musicgen-medium (higher quality)
        3. riffusion/riffusion-model-v1 (music generation)
        """
        if not self.hf_token:
            raise Exception("HuggingFace token not configured")
        
        # Map style to music prompt
        style_prompts = {
            MusicStyle.UPBEAT: "upbeat electronic corporate background music, energetic, positive",
            MusicStyle.CALM: "calm peaceful piano music, relaxing, gentle",
            MusicStyle.INSPIRING: "inspiring motivational orchestral music, uplifting, hopeful",
            MusicStyle.FOCUS: "focus study ambient music, concentration, minimal",
            MusicStyle.AMBIENT: "ambient background music, neutral, soft"
        }
        
        prompt = style_prompts.get(style, "background music")
        if lesson_topic:
            prompt = f"{prompt}, suitable for {lesson_topic} educational content"
        
        # Try multiple models
        models_to_try = [
            "facebook/musicgen-small",
            "facebook/musicgen-medium",
        ]
        
        last_error = None
        for model in models_to_try:
            try:
                api_url = f"https://api-inference.huggingface.co/models/{model}"
                
                headers = {
                    "Authorization": f"Bearer {self.hf_token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "duration": min(duration_seconds, 30)  # Most models limit to 30s
                    }
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        api_url,
                        headers=headers,
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=120)
                    ) as response:
                        if response.status == 503:
                            last_error = f"{model} is loading"
                            logger.warning(f"Model {model} loading, trying next...")
                            continue
                        elif response.status == 429:
                            last_error = "HuggingFace quota exceeded"
                            logger.warning(f"Quota exceeded for {model}, trying next...")
                            continue
                        elif response.status != 200:
                            error_text = await response.text()
                            last_error = f"{model} error: {error_text}"
                            logger.warning(f"Model {model} failed, trying next...")
                            continue
                        
                        # HuggingFace returns audio bytes
                        audio_bytes = await response.read()
                        
                        # Convert to base64
                        audio_b64 = base64.b64encode(audio_bytes).decode()
                        music_url = f"data:audio/wav;base64,{audio_b64}"
                        
                        logger.info(f"Successfully generated music with {model}")
                        
                        return {
                            "music_url": music_url,
                            "metadata": {
                                "provider": "huggingface",
                                "model": model,
                                "ai_generated": True,
                                "prompt": prompt
                            }
                        }
            
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Model {model} failed: {e}")
                continue
        
        # All models failed
        raise Exception(f"All HuggingFace music models failed. Last error: {last_error}")
    
    async def _select_royalty_free(self, style: MusicStyle) -> Dict[str, Any]:
        """
        Select a royalty-free track from curated library.
        
        Uses free music from:
        - Pixabay (royalty-free)
        - Free Music Archive
        - YouTube Audio Library
        """
        import random
        
        # Get tracks for this style
        tracks = self.royalty_free_tracks.get(style, self.royalty_free_tracks[MusicStyle.AMBIENT])
        
        # Select random track
        music_url = random.choice(tracks)
        
        logger.info(f"Selected royalty-free track: {music_url}")
        
        return {
            "music_url": music_url,
            "metadata": {
                "provider": "royalty_free",
                "source": "pixabay",
                "license": "royalty-free",
                "style": style.value
            }
        }
    
    async def _select_local(self, style: MusicStyle) -> Dict[str, Any]:
        """
        Select music from local library.
        
        Expects music files organized by style:
        ./assets/music/upbeat/track1.mp3
        ./assets/music/calm/track1.mp3
        etc.
        """
        import os
        import random
        
        style_dir = os.path.join(self.music_dir, style.value)
        
        if not os.path.exists(style_dir):
            raise Exception(f"No local music found for style: {style.value}")
        
        # Get all music files
        music_files = [
            f for f in os.listdir(style_dir)
            if f.endswith(('.mp3', '.wav', '.ogg', '.m4a'))
        ]
        
        if not music_files:
            raise Exception(f"No music files in {style_dir}")
        
        # Select random track
        selected_file = random.choice(music_files)
        music_path = os.path.join(style_dir, selected_file)
        
        logger.info(f"Selected local track: {music_path}")
        
        return {
            "music_url": f"file://{music_path}",
            "metadata": {
                "provider": "local",
                "filename": selected_file,
                "style": style.value
            }
        }
    
    def get_style_for_field(self, field: str) -> MusicStyle:
        """
        Recommend music style based on lesson field.
        
        Args:
            field: Lesson field (e.g., "technology", "finance")
            
        Returns:
            Recommended MusicStyle
        """
        field_lower = field.lower()
        
        if any(x in field_lower for x in ["tech", "innovation", "ai", "science"]):
            return MusicStyle.UPBEAT
        elif any(x in field_lower for x in ["finance", "economics", "business"]):
            return MusicStyle.CALM
        elif any(x in field_lower for x in ["culture", "influence", "personal", "development"]):
            return MusicStyle.INSPIRING
        elif any(x in field_lower for x in ["study", "learning", "education"]):
            return MusicStyle.FOCUS
        else:
            return MusicStyle.AMBIENT
    
    async def check_provider_status(self) -> Dict[str, bool]:
        """
        Check which music providers are currently available.
        
        Returns:
            Dict mapping provider name to availability status
        """
        status = {}
        
        # Check HuggingFace
        status["huggingface"] = bool(self.hf_token)
        
        # Royalty-free is always available
        status["royalty_free"] = True
        
        # Check local library
        status["local"] = os.path.exists(self.music_dir)
        
        return status


# Singleton instance
_music_service = None


def get_music_service() -> MusicService:
    """Get or create the music service singleton"""
    global _music_service
    if _music_service is None:
        _music_service = MusicService()
    return _music_service
