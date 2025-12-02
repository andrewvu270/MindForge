"""
Google Books API Adapter
Fetches book excerpts and information
"""
import aiohttp
import logging
from typing import List, Optional
from datetime import datetime
import os

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class GoogleBooksAdapter(SourceAdapter):
    """
    Adapter for Google Books API
    API key is optional but recommended for higher rate limits
    Get key from: https://console.cloud.google.com/apis/credentials
    """
    
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or os.getenv("GOOGLE_BOOKS_API_KEY")
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Search for books related to the topic.
        
        Args:
            topic: Search query for books
            limit: Maximum number of books to fetch
            
        Returns:
            List of book data dictionaries
        """
        async def _fetch_data():
            results = []
            
            # Build query parameters
            params = {
                "q": topic,
                "maxResults": min(limit, 40),  # API max is 40
                "orderBy": "relevance",
                "printType": "books",
            }
            
            if self.api_key:
                params["key"] = self.api_key
            
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(
                        self.BASE_URL,
                        params=params,
                        timeout=self.timeout
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            items = data.get("items", [])
                            
                            for item in items[:limit]:
                                volume_info = item.get("volumeInfo", {})
                                
                                # Extract relevant information
                                book_data = {
                                    "id": item.get("id"),
                                    "title": volume_info.get("title"),
                                    "authors": volume_info.get("authors", []),
                                    "publisher": volume_info.get("publisher"),
                                    "published_date": volume_info.get("publishedDate"),
                                    "description": volume_info.get("description"),
                                    "page_count": volume_info.get("pageCount"),
                                    "categories": volume_info.get("categories", []),
                                    "language": volume_info.get("language"),
                                    "preview_link": volume_info.get("previewLink"),
                                    "info_link": volume_info.get("infoLink"),
                                    "thumbnail": volume_info.get("imageLinks", {}).get("thumbnail"),
                                    "average_rating": volume_info.get("averageRating"),
                                    "ratings_count": volume_info.get("ratingsCount"),
                                }
                                
                                results.append(book_data)
                        
                        elif response.status == 403:
                            logger.warning("Google Books API quota exceeded or invalid API key")
                        else:
                            logger.warning(f"Google Books API returned status {response.status}")
                
                except Exception as e:
                    logger.warning(f"Failed to fetch from Google Books: {e}")
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize Google Books data to standard format.
        
        Args:
            raw_content: Raw book data dict
            
        Returns:
            NormalizedContent object with book information
        """
        title = raw_content.get("title", "Unknown Book")
        authors = raw_content.get("authors", [])
        publisher = raw_content.get("publisher", "Unknown Publisher")
        published_date = raw_content.get("published_date", "Unknown")
        description = raw_content.get("description", "")
        page_count = raw_content.get("page_count")
        categories = raw_content.get("categories", [])
        preview_link = raw_content.get("preview_link")
        info_link = raw_content.get("info_link")
        average_rating = raw_content.get("average_rating")
        ratings_count = raw_content.get("ratings_count")
        
        # Build human-readable content
        content_parts = []
        
        # Authors
        if authors:
            authors_str = ", ".join(authors)
            content_parts.append(f"By {authors_str}")
        
        # Publication info
        pub_info = []
        if publisher:
            pub_info.append(publisher)
        if published_date:
            pub_info.append(published_date)
        if pub_info:
            content_parts.append(f"Published: {', '.join(pub_info)}")
        
        # Categories
        if categories:
            content_parts.append(f"Categories: {', '.join(categories)}")
        
        # Page count
        if page_count:
            content_parts.append(f"Pages: {page_count}")
        
        # Rating
        if average_rating:
            rating_text = f"Rating: {average_rating}/5"
            if ratings_count:
                rating_text += f" ({ratings_count} reviews)"
            content_parts.append(rating_text)
        
        # Description (truncated)
        if description:
            # Remove HTML tags if present
            import re
            clean_desc = re.sub(r'<[^>]+>', '', description)
            
            # Truncate to reasonable length
            max_length = 500
            if len(clean_desc) > max_length:
                clean_desc = clean_desc[:max_length].rsplit(' ', 1)[0] + "..."
            
            content_parts.append(f"\n{clean_desc}")
        
        # Preview link
        if preview_link:
            content_parts.append(f"\nPreview: {preview_link}")
        
        content = "\n".join(content_parts)
        
        # Create title with authors
        full_title = title
        if authors:
            full_title += f" by {authors[0]}"
            if len(authors) > 1:
                full_title += " et al."
        
        return NormalizedContent(
            source="google_books",
            source_type=SourceType.TEXT,
            title=full_title,
            content=content,
            url=info_link or preview_link or f"https://books.google.com/books?id={raw_content.get('id')}",
            metadata={
                "book_id": raw_content.get("id"),
                "title": title,
                "authors": authors,
                "publisher": publisher,
                "published_date": published_date,
                "page_count": page_count,
                "categories": categories,
                "language": raw_content.get("language"),
                "average_rating": average_rating,
                "ratings_count": ratings_count,
            },
            fetched_at=datetime.now()
        )
