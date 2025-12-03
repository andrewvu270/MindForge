"""
Tests for arXiv Adapter
"""
import pytest
from services.adapters.arxiv_adapter import ArxivAdapter


@pytest.mark.asyncio
async def test_arxiv_fetch():
    """Test fetching papers from arXiv"""
    adapter = ArxivAdapter()
    
    # Search for quantum computing papers
    results = await adapter.fetch("quantum computing", limit=3)
    
    assert len(results) > 0
    assert len(results) <= 3
    
    # Check structure
    paper = results[0]
    assert "title" in paper
    assert "summary" in paper
    assert "authors" in paper
    assert "arxiv_id" in paper
    
    await adapter.close()


@pytest.mark.asyncio
async def test_arxiv_normalize():
    """Test normalizing arXiv data"""
    adapter = ArxivAdapter()
    
    # Mock arXiv paper data
    raw_paper = {
        "title": "Quantum Computing and Machine Learning",
        "summary": "This paper explores the intersection of quantum computing and machine learning.",
        "authors": ["Alice Smith", "Bob Johnson"],
        "published": "2024-01-15T00:00:00Z",
        "arxiv_id": "2401.12345",
        "url": "http://arxiv.org/abs/2401.12345",
        "pdf_url": "http://arxiv.org/pdf/2401.12345",
        "categories": ["quant-ph", "cs.LG"]
    }
    
    normalized = adapter.normalize(raw_paper)
    
    assert normalized.source == "arxiv"
    assert normalized.title == "Quantum Computing and Machine Learning"
    assert "Alice Smith" in normalized.content
    assert "Bob Johnson" in normalized.content
    assert "2401.12345" in normalized.content
    assert normalized.url == "http://arxiv.org/abs/2401.12345"
    assert normalized.metadata["arxiv_id"] == "2401.12345"
    assert normalized.metadata["pdf_url"] == "http://arxiv.org/pdf/2401.12345"
    
    await adapter.close()


@pytest.mark.asyncio
async def test_arxiv_fetch_and_normalize():
    """Test full fetch and normalize pipeline"""
    adapter = ArxivAdapter()
    
    # Fetch and normalize in one go
    content = await adapter.fetch_and_normalize("machine learning", limit=2)
    
    assert len(content) > 0
    assert len(content) <= 2
    
    # Check normalized content
    item = content[0]
    assert item.source == "arxiv"
    assert item.title
    assert item.content
    assert item.url
    assert "arxiv_id" in item.metadata
    
    await adapter.close()
