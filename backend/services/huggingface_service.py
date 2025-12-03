"""
HuggingFace Service using MCP
Free image generation, TTS, and more
"""
import os
import httpx
import logging
import base64
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class HuggingFaceService:
    """HuggingFace service for free AI services"""
    
    def __init__(self):
        self.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        self.base_url = "https://api-inference.huggingface.co/models"
        
        # Model endpoints (using currently available models)
        # Note: Free tier has rate limits, errors are handled gracefully
        self.image_model = "black-forest-labs/FLUX.1-schnell"  # Popular, actively maintained
        self.tts_model = "hexgrad/Kokoro-82M"  # Very popular TTS model (3.81M downloads)
        
        if not self.hf_token:
            logger.warning("HUGGINGFACE_TOKEN not found")
    
    async def generate_image(
        self, 
        prompt: str, 
        width: int = 512, 
        height: int = 512
    ) -> Optional[str]:
        """Generate image using HuggingFace Inference API."""
        try:
            headers = {}
            if self.hf_token:
                headers["Authorization"] = f"Bearer {self.hf_token}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.image_model}",
                    headers=headers,
                    json={"inputs": prompt},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    image_bytes = response.content
                    return base64.b64encode(image_bytes).decode('utf-8')
                elif response.status_code == 410:
                    logger.warning(f"HF Image model deprecated, skipping images")
                    return None
                else:
                    logger.warning(f"HF Image API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.warning(f"Image generation skipped: {e}")
            return None
    
    async def generate_lesson_images(
        self, 
        lesson_title: str, 
        field: str,
        num_slides: int = 5
    ) -> List[str]:
        """Generate images for lesson slides using FLUX.1-schnell."""
        images = []
        
        # Generate thumbnail
        thumbnail_prompt = f"Educational illustration for {lesson_title}, {field} topic, clean design, professional"
        logger.info(f"🎨 Generating thumbnail: {thumbnail_prompt[:50]}...")
        thumbnail = await self.generate_image(thumbnail_prompt)
        if thumbnail:
            images.append(thumbnail)
            logger.info(f"✅ Thumbnail generated")
        
        # Generate slide images
        slide_prompts = [
            f"Introduction slide for {lesson_title}, minimalist design",
            f"Key concepts diagram for {field}, infographic style",
            f"Examples of {lesson_title}, visual illustration",
            f"Summary slide with key points, clean layout",
            f"Conclusion with takeaways, professional design"
        ]
        
        for i, prompt in enumerate(slide_prompts[:num_slides-1], 1):
            logger.info(f"🎨 Generating slide {i}/{num_slides-1}...")
            image = await self.generate_image(prompt)
            if image:
                images.append(image)
                logger.info(f"✅ Slide {i} generated")
        
        logger.info(f"✅ Generated {len(images)} images total")
        return images
    
    async def generate_audio(
        self, 
        text: str
    ) -> Optional[str]:
        """Generate audio using HuggingFace TTS."""
        try:
            headers = {}
            if self.hf_token:
                headers["Authorization"] = f"Bearer {self.hf_token}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.tts_model}",
                    headers=headers,
                    json={"inputs": text},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    audio_bytes = response.content
                    return base64.b64encode(audio_bytes).decode('utf-8')
                elif response.status_code == 410:
                    logger.warning(f"HF TTS model deprecated, skipping audio")
                    return None
                else:
                    logger.warning(f"HF TTS API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.warning(f"Audio generation skipped: {e}")
            return None
    
    async def generate_lesson_audio(
        self, 
        lesson_content: str
    ) -> List[str]:
        """Generate audio narration for lesson slides using Kokoro-82M TTS."""
        # Split content into chunks (TTS models have character limits)
        sentences = lesson_content.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk + sentence) < 200:  # Keep chunks under 200 chars
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # Generate audio for each chunk
        audio_clips = []
        for i, chunk in enumerate(chunks[:5], 1):  # Limit to 5 clips
            logger.info(f"🔊 Generating audio clip {i}/{min(len(chunks), 5)}...")
            audio = await self.generate_audio(chunk)
            if audio:
                audio_clips.append(audio)
                logger.info(f"✅ Audio clip {i} generated")
        
        logger.info(f"✅ Generated {len(audio_clips)} audio clips total")
        return audio_clips


# Singleton instance
_hf_service = None

def get_huggingface_service() -> HuggingFaceService:
    """Get or create the HuggingFace service instance."""
    global _hf_service
    if _hf_service is None:
        _hf_service = HuggingFaceService()
    return _hf_service
