"""
Quiz Generation Agent
Generates quiz questions from lesson content
"""
from typing import Dict, Any
import logging

from .base_agent import BaseAgent, AgentResponse, AgentStatus

logger = logging.getLogger(__name__)


class QuizGenerationAgent(BaseAgent):
    """
    Agent responsible for generating quiz questions from lesson content.
    """
    
    async def process(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Generate quiz questions from lesson content.
        
        Args:
            input_data: Dict with:
                - lesson_content: str (the lesson text)
                - num_questions: int (optional, default 5)
                
        Returns:
            AgentResponse with quiz questions
        """
        try:
            lesson_content = input_data.get("lesson_content", "")
            num_questions = input_data.get("num_questions", 5)
            
            if not lesson_content:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="No lesson content provided"
                )
            
            # Use LLM service to generate quiz
            questions = await self.llm_service.generate_quiz(
                lesson_content=lesson_content,
                num_questions=num_questions
            )
            
            if not questions:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="Failed to generate quiz questions"
                )
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result={"questions": questions},
                metadata={
                    "num_questions": len(questions),
                    "requested_questions": num_questions
                }
            )
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
