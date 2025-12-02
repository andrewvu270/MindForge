"""
Base Agent class for all AI agents in MindForge
"""
from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel
from datetime import datetime


class AgentStatus(str, Enum):
    """Agent lifecycle states"""
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentResponse(BaseModel):
    """Standard response format for all agents"""
    status: AgentStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = {}
    timestamp: datetime = datetime.now()
    
    model_config = {"use_enum_values": True}


class BaseAgent(ABC):
    """
    Base class for all agents.
    Each agent has a specific responsibility and uses LLM service for AI reasoning.
    """
    
    def __init__(self, llm_service):
        """
        Initialize agent with LLM service.
        
        Args:
            llm_service: LLMService instance for AI reasoning
        """
        self.llm_service = llm_service
        self.status = AgentStatus.IDLE
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def process(self, input_data: Any) -> AgentResponse:
        """
        Process input and return result.
        Each agent implements its own processing logic.
        
        Args:
            input_data: Input data specific to the agent
            
        Returns:
            AgentResponse with result or error
        """
        pass
    
    async def execute(self, input_data: Any) -> AgentResponse:
        """
        Execute agent with error handling and status management.
        
        Args:
            input_data: Input data for processing
            
        Returns:
            AgentResponse with result or error
        """
        try:
            self.status = AgentStatus.PROCESSING
            response = await self.process(input_data)
            self.status = AgentStatus.COMPLETED
            return response
            
        except Exception as e:
            self.status = AgentStatus.FAILED
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e),
                metadata={"agent": self.name}
            )
    
    def get_status(self) -> AgentStatus:
        """Get current agent status"""
        return self.status
