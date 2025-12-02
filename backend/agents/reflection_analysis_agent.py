"""
Reflection Analysis Agent
Analyzes user reflections and provides feedback
"""
from typing import Dict, Any, List, Optional
import logging

from .base_agent import BaseAgent, AgentResponse, AgentStatus

logger = logging.getLogger(__name__)


class ReflectionAnalysisAgent(BaseAgent):
    """
    Agent responsible for analyzing user reflections on influence skills.
    Provides constructive feedback and tracks progress over time.
    """
    
    async def process(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Analyze a user reflection and provide feedback.
        
        Args:
            input_data: Dict with:
                - reflection_text: str (user's reflection)
                - user_history: List[Dict] (optional, previous reflections)
                
        Returns:
            AgentResponse with feedback, quality_score, insights
        """
        try:
            reflection_text = input_data.get("reflection_text", "")
            user_history = input_data.get("user_history", [])
            
            if not reflection_text or len(reflection_text.strip()) < 10:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="Reflection text too short or empty"
                )
            
            # Use LLM service to analyze reflection
            analysis = await self.llm_service.analyze_reflection(
                reflection_text=reflection_text,
                user_history=user_history
            )
            
            if not analysis:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="Failed to analyze reflection"
                )
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result=analysis,
                metadata={
                    "reflection_length": len(reflection_text),
                    "has_history": len(user_history) > 0,
                    "history_count": len(user_history)
                }
            )
            
        except Exception as e:
            logger.error(f"Reflection analysis failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
