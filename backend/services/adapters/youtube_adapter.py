"""
YouTube Data API Adapter
Fetches video metadata and captions/transcripts
"""
import aiohttp
import logging
from typing import List, Optional
from datetime import datetime
import os
import re

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class YouTubeAdapter(SourceAdapter):
    """
    Adapter for YouTube Data API v3
    Requires API key from: https://console.cloud.google.com/apis/credentials
    Enable YouTube Data API v3 in your Google Cloud project
    """
    
    BASE_URL = "https://www.googleapis.com/youtube/v3"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")
        if not self.api_key:
            logger.warning("YouTube API key not provided. Set YOUTUBE_API_KEY environment variable.")
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Search for videos related to the topic.
        
        Args:
            topic: Search query for videos
            limit: Maximum number of videos to fetch
            
        Returns:
            List of video data dictionaries
        """
        if not self.api_key:
            logger.error("YouTube API key not configured")
            return []
        
        async def _fetch_data():
            results = []
            
            async with aiohttp.ClientSession() as session:
                try:
                    # Search for videos
                    search_params = {
                        "part": "snippet",
                        "q": topic,
                        "type": "video",
                        "maxResults": min(limit, 50),
                        "order": "relevance",
                        "key": self.api_key,
                        "videoCaption": "closedCaption",  # Prefer videos with captions
                    }
                    
                    async with session.get(
                        f"{self.BASE_URL}/search",
                        params=search_params,
                        timeout=self.timeout
                    ) as response:
                        if response.status != 200:
                            logger.warning(f"YouTube search API returned status {response.status}")
                            return []
                        
                        search_data = await response.json()
                        video_ids = [item["id"]["videoId"] for item in search_data.get("items", [])]
                        
                        if not video_ids:
                            return []
                        
                        # Get detailed video information
                        video_params = {
                            "part": "snippet,contentDetails,statistics",
                            "id": ",".join(video_ids),
                            "key": self.api_key,
                        }
                        
                        async with session.get(
                            f"{self.BASE_URL}/videos",
                            params=video_params,
                            timeout=self.timeout
                        ) as video_response:
                            if video_response.status != 200:
                                logger.warning(f"YouTube videos API returned status {video_response.status}")
                                return []
                            
                            video_data = await video_response.json()
                            
                            for item in video_data.get("items", []):
                                video_id = item["id"]
                                snippet = item.get("snippet", {})
                                statistics = item.get("statistics", {})
                                content_details = item.get("contentDetails", {})
                                
                                # Try to get captions
                                caption_text = await self._fetch_captions(session, video_id)
                                
                                results.append({
                                    "video_id": video_id,
                                    "title": snippet.get("title"),
                                    "description": snippet.get("description"),
                                    "channel_title": snippet.get("channelTitle"),
                                    "published_at": snippet.get("publishedAt"),
                                    "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                                    "duration": content_details.get("duration"),
                                    "view_count": statistics.get("viewCount"),
                                    "like_count": statistics.get("likeCount"),
                                    "comment_count": statistics.get("commentCount"),
                                    "caption_text": caption_text,
                                })
                
                except Exception as e:
                    logger.warning(f"Failed to fetch from YouTube: {e}")
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    async def _fetch_captions(self, session: aiohttp.ClientSession, video_id: str) -> Optional[str]:
        """
        Attempt to fetch captions for a video.
        Note: This requires OAuth2 for most videos, so we'll return None for now.
        In production, you'd implement OAuth2 flow or use youtube-transcript-api library.
        
        Args:
            session: aiohttp session
            video_id: YouTube video ID
            
        Returns:
            Caption text or None
        """
        # YouTube Data API v3 requires OAuth2 for caption download
        # For now, we'll return None and rely on video description
        # In production, consider using youtube-transcript-api library
        return None
    
    def _parse_duration(self, duration: str) -> str:
        """
        Parse ISO 8601 duration to human-readable format.
        
        Args:
            duration: ISO 8601 duration string (e.g., "PT15M33S")
            
        Returns:
            Human-readable duration (e.g., "15:33")
        """
        if not duration:
            return "Unknown"
        
        # Parse ISO 8601 duration
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
        if not match:
            return duration
        
        hours, minutes, seconds = match.groups()
        hours = int(hours) if hours else 0
        minutes = int(minutes) if minutes else 0
        seconds = int(seconds) if seconds else 0
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize YouTube data to standard format.
        
        Args:
            raw_content: Raw video data dict
            
        Returns:
            NormalizedContent object with video information
        """
        video_id = raw_content.get("video_id", "")
        title = raw_content.get("title", "Unknown Video")
        description = raw_content.get("description", "")
        channel_title = raw_content.get("channel_title", "Unknown Channel")
        published_at = raw_content.get("published_at", "")
        duration = raw_content.get("duration", "")
        view_count = raw_content.get("view_count")
        like_count = raw_content.get("like_count")
        caption_text = raw_content.get("caption_text")
        
        # Build human-readable content
        content_parts = []
        
        # Channel and publish date
        content_parts.append(f"Channel: {channel_title}")
        if published_at:
            # Parse and format date
            try:
                pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                content_parts.append(f"Published: {pub_date.strftime('%B %d, %Y')}")
            except:
                content_parts.append(f"Published: {published_at}")
        
        # Duration
        if duration:
            readable_duration = self._parse_duration(duration)
            content_parts.append(f"Duration: {readable_duration}")
        
        # Statistics
        stats = []
        if view_count:
            try:
                views = int(view_count)
                if views >= 1000000:
                    stats.append(f"{views/1000000:.1f}M views")
                elif views >= 1000:
                    stats.append(f"{views/1000:.1f}K views")
                else:
                    stats.append(f"{views} views")
            except:
                stats.append(f"{view_count} views")
        
        if like_count:
            try:
                likes = int(like_count)
                if likes >= 1000:
                    stats.append(f"{likes/1000:.1f}K likes")
                else:
                    stats.append(f"{likes} likes")
            except:
                pass
        
        if stats:
            content_parts.append(" • ".join(stats))
        
        # Description (truncated)
        if description:
            max_length = 500
            if len(description) > max_length:
                description = description[:max_length].rsplit('\n', 1)[0] + "..."
            content_parts.append(f"\n{description}")
        
        # Caption/transcript if available
        if caption_text:
            max_caption_length = 1000
            if len(caption_text) > max_caption_length:
                caption_text = caption_text[:max_caption_length] + "..."
            content_parts.append(f"\nTranscript:\n{caption_text}")
        
        content = "\n".join(content_parts)
        
        return NormalizedContent(
            source="youtube",
            source_type=SourceType.VIDEO_TRANSCRIPT,
            title=title,
            content=content,
            url=f"https://www.youtube.com/watch?v={video_id}",
            metadata={
                "video_id": video_id,
                "channel_title": channel_title,
                "published_at": published_at,
                "duration": duration,
                "view_count": view_count,
                "like_count": like_count,
                "has_captions": caption_text is not None,
            },
            fetched_at=datetime.now()
        )
