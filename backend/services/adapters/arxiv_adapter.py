"""
arXiv API Adapter
Fetches scientific research papers from arXiv.org
"""
import aiohttp
import logging
from typing import List
from datetime import datetime
import xml.etree.ElementTree as ET

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class ArxivAdapter(SourceAdapter):
    """
    Adapter for arXiv API
    No API key required - completely free and open
    API docs: https://arxiv.org/help/api/
    """
    
    BASE_URL = "http://export.arxiv.org/api/query"
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Search arXiv for research papers related to the topic.
        
        Args:
            topic: Search query
            limit: Maximum number of papers to fetch
            
        Returns:
            List of arXiv paper dictionaries
        """
        async def _fetch_data():
            results = []
            
            async with aiohttp.ClientSession() as session:
                try:
                    params = {
                        "search_query": f"all:{topic}",
                        "start": 0,
                        "max_results": limit,
                        "sortBy": "relevance",
                        "sortOrder": "descending"
                    }
                    
                    async with session.get(
                        self.BASE_URL,
                        params=params,
                        timeout=self.timeout
                    ) as response:
                        if response.status != 200:
                            logger.warning(f"arXiv API returned status {response.status}")
                            return []
                        
                        xml_data = await response.text()
                        results = self._parse_arxiv_xml(xml_data)
                
                except Exception as e:
                    logger.warning(f"Failed to fetch from arXiv: {e}")
            
            return results[:limit]
        
        return await self._retry_request(_fetch_data)
    
    def _parse_arxiv_xml(self, xml_data: str) -> List[dict]:
        """Parse arXiv API XML response"""
        try:
            root = ET.fromstring(xml_data)
            
            # Define namespace
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            results = []
            for entry in root.findall('atom:entry', ns):
                # Extract data
                title = entry.find('atom:title', ns)
                summary = entry.find('atom:summary', ns)
                published = entry.find('atom:published', ns)
                updated = entry.find('atom:updated', ns)
                id_elem = entry.find('atom:id', ns)
                
                # Extract authors
                authors = []
                for author in entry.findall('atom:author', ns):
                    name = author.find('atom:name', ns)
                    if name is not None:
                        authors.append(name.text)
                
                # Extract categories
                categories = []
                for category in entry.findall('atom:category', ns):
                    term = category.get('term')
                    if term:
                        categories.append(term)
                
                # Extract PDF link
                pdf_link = ""
                for link in entry.findall('atom:link', ns):
                    if link.get('title') == 'pdf':
                        pdf_link = link.get('href', '')
                        break
                
                # Get arXiv ID from URL
                arxiv_id = ""
                if id_elem is not None:
                    arxiv_id = id_elem.text.split('/abs/')[-1] if '/abs/' in id_elem.text else ""
                
                results.append({
                    "title": title.text.strip() if title is not None else "",
                    "summary": summary.text.strip() if summary is not None else "",
                    "authors": authors,
                    "published": published.text if published is not None else "",
                    "updated": updated.text if updated is not None else "",
                    "arxiv_id": arxiv_id,
                    "url": id_elem.text if id_elem is not None else "",
                    "pdf_url": pdf_link,
                    "categories": categories
                })
            
            return results
        
        except Exception as e:
            logger.error(f"Failed to parse arXiv XML: {e}")
            return []
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize arXiv data to standard format.
        
        Args:
            raw_content: Raw arXiv paper dict
            
        Returns:
            NormalizedContent object
        """
        title = raw_content.get("title", "Research Paper")
        summary = raw_content.get("summary", "")
        authors = raw_content.get("authors", [])
        published = raw_content.get("published", "")
        categories = raw_content.get("categories", [])
        arxiv_id = raw_content.get("arxiv_id", "")
        url = raw_content.get("url", "")
        pdf_url = raw_content.get("pdf_url", "")
        
        # Build content
        content_parts = []
        
        # Authors
        if authors:
            author_str = ", ".join(authors[:5])  # Limit to first 5 authors
            if len(authors) > 5:
                author_str += f" et al. ({len(authors)} total authors)"
            content_parts.append(f"Authors: {author_str}")
        
        # Published date
        if published:
            try:
                date_obj = datetime.fromisoformat(published.replace('Z', '+00:00'))
                content_parts.append(f"Published: {date_obj.strftime('%B %d, %Y')}")
            except:
                content_parts.append(f"Published: {published}")
        
        # arXiv ID
        if arxiv_id:
            content_parts.append(f"arXiv ID: {arxiv_id}")
        
        # Categories
        if categories:
            content_parts.append(f"Categories: {', '.join(categories[:5])}")
        
        # Abstract
        if summary:
            # Clean up summary (arXiv summaries can have extra whitespace)
            clean_summary = " ".join(summary.split())
            content_parts.append(f"\nAbstract:\n{clean_summary}")
        
        # PDF link
        if pdf_url:
            content_parts.append(f"\nPDF: {pdf_url}")
        
        content = "\n".join(content_parts)
        
        return NormalizedContent(
            source="arxiv",
            source_type=SourceType.TEXT,
            title=title,
            content=content,
            url=url or f"https://arxiv.org/abs/{arxiv_id}",
            metadata={
                "authors": authors,
                "published": published,
                "arxiv_id": arxiv_id,
                "categories": categories,
                "pdf_url": pdf_url,
            },
            fetched_at=datetime.now()
        )
    
    async def close(self):
        """No persistent client to close for arXiv (uses context manager)"""
        pass
