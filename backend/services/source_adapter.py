"""
Base SourceAdapter abstract class for external API integrations
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import asyncio
import logging
from datetime import datetime

from .content_models import NormalizedContent

logger = logging.getLogger(__name__)


class SourceAdapter(ABC):
    """
    Abstract base class for all external API adapters.
    Provides common functionality for fetching and normalizing content.
    """
    
    def __init__(self, timeout: int = 10, max_retries: int = 3):
        """
        Initialize the adapter with common configuration.
        
        Args:
            timeout: Request timeout in seconds (default: 10)
            max_retries: Maximum number of retry attempts (default: 3)
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self.retry_delays = [1, 2, 4]  # Exponential backoff delays in seconds
        
    @abstractmethod
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch raw content from the external API.
        
        Args:
            topic: The topic or query to search for
            limit: Maximum number of items to fetch
            
        Returns:
            List of raw content dictionaries from the API
            
        Raises:
            Exception: If the API request fails after all retries
        """
        pass
    
    @abstractmethod
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Transform raw API response into normalized content format.
        
        Args:
            raw_content: Raw content dictionary from the API
            
        Returns:
            NormalizedContent object with standardized fields
        """
        pass
    
    async def fetch_and_normalize(
        self, 
        topic: str, 
        limit: int = 5
    ) -> List[NormalizedContent]:
        """
        Fetch content and normalize it in one operation.
        
        Args:
            topic: The topic or query to search for
            limit: Maximum number of items to fetch
            
        Returns:
            List of NormalizedContent objects
        """
        try:
            raw_contents = await self.fetch(topic, limit)
            normalized = []
            
            for raw in raw_contents:
                try:
                    normalized_content = self.normalize(raw)
                    normalized.append(normalized_content)
                except Exception as e:
                    logger.warning(
                        f"Failed to normalize content from {self.__class__.__name__}: {e}"
                    )
                    continue
                    
            return normalized
            
        except Exception as e:
            logger.error(
                f"Failed to fetch content from {self.__class__.__name__}: {e}"
            )
            return []
    
    async def _retry_request(self, request_func, *args, **kwargs):
        """
        Execute a request with exponential backoff retry logic.
        
        Args:
            request_func: Async function to execute
            *args, **kwargs: Arguments to pass to the function
            
        Returns:
            Result from the request function
            
        Raises:
            Exception: If all retry attempts fail
        """
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                result = await asyncio.wait_for(
                    request_func(*args, **kwargs),
                    timeout=self.timeout
                )
                return result
                
            except asyncio.TimeoutError as e:
                last_exception = e
                logger.warning(
                    f"{self.__class__.__name__} request timeout "
                    f"(attempt {attempt + 1}/{self.max_retries})"
                )
                
            except Exception as e:
                last_exception = e
                logger.warning(
                    f"{self.__class__.__name__} request failed "
                    f"(attempt {attempt + 1}/{self.max_retries}): {e}"
                )
            
            # Wait before retrying (except on last attempt)
            if attempt < self.max_retries - 1:
                delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                await asyncio.sleep(delay)
        
        # All retries failed
        raise last_exception
    
    def _handle_rate_limit(self, response) -> bool:
        """
        Check if response indicates rate limiting.
        
        Args:
            response: HTTP response object
            
        Returns:
            True if rate limited, False otherwise
        """
        if hasattr(response, 'status_code'):
            return response.status_code == 429
        return False
    
    def get_source_name(self) -> str:
        """
        Get the name of this source adapter.
        
        Returns:
            Source name (e.g., "hackernews", "reddit")
        """
        return self.__class__.__name__.replace("Adapter", "").lower()
