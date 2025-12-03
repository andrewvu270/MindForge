"""
Image Generation Service
Supports multiple providers with automatic fallback
"""
import aiohttp
import logging
import os
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class ImageProvider(Enum):
    """Available image generation providers"""
    HUGGINGFACE = "huggingface"  # Best quality, free tier available
    OLLAMA = "ollama"  # Self-hosted, unlimited, slower
    POLLINATIONS = "pollinations"  # Unlimited, free, fast (fallback)


class ImageGenerationService:
    """
    Multi-provider image generation with automatic fallback.
    
    Provider Priority:
    1. HuggingFace (best quality: Stable Diffusion, FLUX, etc.)
    2. Ollama (self-hosted, unlimited)
    3. Pollinations.ai (fast, unlimited, free fallback)
    """
    
    def __init__(self):
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.ollama_api_key = os.getenv("OLLAMA_API_KEY")  # For Ollama Cloud
        self.ollama_enabled = os.getenv("OLLAMA_ENABLED", "false").lower() == "true"
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        
        # Provider availability
        self.providers_available = {
            ImageProvider.POLLINATIONS: True,  # Always available
            ImageProvider.OLLAMA: self.ollama_enabled,
            ImageProvider.HUGGINGFACE: bool(self.hf_token)
        }
        
        logger.info(f"Image generation providers: {self.providers_available}")
    
    async def generate_image(
        self,
        prompt: str,
        width: int = 1024,
        height: int = 1024,
        provider: Optional[ImageProvider] = None,
        style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an image from a text prompt.
        
        Args:
            prompt: Text description of the image
            width: Image width in pixels
            height: Image height in pixels
            provider: Specific provider to use (None = auto-select)
            style: Optional style modifier (e.g., "photorealistic", "anime")
            
        Returns:
            Dict with image_url, provider, generation_time, etc.
        """
        start_time = datetime.now()
        
        # Enhance prompt with style if provided
        enhanced_prompt = f"{prompt}, {style}" if style else prompt
        
        # Try providers in order of preference based on .env setting
        primary = os.getenv('IMAGE_GENERATION_PRIMARY', 'pollinations').lower()
        
        # Map primary provider to enum
        primary_provider = None
        if primary == 'huggingface':
            primary_provider = ImageProvider.HUGGINGFACE
        elif primary == 'ollama':
            primary_provider = ImageProvider.OLLAMA
        elif primary == 'pollinations':
            primary_provider = ImageProvider.POLLINATIONS
        
        providers_to_try = (
            [provider] if provider 
            else [
                primary_provider,  # Try primary first
                ImageProvider.HUGGINGFACE,  # Fallback 1
                ImageProvider.OLLAMA,  # Fallback 2
                ImageProvider.POLLINATIONS  # Fallback 3
            ]
        )
        
        # Remove None and duplicates while preserving order
        providers_to_try = list(dict.fromkeys([p for p in providers_to_try if p is not None]))
        
        last_error = None
        for prov in providers_to_try:
            if not self.providers_available.get(prov, False):
                continue
            
            try:
                logger.info(f"Attempting image generation with {prov.value}")
                
                if prov == ImageProvider.POLLINATIONS:
                    result = await self._generate_pollinations(enhanced_prompt, width, height)
                elif prov == ImageProvider.OLLAMA:
                    result = await self._generate_ollama(enhanced_prompt)
                elif prov == ImageProvider.HUGGINGFACE:
                    result = await self._generate_huggingface(enhanced_prompt, width, height)
                else:
                    continue
                
                generation_time = (datetime.now() - start_time).total_seconds()
                
                return {
                    "success": True,
                    "image_url": result["image_url"],
                    "provider": prov.value,
                    "prompt": prompt,
                    "enhanced_prompt": enhanced_prompt,
                    "generation_time_seconds": generation_time,
                    "width": width,
                    "height": height,
                    "metadata": result.get("metadata", {})
                }
            
            except Exception as e:
                logger.warning(f"{prov.value} generation failed: {e}")
                last_error = e
                continue
        
        # All providers failed
        return {
            "success": False,
            "error": f"All providers failed. Last error: {last_error}",
            "prompt": prompt,
            "providers_tried": [p.value for p in providers_to_try]
        }
    
    async def _generate_pollinations(
        self,
        prompt: str,
        width: int,
        height: int
    ) -> Dict[str, Any]:
        """
        Generate image using Pollinations.ai (unlimited, free).
        
        Pollinations.ai is a free, unlimited image generation service.
        No API key required, just HTTP GET requests.
        """
        # URL encode the prompt
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Pollinations.ai URL format
        # https://image.pollinations.ai/prompt/{prompt}?width={width}&height={height}
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true"
        
        # Verify the image is accessible with retry logic
        # Note: SSL verification disabled for Pollinations (public free service)
        import ssl
        import asyncio
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
        # Retry up to 3 times with increasing timeout
        for attempt in range(3):
            try:
                timeout_seconds = 15 + (attempt * 10)  # 15s, 25s, 35s
                async with aiohttp.ClientSession(connector=connector) as session:
                    async with session.head(image_url, timeout=aiohttp.ClientTimeout(total=timeout_seconds)) as response:
                        if response.status == 200:
                            logger.info(f"Pollinations.ai image generated: {image_url}")
                            break
                        elif attempt < 2:
                            await asyncio.sleep(2)  # Wait before retry
                            continue
                        else:
                            raise Exception(f"Pollinations.ai returned status {response.status}")
            except asyncio.TimeoutError:
                if attempt < 2:
                    logger.warning(f"Pollinations timeout on attempt {attempt + 1}, retrying...")
                    await asyncio.sleep(2)
                    continue
                else:
                    raise Exception("Pollinations.ai timeout after 3 attempts")
            except Exception as e:
                if attempt < 2:
                    logger.warning(f"Pollinations error on attempt {attempt + 1}: {e}, retrying...")
                    await asyncio.sleep(2)
                    continue
                else:
                    raise
        
        return {
            "image_url": image_url,
            "metadata": {
                "provider": "pollinations",
                "model": "pollinations-default",
                "unlimited": True
            }
        }
    
    async def _generate_ollama(self, prompt: str) -> Dict[str, Any]:
        """
        Generate image using Ollama (Cloud or self-hosted).
        
        Supports:
        - Ollama Cloud (with API key)
        - Self-hosted Ollama (local or VPS)
        
        Requires image generation model:
        - ollama pull flux-schnell
        - ollama pull stable-diffusion
        """
        # Prepare headers (for Ollama Cloud API key)
        headers = {}
        if self.ollama_api_key:
            headers["Authorization"] = f"Bearer {self.ollama_api_key}"
        
        async with aiohttp.ClientSession() as session:
            # Check if Ollama is running
            try:
                async with session.get(
                    f"{self.ollama_url}/api/tags",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status != 200:
                        raise Exception("Ollama not responding")
                    
                    models = await response.json()
                    available_models = [m["name"] for m in models.get("models", [])]
                    
                    # Check for image generation models
                    image_models = [m for m in available_models if any(
                        x in m.lower() for x in ["flux", "stable-diffusion", "sdxl"]
                    )]
                    
                    if not image_models:
                        raise Exception(
                            f"No image generation models found. "
                            f"Available: {available_models}. "
                            f"Install with: ollama pull flux-schnell"
                        )
                    
                    model = image_models[0]
            
            except Exception as e:
                raise Exception(f"Ollama connection failed: {e}")
            
            # Generate image
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False
            }
            
            async with session.post(
                f"{self.ollama_url}/api/generate",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=120)  # Image generation can be slow
            ) as response:
                if response.status != 200:
                    raise Exception(f"Ollama generation failed: {response.status}")
                
                result = await response.json()
                
                # Ollama returns base64 image in response
                image_data = result.get("response", "")
                
                if not image_data:
                    raise Exception("Ollama returned empty image")
                
                # For now, return a placeholder URL
                # In production, you'd upload this to S3/Supabase
                image_url = f"data:image/png;base64,{image_data}"
                
                return {
                    "image_url": image_url,
                    "metadata": {
                        "provider": "ollama",
                        "model": model,
                        "self_hosted": True
                    }
                }
    
    async def _generate_huggingface(
        self,
        prompt: str,
        width: int,
        height: int
    ) -> Dict[str, Any]:
        """
        Generate image using HuggingFace InferenceClient with fast Z-Image-Turbo model.
        
        Uses Tongyi-MAI/Z-Image-Turbo via fal-ai provider for fast generation.
        """
        if not self.hf_token:
            raise Exception("HuggingFace token not configured")
        
        try:
            from huggingface_hub import InferenceClient
            import io
            import base64
            from PIL import Image
            
            # Create client - newer versions automatically use router.huggingface.co
            client = InferenceClient(token=self.hf_token)
            
            # Try fast models in order of preference
            models_to_try = [
                "black-forest-labs/FLUX.1-schnell",  # Very fast, high quality
                "stabilityai/stable-diffusion-xl-base-1.0",  # Reliable fallback
                "runwayml/stable-diffusion-v1-5",  # Classic fallback
            ]
            
            pil_image = None
            last_error = None
            used_model = None
            
            for model in models_to_try:
                try:
                    logger.info(f"Trying HuggingFace model: {model}")
                    # Generate image - returns PIL.Image object
                    pil_image = client.text_to_image(
                        prompt,
                        model=model
                    )
                    used_model = model
                    logger.info(f"✅ Successfully generated with {model}")
                    break  # Success!
                except Exception as e:
                    last_error = e
                    logger.warning(f"Model {model} failed: {e}")
                    continue
            
            if pil_image is None:
                raise Exception(f"All HuggingFace models failed. Last error: {last_error}")
            
            # Resize if needed
            if pil_image.size != (width, height):
                pil_image = pil_image.resize((width, height), Image.Resampling.LANCZOS)
            
            # Convert to base64 for storage
            buffer = io.BytesIO()
            pil_image.save(buffer, format="PNG")
            image_bytes = buffer.getvalue()
            
            # Convert to base64 data URL
            image_b64 = base64.b64encode(image_bytes).decode()
            image_url = f"data:image/png;base64,{image_b64}"
            
            logger.info("Successfully generated image with Z-Image-Turbo")
            
            return {
                "image_url": image_url,
                "metadata": {
                    "provider": "huggingface",
                    "model": used_model or "unknown",
                    "paid_tier": True
                }
            }
            
        except Exception as e:
            logger.error(f"HuggingFace Z-Image-Turbo failed: {e}")
            raise Exception(f"HuggingFace image generation failed: {e}")
    
    async def check_provider_status(self) -> Dict[str, bool]:
        """
        Check which providers are currently available.
        
        Returns:
            Dict mapping provider name to availability status
        """
        status = {}
        
        # Pollinations is always available (no auth needed)
        status["pollinations"] = True
        
        # Check Ollama
        if self.ollama_enabled:
            try:
                headers = {}
                if self.ollama_api_key:
                    headers["Authorization"] = f"Bearer {self.ollama_api_key}"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.ollama_url}/api/tags",
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=3)
                    ) as response:
                        status["ollama"] = response.status == 200
            except:
                status["ollama"] = False
        else:
            status["ollama"] = False
        
        # Check HuggingFace
        status["huggingface"] = bool(self.hf_token)
        
        return status
    
    def get_recommended_provider(self) -> ImageProvider:
        """
        Get the recommended provider based on availability and performance.
        
        Returns:
            Recommended ImageProvider
        """
        # Priority: HuggingFace > Ollama > Pollinations
        if self.providers_available.get(ImageProvider.HUGGINGFACE):
            return ImageProvider.HUGGINGFACE
        elif self.providers_available.get(ImageProvider.OLLAMA):
            return ImageProvider.OLLAMA
        elif self.providers_available.get(ImageProvider.POLLINATIONS):
            return ImageProvider.POLLINATIONS
        else:
            return ImageProvider.POLLINATIONS  # Always try Pollinations as last resort


# Singleton instance
_image_service = None


def get_image_generation_service() -> ImageGenerationService:
    """Get or create the image generation service singleton"""
    global _image_service
    if _image_service is None:
        _image_service = ImageGenerationService()
    return _image_service
