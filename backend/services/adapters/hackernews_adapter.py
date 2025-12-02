"""
Hacker News API Adapter
Fetches top stories and discussions from Hacker News
"""
import httpx
import logging
from typing import List, Optional
from datetime import datetime

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class HackerNewsAdapter(SourceAdapter):
    """
    Adapter for Hacker News API
    API Documentation: https://github.com/HackerNews/API
    """
    
    BASE_URL = "https://hacker-news.firebaseio.com/v0"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = httpx.AsyncClient()
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch top stories from Hacker News.
        
        Args:
            topic: Search term (used to filter stories by title/content)
            limit: Maximum number of stories to fetch
            
        Returns:
            List of story dictionaries
        """
        async def _fetch_stories():
            # Get top story IDs
            response = await self.client.get(f"{self.BASE_URL}/topstories.json")
            response.raise_for_status()
            story_ids = response.json()[:limit * 3]  # Fetch extra to filter by topic
            
            # Fetch individual stories
            stories = []
            for story_id in story_ids:
                try:
                    story_response = await self.client.get(
                        f"{self.BASE_URL}/item/{story_id}.json"
                    )
                    story_response.raise_for_status()
                    story = story_response.json()
                    
                    # Filter by topic if provided
                    if topic:
                        title_lower = story.get("title", "").lower()
                        text_lower = story.get("text", "").lower()
                        topic_lower = topic.lower()
                        
                        if topic_lower in title_lower or topic_lower in text_lower:
                            stories.append(story)
                    else:
                        stories.append(story)
                    
                    # Stop if we have enough stories
                    if len(stories) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch HN story {story_id}: {e}")
                    continue
            
            return stories
        
        return await self._retry_request(_fetch_stories)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize Hacker News story to standard format.
        
        Args:
            raw_content: Raw story dict from HN API
            
        Returns:
            NormalizedContent object
        """
        story_id = raw_content.get("id")
        title = raw_content.get("title", "Untitled")
        
        # HN stories may have text (for Ask HN, etc.) or just URL
        text = raw_content.get("text", "")
        url = raw_content.get("url", f"https://news.ycombinator.com/item?id={story_id}")
        
        # Build content from available fields
        content_parts = []
        if text:
            # Remove HTML tags from text
            import re
            clean_text = re.sub(r'<[^>]+>', '', text)
            content_parts.append(clean_text)
        
        # Add metadata as context
        score = raw_content.get("score", 0)
        comments = raw_content.get("descendants", 0)
        author = raw_content.get("by", "unknown")
        
        content_parts.append(
            f"\n\nDiscussion: {score} points, {comments} comments by {author}"
        )
        
        content = " ".join(content_parts) if content_parts else title
        
        return NormalizedContent(
            source="hackernews",
            source_type=SourceType.DISCUSSION,
            title=title,
            content=content,
            url=url,
            metadata={
                "story_id": story_id,
                "score": score,
                "comments": comments,
                "author": author,
                "time": raw_content.get("time"),
                "type": raw_content.get("type", "story")
            },
            fetched_at=datetime.now()
        )
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
