"""
Tests for Finance Adapter (yfinance)
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
import pandas as pd

from services.adapters.finance_adapter import FinanceAdapter
from services.content_models import NormalizedContent, SourceType


@pytest.fixture
def mock_ticker_info():
    """Mock ticker info data"""
    return {
        "longName": "Apple Inc.",
        "sector": "Technology",
        "industry": "Consumer Electronics",
        "marketCap": 3000000000000,  # 3 trillion
        "trailingPE": 30.5,
        "dividendYield": 0.005,
        "longBusinessSummary": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide."
    }


@pytest.fixture
def mock_ticker_history():
    """Mock ticker price history"""
    return pd.DataFrame({
        'Close': [180.0, 182.0, 181.5, 183.0, 185.0],
        'Open': [179.0, 181.0, 182.5, 181.0, 183.5],
        'High': [181.0, 183.0, 183.0, 184.0, 186.0],
        'Low': [178.5, 180.5, 181.0, 182.0, 184.0],
        'Volume': [50000000, 52000000, 48000000, 51000000, 53000000]
    })


@pytest.mark.asyncio
async def test_normalize_with_price_increase(mock_ticker_info, mock_ticker_history):
    """Test normalizing financial data with price increase"""
    adapter = FinanceAdapter()
    
    raw_content = {
        "ticker": "AAPL",
        "info": mock_ticker_info,
        "history": mock_ticker_history,
        "current_price": 185.0,
        "previous_close": 183.0
    }
    
    normalized = adapter.normalize(raw_content)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.source == "finance"
    assert normalized.source_type == SourceType.NUMERIC
    assert "Apple Inc." in normalized.title
    assert "AAPL" in normalized.title
    assert "$185.00" in normalized.content
    assert "up" in normalized.content
    assert "Technology" in normalized.content
    assert "Market Cap: $3000.00B" in normalized.content
    assert "P/E Ratio: 30.5" in normalized.content
    assert normalized.metadata["ticker"] == "AAPL"
    assert normalized.metadata["current_price"] == 185.0
    assert normalized.metadata["price_change"] > 0


@pytest.mark.asyncio
async def test_normalize_with_price_decrease(mock_ticker_info, mock_ticker_history):
    """Test normalizing financial data with price decrease"""
    adapter = FinanceAdapter()
    
    raw_content = {
        "ticker": "AAPL",
        "info": mock_ticker_info,
        "history": mock_ticker_history,
        "current_price": 180.0,
        "previous_close": 183.0
    }
    
    normalized = adapter.normalize(raw_content)
    
    assert "down" in normalized.content
    assert normalized.metadata["price_change"] < 0


@pytest.mark.asyncio
async def test_normalize_truncates_long_summary(mock_ticker_history):
    """Test that long business summaries are truncated"""
    adapter = FinanceAdapter()
    
    long_summary = "A" * 500  # Very long summary
    info = {
        "longName": "Test Company",
        "sector": "Technology",
        "industry": "Software",
        "marketCap": 1000000000,
        "longBusinessSummary": long_summary
    }
    
    raw_content = {
        "ticker": "TEST",
        "info": info,
        "history": mock_ticker_history,
        "current_price": 100.0,
        "previous_close": 95.0
    }
    
    normalized = adapter.normalize(raw_content)
    
    # Should be truncated with ...
    assert "..." in normalized.content
    assert len(normalized.content) < len(long_summary)


@pytest.mark.asyncio
async def test_get_tickers_for_topic():
    """Test ticker selection based on topic"""
    adapter = FinanceAdapter()
    
    # Test category mappings
    tech_tickers = adapter._get_tickers_for_topic("technology")
    assert "AAPL" in tech_tickers
    assert "MSFT" in tech_tickers
    
    ai_tickers = adapter._get_tickers_for_topic("AI")
    assert "NVDA" in ai_tickers
    
    # Test direct ticker symbol
    direct_tickers = adapter._get_tickers_for_topic("TSLA")
    assert direct_tickers == ["TSLA"]
    
    # Test default (market indices)
    default_tickers = adapter._get_tickers_for_topic("unknown topic")
    assert "SPY" in default_tickers


@pytest.mark.asyncio
async def test_normalize_handles_missing_data():
    """Test normalization with minimal data"""
    adapter = FinanceAdapter()
    
    raw_content = {
        "ticker": "TEST",
        "info": {
            "longName": "Test Company",
            "sector": "Unknown",
            "industry": "Unknown"
        },
        "history": pd.DataFrame(),
        "current_price": None,
        "previous_close": None
    }
    
    normalized = adapter.normalize(raw_content)
    
    assert isinstance(normalized, NormalizedContent)
    assert normalized.title == "Test Company (TEST) Financial Overview"
    assert "Unknown" in normalized.content


@pytest.mark.asyncio
async def test_get_source_name():
    """Test source name is correct"""
    adapter = FinanceAdapter()
    assert adapter.get_source_name() == "finance"


@pytest.mark.asyncio
@patch('yfinance.Ticker')
async def test_fetch_with_mocked_yfinance(mock_ticker_class, mock_ticker_info, mock_ticker_history):
    """Test fetching data with mocked yfinance"""
    adapter = FinanceAdapter()
    
    # Mock the Ticker instance
    mock_ticker = MagicMock()
    mock_ticker.info = mock_ticker_info
    mock_ticker.history.return_value = mock_ticker_history
    mock_ticker_class.return_value = mock_ticker
    
    # Fetch data
    results = await adapter.fetch("AAPL", limit=1)
    
    assert len(results) == 1
    assert results[0]["ticker"] == "AAPL"
    assert results[0]["current_price"] == 185.0


@pytest.mark.asyncio
@patch('yfinance.Ticker')
async def test_fetch_handles_errors(mock_ticker_class):
    """Test that fetch handles errors gracefully"""
    adapter = FinanceAdapter()
    
    # Mock ticker that raises an exception
    mock_ticker_class.side_effect = Exception("API Error")
    
    # Should return empty list on error
    results = await adapter.fetch("INVALID", limit=1)
    
    assert len(results) == 0


@pytest.mark.asyncio
@patch('yfinance.Ticker')
async def test_fetch_and_normalize_integration(mock_ticker_class, mock_ticker_info, mock_ticker_history):
    """Test the full fetch and normalize pipeline"""
    adapter = FinanceAdapter()
    
    # Mock the Ticker instance
    mock_ticker = MagicMock()
    mock_ticker.info = mock_ticker_info
    mock_ticker.history.return_value = mock_ticker_history
    mock_ticker_class.return_value = mock_ticker
    
    # Test fetch_and_normalize
    results = await adapter.fetch_and_normalize("tech", limit=2)
    
    assert len(results) > 0
    assert all(isinstance(r, NormalizedContent) for r in results)
    assert results[0].source == "finance"
    assert results[0].source_type == SourceType.NUMERIC


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
