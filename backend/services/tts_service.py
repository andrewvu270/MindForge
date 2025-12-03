"""
Text-to-Speech Service
Supports multiple providers with automatic fallback
"""
import aiohttp
import logging
import os
import base64
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class TTSProvider(Enum):
    """Available TTS providers"""
    COQUI = "coqui"  # Open source, self-hosted (best quality, easy setup)
    STYLETTS2 = "styletts2"  # High quality, human-like (advanced)
    HUGGINGFACE = "huggingface"  # Free tier, multiple models
    ESPEAK = "espeak"  # Lightweight, local (fallback)


class TTSService:
    """
    Multi-provider text-to-speech with automatic fallback.
    
    Provider Priority:
    1. Coqui TTS (best quality, easy setup, self-hosted)
    2. StyleTTS2 (human-like, advanced setup)
    3. HuggingFace (suno/bark, microsoft/speecht5_tts, facebook/mms-tts)
    4. eSpeak (local fallback)
    """
    
    def __init__(self):
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        self.styletts2_enabled = os.getenv("STYLETTS2_ENABLED", "false").lower() == "true"
        self.styletts2_url = os.getenv("STYLETTS2_URL", "http://localhost:5003")
        self.coqui_enabled = os.getenv("COQUI_TTS_ENABLED", "false").lower() == "true"
        self.coqui_url = os.getenv("COQUI_TTS_URL", "http://localhost:5002")
        
        # Provider availability
        self.providers_available = {
            TTSProvider.COQUI: self.coqui_enabled,
            TTSProvider.STYLETTS2: self.styletts2_enabled,
            TTSProvider.HUGGINGFACE: bool(self.hf_token),
            TTSProvider.ESPEAK: True  # Always available (system command)
        }
        
        logger.info(f"TTS providers: {self.providers_available}")
    
    async def generate_speech(
        self,
        text: str,
        provider: Optional[TTSProvider] = None,
        voice: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate speech from text.
        
        Args:
            text: Text to convert to speech
            provider: Specific provider to use (None = auto-select)
            voice: Voice ID/name (provider-specific)
            language: Language code (e.g., "en", "es", "fr")
            
        Returns:
            Dict with audio_data (base64), provider, generation_time, etc.
        """
        start_time = datetime.now()
        
        # Limit text length
        if len(text) > 500:
            text = text[:500] + "..."
            logger.warning(f"Text truncated to 500 characters for TTS")
        
        # Try providers in order of preference
        # Commented out for speed - SSL issues on macOS
        providers_to_try = (
            [provider] if provider 
            else [
                TTSProvider.COQUI,  # Best quality, local
                TTSProvider.STYLETTS2,  # Advanced (if installed)
                # TTSProvider.HUGGINGFACE,  # Commented out - SSL cert issues
                TTSProvider.ESPEAK  # Fallback
            ]
        )
        
        last_error = None
        for prov in providers_to_try:
            if not self.providers_available.get(prov, False):
                continue
            
            try:
                logger.info(f"Attempting TTS with {prov.value}")
                
                if prov == TTSProvider.COQUI:
                    result = await self._generate_coqui(text, voice, language)
                elif prov == TTSProvider.STYLETTS2:
                    result = await self._generate_styletts2(text, voice, language)
                elif prov == TTSProvider.HUGGINGFACE:
                    result = await self._generate_huggingface(text, voice, language)
                elif prov == TTSProvider.ESPEAK:
                    result = await self._generate_espeak(text, language)
                else:
                    continue
                
                generation_time = (datetime.now() - start_time).total_seconds()
                
                return {
                    "success": True,
                    "audio_data": result["audio_data"],
                    "provider": prov.value,
                    "text": text,
                    "generation_time_seconds": generation_time,
                    "metadata": result.get("metadata", {})
                }
            
            except Exception as e:
                logger.warning(f"{prov.value} TTS failed: {e}")
                last_error = e
                continue
        
        # All providers failed
        return {
            "success": False,
            "error": f"All TTS providers failed. Last error: {last_error}",
            "text": text,
            "providers_tried": [p.value for p in providers_to_try]
        }
    
    async def _generate_styletts2(
        self,
        text: str,
        voice: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """
        Generate speech using StyleTTS2 (human-like quality).
        
        StyleTTS2 is a state-of-the-art TTS model with human-like prosody.
        GitHub: https://github.com/yl4579/StyleTTS2
        
        Installation:
        ```bash
        git clone https://github.com/yl4579/StyleTTS2.git
        cd StyleTTS2
        pip install -r requirements.txt
        python inference_api.py  # Starts server on port 5003
        ```
        """
        if not self.styletts2_enabled:
            raise Exception("StyleTTS2 not enabled")
        
        async with aiohttp.ClientSession() as session:
            # Check if StyleTTS2 is running
            try:
                async with session.get(
                    f"{self.styletts2_url}/health",
                    timeout=aiohttp.ClientTimeout(total=3)
                ) as response:
                    if response.status != 200:
                        raise Exception("StyleTTS2 not responding")
            except Exception as e:
                raise Exception(f"StyleTTS2 connection failed: {e}")
            
            # Generate speech
            params = {
                "text": text,
                "alpha": 0.3,  # Timbre control
                "beta": 0.7,   # Prosody control
                "diffusion_steps": 10,  # Quality vs speed
                "embedding_scale": 1.0
            }
            
            if voice:
                params["reference_audio"] = voice
            
            async with session.post(
                f"{self.styletts2_url}/synthesize",
                json=params,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status != 200:
                    raise Exception(f"StyleTTS2 generation failed: {response.status}")
                
                audio_bytes = await response.read()
                audio_b64 = base64.b64encode(audio_bytes).decode()
                
                return {
                    "audio_data": audio_b64,
                    "metadata": {
                        "provider": "styletts2",
                        "format": "audio/wav",
                        "quality": "human-like",
                        "self_hosted": True
                    }
                }
    
    async def _generate_huggingface(
        self,
        text: str,
        voice: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """
        Generate speech using HuggingFace Inference API.
        
        Tries multiple models in order:
        1. suno/bark-small (easy-to-use, English)
        2. microsoft/speecht5_tts (high quality)
        3. facebook/mms-tts-eng (multilingual)
        """
        if not self.hf_token:
            raise Exception("HuggingFace token not configured")
        
        # Try multiple models in order of preference
        models_to_try = [
            "suno/bark-small",  # Easy to use, good quality
            "microsoft/speecht5_tts",  # High quality from Microsoft
            "facebook/mms-tts-eng",  # Multilingual support
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
                    "inputs": text
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        api_url,
                        headers=headers,
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=60)
                    ) as response:
                        if response.status == 503:
                            last_error = f"{model} is loading"
                            logger.warning(f"Model {model} loading, trying next...")
                            continue
                        elif response.status == 429:
                            last_error = "HuggingFace quota exceeded"
                            logger.warning(f"Quota exceeded for {model}, trying next...")
                            continue
                        elif response.status == 410:
                            last_error = f"{model} deprecated"
                            logger.warning(f"Model {model} deprecated, trying next...")
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
                        
                        logger.info(f"Successfully generated speech with {model}")
                        
                        return {
                            "audio_data": audio_b64,
                            "metadata": {
                                "provider": "huggingface",
                                "model": model,
                                "format": "audio/wav"
                            }
                        }
            
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Model {model} failed: {e}")
                continue
        
        # All models failed
        raise Exception(f"All HuggingFace TTS models failed. Last error: {last_error}")
    
    async def _generate_coqui(
        self,
        text: str,
        voice: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """
        Generate speech using Coqui TTS (self-hosted).
        
        Requires Coqui TTS server running:
        pip install TTS
        tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC
        """
        if not self.coqui_enabled:
            raise Exception("Coqui TTS not enabled")
        
        async with aiohttp.ClientSession() as session:
            # Check if Coqui is running (use root endpoint for health check)
            try:
                async with session.get(
                    f"{self.coqui_url}/",
                    timeout=aiohttp.ClientTimeout(total=3)
                ) as response:
                    if response.status != 200:
                        raise Exception("Coqui TTS not responding")
            except Exception as e:
                raise Exception(f"Coqui TTS connection failed: {e}")
            
            # Generate speech
            params = {
                "text": text,
                "language_idx": language
            }
            
            if voice:
                params["speaker_idx"] = voice
            
            async with session.get(
                f"{self.coqui_url}/api/tts",
                params=params,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status != 200:
                    raise Exception(f"Coqui TTS generation failed: {response.status}")
                
                audio_bytes = await response.read()
                audio_b64 = base64.b64encode(audio_bytes).decode()
                
                return {
                    "audio_data": audio_b64,
                    "metadata": {
                        "provider": "coqui",
                        "format": "audio/wav",
                        "self_hosted": True
                    }
                }
    
    async def _generate_espeak(
        self,
        text: str,
        language: str
    ) -> Dict[str, Any]:
        """
        Generate speech using eSpeak (local, lightweight).
        
        Requires eSpeak installed:
        - macOS: brew install espeak
        - Linux: apt-get install espeak
        - Windows: download from espeak.sourceforge.net
        """
        import subprocess
        import tempfile
        
        try:
            # Create temp file for output
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                output_file = tmp.name
            
            # Run eSpeak
            cmd = [
                "espeak",
                "-v", language,  # Voice/language
                "-w", output_file,  # Write to file
                text
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"eSpeak failed: {result.stderr}")
            
            # Read audio file
            with open(output_file, "rb") as f:
                audio_bytes = f.read()
            
            # Clean up
            import os
            os.unlink(output_file)
            
            # Convert to base64
            audio_b64 = base64.b64encode(audio_bytes).decode()
            
            return {
                "audio_data": audio_b64,
                "metadata": {
                    "provider": "espeak",
                    "format": "audio/wav",
                    "local": True
                }
            }
        
        except FileNotFoundError:
            raise Exception(
                "eSpeak not installed. Install with: "
                "brew install espeak (macOS) or apt-get install espeak (Linux)"
            )
        except Exception as e:
            raise Exception(f"eSpeak generation failed: {e}")
    
    async def check_provider_status(self) -> Dict[str, bool]:
        """
        Check which TTS providers are currently available.
        
        Returns:
            Dict mapping provider name to availability status
        """
        status = {}
        
        # Check StyleTTS2
        if self.styletts2_enabled:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.styletts2_url}/health",
                        timeout=aiohttp.ClientTimeout(total=3)
                    ) as response:
                        status["styletts2"] = response.status == 200
            except:
                status["styletts2"] = False
        else:
            status["styletts2"] = False
        
        # Check HuggingFace
        status["huggingface"] = bool(self.hf_token)
        
        # Check Coqui
        if self.coqui_enabled:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.coqui_url}/api/tts",
                        timeout=aiohttp.ClientTimeout(total=3)
                    ) as response:
                        status["coqui"] = response.status == 200
            except:
                status["coqui"] = False
        else:
            status["coqui"] = False
        
        # Check eSpeak
        try:
            import subprocess
            result = subprocess.run(
                ["espeak", "--version"],
                capture_output=True,
                timeout=3
            )
            status["espeak"] = result.returncode == 0
        except:
            status["espeak"] = False
        
        return status


# Singleton instance
_tts_service = None


def get_tts_service() -> TTSService:
    """Get or create the TTS service singleton"""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service
