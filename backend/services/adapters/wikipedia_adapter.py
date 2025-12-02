"""
Wikipedia API Adapter
Fetches article summaries and content from Wikipedia
"""
import httpx
import logging
from typing import List, Optional
from datetime import datetime

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class WikipediaAdapter(SourceAdapter):
    """
    Adapter for Wikipedia API
    Uses MediaWiki API - no authentication required
    """
    
    BASE_URL = "https://en.wikipedia.org/w/api.php"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = httpx.AsyncClient(
            headers={
                "User-Agent": "MindForge/1.0 (Educational Microlearning Platform)"
            }
        )
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Search Wikipedia and fetch article summaries.
        
        Args:
            topic: Search query
            limit: Maximum number of articles to fetch
            
        Returns:
            List of article dictionaries
        """
        async def _fetch_articles():
            # First, search for relevant articles
            search_params = {
                "action": "query",
                "list": "search",
                "srsearch": topic,
                "srlimit": limit,
                "format": "json"
            }
            
            response = await self.client.get(self.BASE_URL, params=search_params)
            response.raise_for_status()
            search_data = response.json()
            
            search_results = search_data.get("query", {}).get("search", [])
            
            # Fetch full content for each article
            articles = []
            for result in search_results[:limit]:
                try:
                    page_id = result.get("pageid")
                    title = result.get("title")
                    
                    # Get article extract (summary)
                    extract_params = {
                        "action": "query",
                        "prop": "extracts|info",
                        "exintro": True,  # Only intro section
                        "explaintext": True,  # Plain text, no HTML
                        "pageids": page_id,
                        "inprop": "url",
                        "format": "json"
                    }
                    
                    extract_response = await self.client.get(
                        self.BASE_URL, 
                        params=extract_params
                    )
                    extract_response.raise_for_status()
                    extract_data = extract_response.json()
                    
                    page_data = extract_data.get("query", {}).get("pages", {}).get(str(page_id), {})
                    
                    articles.append({
                        "pageid": page_id,
                        "title": title,
                        "extract": page_data.get("extract", ""),
                        "url": page_data.get("fullurl", f"https://en.wikipedia.org/?curid={page_id}"),
                        "snippet": result.get("snippet", "")
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to fetch Wikipedia article {title}: {e}")
                    continue
            
            return articles
        
        return await self._retry_request(_fetch_articles)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize Wikipedia article to standard format.
        
        Args:
            raw_content: Raw article dict from Wikipedia API
            
        Returns:
            NormalizedContent object
        """
        page_id = raw_content.get("pageid", "")
        title = raw_content.get("title", "Untitled")
        extract = raw_content.get("extract", "")
        url = raw_content.get("url", "")
        snippet = raw_content.get("snippet", "")
        
        # Use extract as main content, truncate if too long
        content = extract
        if len(content) > 1000:
            content = content[:1000] + "..."
        
        # If no extract, use snippet
        if not content and snippet:
            # Remove HTML tags from snippet
            import re
            content = re.sub(r'<[^>]+>', '', snippet)
        
        return NormalizedContent(
            source="wikipedia",
            source_type=SourceType.TEXT,
            title=title,
            content=content,
            url=url,
            metadata={
                "page_id": page_id,
                "has_full_extract": len(extract) > 0
            },
            fetched_at=datetime.now()
        )
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
