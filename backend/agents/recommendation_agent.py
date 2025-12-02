"""
Recommendation Agent
Recommends next lessons based on user progress
"""
from typing import Dict, Any, List
import logging

from .base_agent import BaseAgent, AgentResponse, AgentStatus

logger = logging.getLogger(__name__)


class RecommendationAgent(BaseAgent):
    """
    Agent responsible for recommending next lessons based on user progress.
    Uses AI to analyze learning patterns and suggest appropriate content.
    """
    
    async def process(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Generate lesson recommendations for a user.
        
        Args:
            input_data: Dict with:
                - user_progress: Dict (user's learning history)
                - available_lessons: List[Dict] (lessons to choose from)
                - num_recommendations: int (optional, default 5)
                
        Returns:
            AgentResponse with recommended lesson IDs
        """
        try:
            user_progress = input_data.get("user_progress", {})
            available_lessons = input_data.get("available_lessons", [])
            num_recommendations = input_data.get("num_recommendations", 5)
            
            if not available_lessons:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="No available lessons to recommend"
                )
            
            # Use LLM service to generate recommendations
            lesson_ids = await self.llm_service.recommend_lessons(
                user_progress=user_progress,
                available_lessons=available_lessons,
                num_recommendations=num_recommendations
            )
            
            if not lesson_ids:
                # Fallback: recommend first few lessons
                lesson_ids = [lesson["id"] for lesson in available_lessons[:num_recommendations]]
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result={"lesson_ids": lesson_ids},
                metadata={
                    "num_recommended": len(lesson_ids),
                    "requested": num_recommendations,
                    "available_lessons": len(available_lessons)
                }
            )
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
