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
        Search Reddit for posts matching the topic.
        
        Args:
            topic: Topic to search for
            limit: Maximum number of posts to fetch
            
        Returns:
            List of post dictionaries
        """
        async def _fetch_posts():
            all_posts = []
            
            # First try: Search across all of Reddit
            try:
                url = f"{self.BASE_URL}/search.json"
                response = await self.client.get(
                    url,
                    params={
                        "q": topic,
                        "sort": "relevance",
                        "t": "week",  # Posts from last week
                        "limit": limit
                    }
                )
                response.raise_for_status()
                
                data = response.json()
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    if not post_data.get("stickied") and not post_data.get("promoted"):
                        all_posts.append(post_data)
                
                if len(all_posts) >= limit:
                    return all_posts[:limit]
                    
            except Exception as e:
                logger.warning(f"Reddit search failed for '{topic}': {e}")
            
            # Second try: Search in relevant subreddits
            subreddits = self._get_subreddits_for_topic(topic)
            for subreddit in subreddits[:2]:  # Try first 2 relevant subreddits
                try:
                    url = f"{self.BASE_URL}/r/{subreddit}/search.json"
                    response = await self.client.get(
                        url,
                        params={
                            "q": topic,
                            "restrict_sr": "on",  # Search only in this subreddit
                            "sort": "relevance",
                            "t": "week",
                            "limit": limit
                        }
                    )
                    response.raise_for_status()
                    
                    data = response.json()
                    posts = data.get("data", {}).get("children", [])
                    
                    for post in posts:
                        post_data = post.get("data", {})
                        if not post_data.get("stickied") and not post_data.get("promoted"):
                            all_posts.append(post_data)
                    
                    if len(all_posts) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Failed to search r/{subreddit} for '{topic}': {e}")
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
