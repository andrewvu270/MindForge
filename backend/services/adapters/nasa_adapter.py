"""
NASA API Adapter
Fetches space and astronomy content from NASA's open APIs
"""
import aiohttp
import logging
from typing import List, Optional
from datetime import datetime
import os

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class NASAAdapter(SourceAdapter):
    """
    Adapter for NASA Open APIs
    No API key required for basic usage, but recommended for higher rate limits
    Get API key from: https://api.nasa.gov/
    """
    
    BASE_URL = "https://api.nasa.gov"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or os.getenv("NASA_API_KEY", "DEMO_KEY")
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Search NASA content related to the topic.
        
        Args:
            topic: Search query
            limit: Maximum number of items to fetch
            
        Returns:
            List of NASA content dictionaries
        """
        async def _fetch_data():
            results = []
            
            async with aiohttp.ClientSession() as session:
                try:
                    # Fetch from multiple NASA endpoints
                    
                    # 1. NASA Image and Video Library
                    search_results = await self._search_media_library(
                        session, topic, limit=min(limit, 3)
                    )
                    results.extend(search_results)
                    
                    # 2. Astronomy Picture of the Day (if space-related)
                    if any(word in topic.lower() for word in ["space", "astronomy", "planet", "star", "galaxy"]):
                        apod = await self._fetch_apod(session)
                        if apod:
                            results.append(apod)
                    
                    # 3. Mars Rover Photos (if Mars-related)
                    if "mars" in topic.lower():
                        mars_photos = await self._fetch_mars_photos(session, limit=2)
                        results.extend(mars_photos)
                
                except Exception as e:
                    logger.warning(f"Failed to fetch from NASA: {e}")
            
            return results[:limit]
        
        return await self._retry_request(_fetch_data)
    
    async def _search_media_library(
        self,
        session: aiohttp.ClientSession,
        query: str,
        limit: int = 3
    ) -> List[dict]:
        """Search NASA's media library"""
        try:
            url = "https://images-api.nasa.gov/search"
            params = {
                "q": query,
                "media_type": "image,video",
                "page_size": limit
            }
            
            async with session.get(url, params=params, timeout=self.timeout) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                items = data.get("collection", {}).get("items", [])
                
                results = []
                for item in items[:limit]:
                    item_data = item.get("data", [{}])[0]
                    links = item.get("links", [{}])
                    
                    results.append({
                        "source": "nasa_media",
                        "title": item_data.get("title", ""),
                        "description": item_data.get("description", ""),
                        "date": item_data.get("date_created", ""),
                        "media_type": item_data.get("media_type", ""),
                        "keywords": item_data.get("keywords", []),
                        "image_url": links[0].get("href", "") if links else "",
                        "nasa_id": item_data.get("nasa_id", "")
                    })
                
                return results
        except Exception as e:
            logger.warning(f"NASA media library search failed: {e}")
            return []
    
    async def _fetch_apod(self, session: aiohttp.ClientSession) -> Optional[dict]:
        """Fetch Astronomy Picture of the Day"""
        try:
            url = f"{self.BASE_URL}/planetary/apod"
            params = {"api_key": self.api_key}
            
            async with session.get(url, params=params, timeout=self.timeout) as response:
                if response.status != 200:
                    return None
                
                data = await response.json()
                return {
                    "source": "nasa_apod",
                    "title": data.get("title", ""),
                    "description": data.get("explanation", ""),
                    "date": data.get("date", ""),
                    "media_type": data.get("media_type", ""),
                    "image_url": data.get("url", ""),
                    "hd_url": data.get("hdurl", ""),
                    "copyright": data.get("copyright", "")
                }
        except Exception as e:
            logger.warning(f"NASA APOD fetch failed: {e}")
            return None
    
    async def _fetch_mars_photos(
        self,
        session: aiohttp.ClientSession,
        limit: int = 2
    ) -> List[dict]:
        """Fetch recent Mars Rover photos"""
        try:
            url = f"{self.BASE_URL}/mars-photos/api/v1/rovers/curiosity/latest_photos"
            params = {"api_key": self.api_key}
            
            async with session.get(url, params=params, timeout=self.timeout) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                photos = data.get("latest_photos", [])
                
                results = []
                for photo in photos[:limit]:
                    results.append({
                        "source": "nasa_mars",
                        "title": f"Mars Rover Photo - {photo.get('camera', {}).get('full_name', '')}",
                        "description": f"Photo taken by {photo.get('rover', {}).get('name', '')} rover on Mars",
                        "date": photo.get("earth_date", ""),
                        "image_url": photo.get("img_src", ""),
                        "camera": photo.get("camera", {}).get("name", ""),
                        "sol": photo.get("sol", 0)
                    })
                
                return results
        except Exception as e:
            logger.warning(f"NASA Mars photos fetch failed: {e}")
            return []
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize NASA data to standard format.
        
        Args:
            raw_content: Raw NASA data dict
            
        Returns:
            NormalizedContent object
        """
        source_type = raw_content.get("source", "nasa")
        title = raw_content.get("title", "NASA Content")
        description = raw_content.get("description", "")
        date = raw_content.get("date", "")
        image_url = raw_content.get("image_url", "")
        
        # Build content
        content_parts = []
        
        if date:
            try:
                date_obj = datetime.fromisoformat(date.replace('Z', '+00:00'))
                content_parts.append(f"Date: {date_obj.strftime('%B %d, %Y')}")
            except:
                content_parts.append(f"Date: {date}")
        
        if description:
            content_parts.append(f"\n{description}")
        
        # Add keywords if available
        keywords = raw_content.get("keywords", [])
        if keywords:
            content_parts.append(f"\nKeywords: {', '.join(keywords[:10])}")
        
        content = "\n".join(content_parts)
        
        return NormalizedContent(
            source="nasa",
            source_type=SourceType.TEXT,
            title=title,
            content=content,
            url=image_url or "https://www.nasa.gov",
            metadata={
                "source_type": source_type,
                "date": date,
                "image_url": image_url,
                "media_type": raw_content.get("media_type", ""),
                "nasa_id": raw_content.get("nasa_id", ""),
            },
            fetched_at=datetime.now()
        )
