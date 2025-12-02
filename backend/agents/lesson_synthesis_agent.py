"""
Lesson Synthesis Agent
Combines content from multiple heterogeneous sources into coherent lessons
"""
from typing import List, Dict, Any
import logging

from .base_agent import BaseAgent, AgentResponse, AgentStatus
from services.content_models import NormalizedContent

logger = logging.getLogger(__name__)


class LessonSynthesisAgent(BaseAgent):
    """
    Agent responsible for synthesizing multi-source content into lessons.
    This is the core "Frankenstein" integration - combining heterogeneous data types.
    """
    
    async def process(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Synthesize multiple content sources into a coherent lesson.
        
        Args:
            input_data: Dict with:
                - contents: List[NormalizedContent]
                - field: str
                - max_words: int (optional)
                
        Returns:
            AgentResponse with synthesized lesson
        """
        try:
            contents = input_data.get("contents", [])
            field = input_data.get("field", "general")
            max_words = input_data.get("max_words", 200)
            
            if not contents:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="No content provided for synthesis"
                )
            
            if len(contents) < 2:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error=f"Need at least 2 sources for synthesis, got {len(contents)}"
                )
            
            # Use LLM service to synthesize
            lesson = await self.llm_service.synthesize_lesson(
                contents=contents,
                field=field,
                max_words=max_words
            )
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result=lesson,
                metadata={
                    "num_sources": len(contents),
                    "source_types": list(set(c.source_type for c in contents)),
                    "sources": [c.source for c in contents],
                    "field": field
                }
            )
            
        except Exception as e:
            logger.error(f"Lesson synthesis failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
