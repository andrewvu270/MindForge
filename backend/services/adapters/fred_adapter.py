"""
FRED (Federal Reserve Economic Data) Adapter
Fetches economic indicators and converts to readable insights
"""
import aiohttp
import logging
from typing import List, Optional
from datetime import datetime, timedelta
import os

from ..source_adapter import SourceAdapter
from ..content_models import NormalizedContent, SourceType

logger = logging.getLogger(__name__)


class FREDAdapter(SourceAdapter):
    """
    Adapter for Federal Reserve Economic Data (FRED)
    Requires FRED API key from https://fred.stlouisfed.org/docs/api/api_key.html
    """
    
    BASE_URL = "https://api.stlouisfed.org/fred"
    
    # Popular economic indicators
    INDICATORS = {
        "gdp": {
            "series_id": "GDP",
            "name": "Gross Domestic Product",
            "description": "Total value of goods and services produced"
        },
        "unemployment": {
            "series_id": "UNRATE",
            "name": "Unemployment Rate",
            "description": "Percentage of labor force that is unemployed"
        },
        "inflation": {
            "series_id": "CPIAUCSL",
            "name": "Consumer Price Index",
            "description": "Measure of average change in prices over time"
        },
        "interest": {
            "series_id": "DFF",
            "name": "Federal Funds Rate",
            "description": "Interest rate at which banks lend to each other"
        },
        "housing": {
            "series_id": "HOUST",
            "name": "Housing Starts",
            "description": "Number of new residential construction projects"
        },
        "retail": {
            "series_id": "RSXFS",
            "name": "Retail Sales",
            "description": "Total receipts of retail stores"
        },
        "manufacturing": {
            "series_id": "INDPRO",
            "name": "Industrial Production Index",
            "description": "Measure of manufacturing output"
        },
    }
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or os.getenv("FRED_API_KEY")
        if not self.api_key:
            logger.warning("FRED API key not provided. Set FRED_API_KEY environment variable.")
    
    def _get_series_for_topic(self, topic: str) -> List[dict]:
        """
        Get relevant economic series based on topic.
        
        Args:
            topic: Topic or economic indicator name
            
        Returns:
            List of series info dictionaries
        """
        topic_lower = topic.lower()
        
        # Check if topic matches an indicator
        matching_series = []
        for key, info in self.INDICATORS.items():
            if (key in topic_lower or 
                topic_lower in key or 
                topic_lower in info["name"].lower() or
                topic_lower in info["description"].lower()):
                matching_series.append(info)
        
        # If no matches, return popular indicators
        if not matching_series:
            matching_series = [
                self.INDICATORS["gdp"],
                self.INDICATORS["unemployment"],
                self.INDICATORS["inflation"]
            ]
        
        return matching_series
    
    async def fetch(self, topic: str, limit: int = 3) -> List[dict]:
        """
        Fetch economic data from FRED API.
        
        Args:
            topic: Topic or economic indicator
            limit: Maximum number of series to fetch
            
        Returns:
            List of economic data dictionaries
        """
        if not self.api_key:
            logger.error("FRED API key not configured")
            return []
        
        async def _fetch_data():
            series_list = self._get_series_for_topic(topic)[:limit]
            results = []
            
            async with aiohttp.ClientSession() as session:
                for series_info in series_list:
                    try:
                        series_id = series_info["series_id"]
                        
                        # Fetch series observations (last 12 months)
                        params = {
                            "series_id": series_id,
                            "api_key": self.api_key,
                            "file_type": "json",
                            "sort_order": "desc",
                            "limit": 12
                        }
                        
                        async with session.get(
                            f"{self.BASE_URL}/series/observations",
                            params=params,
                            timeout=self.timeout
                        ) as response:
                            if response.status == 200:
                                data = await response.json()
                                observations = data.get("observations", [])
                                
                                if observations:
                                    results.append({
                                        "series_id": series_id,
                                        "name": series_info["name"],
                                        "description": series_info["description"],
                                        "observations": observations,
                                        "latest_value": observations[0]["value"] if observations else None,
                                        "latest_date": observations[0]["date"] if observations else None,
                                    })
                            else:
                                logger.warning(f"FRED API returned status {response.status} for {series_id}")
                    
                    except Exception as e:
                        logger.warning(f"Failed to fetch FRED series {series_info['series_id']}: {e}")
                        continue
            
            return results
        
        return await self._retry_request(_fetch_data)
    
    def normalize(self, raw_content: dict) -> NormalizedContent:
        """
        Normalize FRED data to standard format with human-readable insights.
        
        Args:
            raw_content: Raw FRED data dict
            
        Returns:
            NormalizedContent object with readable insights
        """
        series_id = raw_content.get("series_id", "UNKNOWN")
        name = raw_content.get("name", "Economic Indicator")
        description = raw_content.get("description", "")
        observations = raw_content.get("observations", [])
        latest_value = raw_content.get("latest_value")
        latest_date = raw_content.get("latest_date")
        
        # Build human-readable content
        content_parts = []
        
        # Latest value
        if latest_value and latest_date:
            try:
                value_float = float(latest_value)
                content_parts.append(
                    f"Latest value: {value_float:,.2f} (as of {latest_date})"
                )
            except ValueError:
                content_parts.append(
                    f"Latest value: {latest_value} (as of {latest_date})"
                )
        
        # Calculate trend if we have multiple observations
        if len(observations) >= 2:
            try:
                current = float(observations[0]["value"])
                previous = float(observations[1]["value"])
                change = current - previous
                change_pct = (change / previous) * 100 if previous != 0 else 0
                
                direction = "increased" if change > 0 else "decreased"
                content_parts.append(
                    f"The indicator has {direction} by {abs(change):.2f} "
                    f"({abs(change_pct):.2f}%) from the previous period"
                )
            except (ValueError, ZeroDivisionError):
                pass
        
        # Add description
        if description:
            content_parts.append(f"\n{description}")
        
        # Add historical context
        if len(observations) >= 6:
            content_parts.append(
                f"\nHistorical data available for the past {len(observations)} periods"
            )
        
        content = "\n".join(content_parts)
        
        title = f"{name} - Economic Indicator"
        
        return NormalizedContent(
            source="fred",
            source_type=SourceType.NUMERIC,
            title=title,
            content=content,
            url=f"https://fred.stlouisfed.org/series/{series_id}",
            metadata={
                "series_id": series_id,
                "indicator_name": name,
                "latest_value": latest_value,
                "latest_date": latest_date,
                "observation_count": len(observations),
            },
            fetched_at=datetime.now()
        )
