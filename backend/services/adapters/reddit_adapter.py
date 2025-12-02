"""
Reddit API Adapter
Fetches posts from relevant subreddits
"""
import httpx
import logging
from typing import List, Optional
from datetime import datetime
import os

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class RedditAdapter(SourceAdapter):
    """
    Adapter for Reddit API
    Uses Reddit's JSON API (no authentication required for public posts)
    """
    
    BASE_URL = "https://www.reddit.com"
    
    # Subreddit mappings for different fields
    FIELD_SUBREDDITS = {
        "tech": ["technology", "programming", "artificial", "MachineLearning"],
        "technology": ["technology", "programming", "artificial", "MachineLearning"],
        "culture": ["books", "art", "philosophy", "TrueReddit"],
        "finance": ["investing", "stocks", "personalfinance"],
        "economics": ["economics", "economy"],
        "influence": ["leadership", "communication", "socialskills"],
        "global": ["worldnews", "geopolitics", "news"]
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = httpx.AsyncClient(
            headers={
                "User-Agent": "MindForge/1.0 (Educational Microlearning Platform)"
            }
        )
    
    def _get_subreddits_for_topic(self, topic: str) -> List[str]:
        """
        Get relevant subreddits based on topic.
        
        Args:
            topic: Topic or field name
            
        Returns:
            List of subreddit names
        """
        topic_lower = topic.lower()
        
        # Check if topic matches a field
        for field, subreddits in self.FIELD_SUBREDDITS.items():
            if field in topic_lower or topic_lower in field:
                return subreddits
        
        # Default: use topic as subreddit name
        return [topic]
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch top posts from relevant subreddits.
        
        Args:
            topic: Topic or field to search for
            limit: Maximum number of posts to fetch
            
        Returns:
            List of post dictionaries
        """
        async def _fetch_posts():
            subreddits = self._get_subreddits_for_topic(topic)
            all_posts = []
            
            for subreddit in subreddits:
                try:
                    # Fetch hot posts from subreddit
                    url = f"{self.BASE_URL}/r/{subreddit}/hot.json"
                    response = await self.client.get(
                        url,
                        params={"limit": limit}
                    )
                    response.raise_for_status()
                    
                    data = response.json()
                    posts = data.get("data", {}).get("children", [])
                    
                    # Extract post data
                    for post in posts:
                        post_data = post.get("data", {})
                        
                        # Filter out stickied posts and ads
                        if not post_data.get("stickied") and not post_data.get("promoted"):
                            all_posts.append(post_data)
                    
                    # Stop if we have enough posts
                    if len(all_posts) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch from r/{subreddit}: {e}")
                    continue
            
            return all_posts[:limit]
        
        return await self._retry_request(_fetch_posts)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize Reddit post to standard format.
        
        Args:
            raw_content: Raw post dict from Reddit API
            
        Returns:
            NormalizedContent object
        """
        post_id = raw_content.get("id", "")
        title = raw_content.get("title", "Untitled")
        subreddit = raw_content.get("subreddit", "unknown")
        
        # Reddit posts can have selftext (text posts) or be links
        selftext = raw_content.get("selftext", "")
        url = raw_content.get("url", f"https://reddit.com{raw_content.get('permalink', '')}")
        
        # Build content
        content_parts = []
        
        # Add selftext if available
        if selftext and selftext != "[removed]" and selftext != "[deleted]":
            # Limit length for very long posts
            if len(selftext) > 1000:
                content_parts.append(selftext[:1000] + "...")
            else:
                content_parts.append(selftext)
        
        # Add metadata as context
        score = raw_content.get("score", 0)
        num_comments = raw_content.get("num_comments", 0)
        author = raw_content.get("author", "[deleted]")
        
        content_parts.append(
            f"\n\nFrom r/{subreddit}: {score} upvotes, {num_comments} comments by u/{author}"
        )
        
        content = " ".join(content_parts) if content_parts else title
        
        # Determine if it's a discussion or link
        is_self = raw_content.get("is_self", False)
        source_type = SourceType.DISCUSSION if is_self else SourceType.TEXT
        
        return NormalizedContent(
            source="reddit",
            source_type=source_type,
            title=title,
            content=content,
            url=url,
            metadata={
                "post_id": post_id,
                "subreddit": subreddit,
                "score": score,
                "num_comments": num_comments,
                "author": author,
                "created_utc": raw_content.get("created_utc"),
                "is_self": is_self,
                "domain": raw_content.get("domain", ""),
                "flair": raw_content.get("link_flair_text", "")
            },
            fetched_at=datetime.now()
        )
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
