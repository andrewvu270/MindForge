"""
Finance Data Adapter using yfinance
Fetches stock market data and converts to readable insights
"""
try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False
    yf = None

import logging
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class FinanceAdapter(SourceAdapter):
    """
    Adapter for financial data using yfinance library
    No API key required!
    """
    
    # Popular tickers for different topics
    TOPIC_TICKERS = {
        "tech": ["AAPL", "MSFT", "GOOGL", "NVDA", "META"],
        "technology": ["AAPL", "MSFT", "GOOGL", "NVDA", "META"],
        "ai": ["NVDA", "MSFT", "GOOGL", "META", "AMD"],
        "market": ["SPY", "QQQ", "DIA", "IWM"],
        "crypto": ["BTC-USD", "ETH-USD"],
        "finance": ["JPM", "BAC", "GS", "MS", "WFC"],
        "energy": ["XOM", "CVX", "COP", "SLB"],
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def _get_tickers_for_topic(self, topic: str) -> List[str]:
        """
        Get relevant stock tickers based on topic.
        
        Args:
            topic: Topic or sector name
            
        Returns:
            List of ticker symbols
        """
        topic_lower = topic.lower()
        
        # Check if topic matches a category
        for category, tickers in self.TOPIC_TICKERS.items():
            if category in topic_lower or topic_lower in category:
                return tickers
        
        # If topic looks like a ticker symbol, use it directly
        if len(topic) <= 5 and topic.isupper():
            return [topic]
        
        # Default to major indices
        return ["SPY", "QQQ", "DIA"]
    
    async def fetch(self, topic: str, limit: int = 5) -> List[dict]:
        """
        Fetch financial data for relevant tickers.
        
        Args:
            topic: Topic or ticker symbol
            limit: Maximum number of tickers to fetch
            
        Returns:
            List of financial data dictionaries
        """
        if not YFINANCE_AVAILABLE:
            logger.warning("yfinance not available, skipping finance data fetch")
            return []
        
        async def _fetch_data():
            tickers = self._get_tickers_for_topic(topic)[:limit]
            results = []
            
            for ticker_symbol in tickers:
                try:
                    # Run yfinance in thread pool (it's synchronous)
                    ticker = await asyncio.to_thread(yf.Ticker, ticker_symbol)
                    
                    # Get basic info
                    info = await asyncio.to_thread(lambda: ticker.info)
                    
                    # Get recent history
                    hist = await asyncio.to_thread(
                        lambda: ticker.history(period="5d")
                    )
                    
                    if not hist.empty:
                        results.append({
                            "ticker": ticker_symbol,
                            "info": info,
                            "history": hist,
                            "current_price": hist['Close'].iloc[-1] if len(hist) > 0 else None,
                            "previous_close": hist['Close'].iloc[-2] if len(hist) > 1 else None,
                        })
                    
                except Exception as e:
                    logger.warning(f"Failed to fetch data for {ticker_symbol}: {e}")
                    continue
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize financial data to standard format with human-readable insights.
        
        Args:
            raw_content: Raw financial data dict
            
        Returns:
            NormalizedContent object with readable insights
        """
        ticker = raw_content.get("ticker", "UNKNOWN")
        info = raw_content.get("info", {})
        current_price = raw_content.get("current_price")
        previous_close = raw_content.get("previous_close")
        
        # Extract key information
        company_name = info.get("longName", ticker)
        sector = info.get("sector", "Unknown")
        industry = info.get("industry", "Unknown")
        market_cap = info.get("marketCap", 0)
        
        # Calculate price change
        price_change = None
        price_change_pct = None
        if current_price and previous_close:
            price_change = current_price - previous_close
            price_change_pct = (price_change / previous_close) * 100
        
        # Build human-readable content
        content_parts = []
        
        # Price information
        if current_price:
            content_parts.append(
                f"Current price: ${current_price:.2f}"
            )
            
            if price_change is not None:
                direction = "up" if price_change > 0 else "down"
                content_parts.append(
                    f"Price is {direction} ${abs(price_change):.2f} "
                    f"({abs(price_change_pct):.2f}%) from previous close"
                )
        
        # Company information
        content_parts.append(f"Sector: {sector}, Industry: {industry}")
        
        # Market cap
        if market_cap > 0:
            market_cap_b = market_cap / 1e9
            content_parts.append(f"Market Cap: ${market_cap_b:.2f}B")
        
        # Additional metrics
        pe_ratio = info.get("trailingPE")
        if pe_ratio:
            content_parts.append(f"P/E Ratio: {pe_ratio:.2f}")
        
        dividend_yield = info.get("dividendYield")
        if dividend_yield:
            content_parts.append(f"Dividend Yield: {dividend_yield * 100:.2f}%")
        
        # Business summary (truncated)
        summary = info.get("longBusinessSummary", "")
        if summary:
            summary_short = summary[:200] + "..." if len(summary) > 200 else summary
            content_parts.append(f"\n{summary_short}")
        
        content = "\n".join(content_parts)
        
        title = f"{company_name} ({ticker}) Financial Overview"
        
        return NormalizedContent(
            source="finance",
            source_type=SourceType.NUMERIC,
            title=title,
            content=content,
            url=f"https://finance.yahoo.com/quote/{ticker}",
            metadata={
                "ticker": ticker,
                "company_name": company_name,
                "sector": sector,
                "industry": industry,
                "current_price": float(current_price) if current_price else None,
                "price_change": float(price_change) if price_change else None,
                "price_change_pct": float(price_change_pct) if price_change_pct else None,
                "market_cap": market_cap,
                "pe_ratio": pe_ratio,
                "dividend_yield": dividend_yield,
            },
            fetched_at=datetime.now()
        )
