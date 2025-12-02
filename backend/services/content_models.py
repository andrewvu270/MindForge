"""
Data models for content orchestration service
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    """Types of content sources"""
    TEXT = "text"
    NUMERIC = "numeric"
    VIDEO_TRANSCRIPT = "video_transcript"
    NEWS = "news"
    BOOK = "book"
    DISCUSSION = "discussion"


class NormalizedContent(BaseModel):
    """Normalized content from any source"""
    source: str  # "hackernews", "reddit", "yahoo_finance", etc.
    source_type: SourceType
    title: str
    content: str
    url: Optional[str] = None
    metadata: Dict[str, Any] = {}
    fetched_at: datetime = datetime.now()
    
    model_config = {"use_enum_values": True}
