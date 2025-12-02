"""
Tests for FRED Adapter
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from services.adapters.fred_adapter import FREDAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def fred_adapter():
    """Create FRED adapter instance with mock API key"""
    return FREDAdapter(api_key="test_api_key")


@pytest.fixture
def mock_fred_response():
    """Mock FRED API response"""
    return {
        "observations": [
            {"date": "2024-12-01", "value": "3.7"},
            {"date": "2024-11-01", "value": "3.9"},
            {"date": "2024-10-01", "value": "4.1"},
        ]
    }


@pytest.mark.asyncio
async def test_fred_adapter_initialization():
    """Test FRED adapter initializes correctly"""
    adapter = FREDAdapter(api_key="test_key")
    assert adapter.api_key == "test_key"
    assert adapter.BASE_URL == "https://api.stlouisfed.org/fred"


@pytest.mark.asyncio
async def test_fred_adapter_no_api_key():
    """Test FRED adapter handles missing API key"""
    with patch.dict('os.environ', {}, clear=True):
        adapter = FREDAdapter()
        assert adapter.api_key is None


def test_get_series_for_topic(fred_adapter):
    """Test series selection based on topic"""
    # Test GDP topic
    series = fred_adapter._get_series_for_topic("gdp")
    assert len(series) > 0
    assert series[0]["series_id"] == "GDP"
    
    # Test unemployment topic
    series = fred_adapter._get_series_for_topic("unemployment")
    assert len(series) > 0
    assert series[0]["series_id"] == "UNRATE"
    
    # Test unknown topic returns defaults
    series = fred_adapter._get_series_for_topic("unknown_topic")
    assert len(series) == 3  # Returns default indicators


@pytest.mark.asyncio
async def test_fred_fetch_success(fred_adapter, mock_fred_response):
    """Test successful data fetch from FRED"""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_fred_response)
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await fred_adapter.fetch("unemployment", limit=1)
        
        assert len(results) > 0
        assert "series_id" in results[0]
        assert "observations" in results[0]
        assert "latest_value" in results[0]


@pytest.mark.asyncio
async def test_fred_fetch_no_api_key():
    """Test fetch fails gracefully without API key"""
    adapter = FREDAdapter(api_key=None)
    results = await adapter.fetch("gdp")
    assert results == []


@pytest.mark.asyncio
async def test_fred_fetch_api_error(fred_adapter):
    """Test fetch handles API errors"""
    mock_response = AsyncMock()
    mock_response.status = 400
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await fred_adapter.fetch("gdp")
        assert results == []


def test_fred_normalize(fred_adapter):
    """Test normalization of FRED data"""
    raw_data = {
        "series_id": "UNRATE",
        "name": "Unemployment Rate",
        "description": "Percentage of labor force that is unemployed",
        "observations": [
            {"date": "2024-12-01", "value": "3.7"},
            {"date": "2024-11-01", "value": "3.9"},
        ],
        "latest_value": "3.7",
        "latest_date": "2024-12-01"
    }
    
    normalized = fred_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "fred"
    assert normalized.source_type == SourceType.NUMERIC
    assert "Unemployment Rate" in normalized.title
    assert "3.7" in normalized.content
    assert "2024-12-01" in normalized.content
    assert normalized.url == "https://fred.stlouisfed.org/series/UNRATE"
    assert normalized.metadata["series_id"] == "UNRATE"


def test_fred_normalize_with_trend(fred_adapter):
    """Test normalization includes trend calculation"""
    raw_data = {
        "series_id": "GDP",
        "name": "Gross Domestic Product",
        "description": "Total value of goods and services",
        "observations": [
            {"date": "2024-Q3", "value": "27500.0"},
            {"date": "2024-Q2", "value": "27000.0"},
        ],
        "latest_value": "27500.0",
        "latest_date": "2024-Q3"
    }
    
    normalized = fred_adapter.normalize(raw_data)
    
    assert "increased" in normalized.content or "decreased" in normalized.content
    assert "%" in normalized.content  # Should show percentage change


def test_fred_normalize_minimal_data(fred_adapter):
    """Test normalization with minimal data"""
    raw_data = {
        "series_id": "TEST",
        "name": "Test Indicator",
        "description": "",
        "observations": [],
        "latest_value": None,
        "latest_date": None
    }
    
    normalized = fred_adapter.normalize(raw_data)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "fred"
    assert "Test Indicator" in normalized.title


@pytest.mark.asyncio
async def test_fred_fetch_with_limit(fred_adapter, mock_fred_response):
    """Test fetch respects limit parameter"""
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_fred_response)
    
    mock_session = AsyncMock()
    mock_session.get = AsyncMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock()
    
    with patch('aiohttp.ClientSession', return_value=mock_session):
        results = await fred_adapter.fetch("economy", limit=2)
        
        # Should fetch at most 2 series
        assert len(results) <= 2
