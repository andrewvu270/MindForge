"""
Tests for Google Books Adapter
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime

from services.adapters.googlebooks_adapter import GoogleBooksAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def books_adapter():
    """Create Google Books adapter instance"""
    return GoogleBooksAdapter()


@pytest.fixture
def mock_books_response():
    """Mock Google Books API response"""
    return {
        "items": [
            {
                "id": "book123",
                "volumeInfo": {
                    "title": "Learning Python",
                    "authors": ["Mark Lutz"],
                    "publisher": "O'Reilly Media",
                    "publishedDate": "2013",
                    "description": "A comprehensive guide to Python programming",
                    "pageCount": 1648,
                    "categories": ["Computers"],
                    "language": "en",
                    "previewLink": "https://books.google.com/preview/book123",
                    "infoLink": "https://books.google.com/info/book123",
                    "imageLinks": {
                        "thumbnail": "https://books.google.com/thumb/book123"
                    },
                    "averageRating": 4.5,
                    "ratingsCount": 100
                }
            }
        ]
    }


@pytest.mark.asyncio
async def test_books_adapter_initialization():
    """Test Google Books adapter initializes correctly"""
    adapter = GoogleBooksAdapter(api_key="test_key")
    assert adapter.api_key == "test_key"
    assert adapter.BASE_URL == "https://www.googleapis.com/books/v1/volumes"


@pytest.mark.asyncio
async def test_books_adapter_no_api_key():
    """Test adapter works without API key"""
    with patch.dict('os.environ', {}, clear=True):
        adapter = GoogleBooksAdapter()
        assert adapter.api_key is None


@pytest.mark.asyncio
async def test_books_fetch_success(books_adapter, mock_books_response):
    """Test successful book search"""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_books_response)
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await books_adapter.fetch("python programming", limit=5)
        
        assert len(results) > 0
        assert results[0]["title"] == "Learning Python"
        assert "Mark Lutz" in results[0]["authors"]


@pytest.mark.asyncio
async def test_books_fetch_api_error(books_adapter):
    """Test fetch handles API errors"""
    mock_response = AsyncMock()
    mock_response.status = 403
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await books_adapter.fetch("python")
        assert results == []


@pytest.mark.asyncio
async def test_books_fetch_empty_results(books_adapter):
    """Test fetch handles empty results"""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value={"items": []})
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await books_adapter.fetch("nonexistent topic xyz")
        assert results == []


def test_books_normalize(books_adapter):
    """Test normalization of book data"""
    raw_data = {
        "id": "book123",
        "title": "Learning Python",
        "authors": ["Mark Lutz"],
        "publisher": "O'Reilly Media",
        "published_date": "2013",
        "description": "A comprehensive guide to Python programming",
        "page_count": 1648,
        "categories": ["Computers"],
        "language": "en",
        "preview_link": "https://books.google.com/preview/book123",
        "info_link": "https://books.google.com/info/book123",
        "average_rating": 4.5,
        "ratings_count": 100
    }
    
    normalized = books_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "google_books"
    assert normalized.source_type == SourceType.TEXT
    assert "Learning Python" in normalized.title
    assert "Mark Lutz" in normalized.title
    assert "Mark Lutz" in normalized.content
    assert "O'Reilly Media" in normalized.content
    assert "2013" in normalized.content
    assert "1648" in normalized.content
    assert "4.5/5" in normalized.content
    assert normalized.url == "https://books.google.com/info/book123"


def test_books_normalize_minimal_data(books_adapter):
    """Test normalization with minimal data"""
    raw_data = {
        "id": "book456",
        "title": "Test Book",
        "authors": [],
        "description": "",
    }
    
    normalized = books_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "google_books"
    assert "Test Book" in normalized.title


def test_books_normalize_multiple_authors(books_adapter):
    """Test normalization with multiple authors"""
    raw_data = {
        "id": "book789",
        "title": "Advanced Topics",
        "authors": ["Author One", "Author Two", "Author Three"],
        "description": "A book by multiple authors",
    }
    
    normalized = books_adapter.normalize(raw_data)
    
    assert "Author One et al." in normalized.title
    assert "Author One, Author Two, Author Three" in normalized.content


def test_books_normalize_long_description(books_adapter):
    """Test normalization truncates long descriptions"""
    long_desc = "A" * 1000  # Very long description
    raw_data = {
        "id": "book999",
        "title": "Long Book",
        "authors": ["Test Author"],
        "description": long_desc,
    }
    
    normalized = books_adapter.normalize(raw_data)
    
    # Should be truncated
    assert len(normalized.content) < len(long_desc)
    assert "..." in normalized.content


def test_books_normalize_html_in_description(books_adapter):
    """Test normalization removes HTML tags from description"""
    raw_data = {
        "id": "book111",
        "title": "HTML Book",
        "authors": ["Test Author"],
        "description": "<p>This is a <b>bold</b> description with <i>HTML</i> tags</p>",
    }
    
    normalized = books_adapter.normalize(raw_data)
    
    # HTML tags should be removed
    assert "<p>" not in normalized.content
    assert "<b>" not in normalized.content
    assert "bold" in normalized.content
    assert "HTML" in normalized.content


@pytest.mark.asyncio
async def test_books_fetch_respects_limit(books_adapter, mock_books_response):
    """Test fetch respects limit parameter"""
    # Create response with multiple books
    mock_books_response["items"] = mock_books_response["items"] * 10
    
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_books_response)
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await books_adapter.fetch("python", limit=3)
        
        assert len(results) == 3
