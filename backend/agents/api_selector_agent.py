"""
API Selector Agent
Intelligently selects relevant APIs for a given topic using LLM
"""
import logging
from typing import List, Dict, Any
import json

from .base_agent import BaseAgent, AgentResponse, AgentStatus
from services.api_registry import APIRegistry

logger = logging.getLogger(__name__)


class APISelectorAgent(BaseAgent):
    """
    Agent that uses LLM to intelligently select relevant APIs
    for fetching content based on the lesson topic.
    """
    
    async def process(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Select relevant APIs for a topic.
        
        Args:
            input_data: Dict with:
                - topic: str - The lesson topic
                - field: str - The learning field (optional)
                - max_apis: int - Maximum number of APIs to select (default: 5)
                
        Returns:
            AgentResponse with selected API names
        """
        try:
            topic = input_data.get("topic", "")
            field = input_data.get("field", "")
            max_apis = input_data.get("max_apis", 5)
            
            if not topic:
                return AgentResponse(
                    status=AgentStatus.FAILED,
                    error="No topic provided for API selection"
                )
            
            # Get API catalog
            api_summary = APIRegistry.get_api_summary()
            
            # Use LLM to select relevant APIs
            selected_apis = await self._select_apis_with_llm(
                topic=topic,
                field=field,
                api_summary=api_summary,
                max_apis=max_apis
            )
            
            # Validate selected APIs exist
            valid_apis = [
                api for api in selected_apis
                if APIRegistry.get_api(api) is not None
            ]
            
            if not valid_apis:
                # Fallback to default APIs
                logger.warning(f"No valid APIs selected for topic '{topic}', using defaults")
                valid_apis = ["wikipedia", "youtube", "reddit"]
            
            return AgentResponse(
                status=AgentStatus.COMPLETED,
                result={
                    "selected_apis": valid_apis,
                    "topic": topic,
                    "field": field
                },
                metadata={
                    "num_selected": len(valid_apis),
                    "requested_max": max_apis
                }
            )
            
        except Exception as e:
            logger.error(f"API selection failed: {e}")
            return AgentResponse(
                status=AgentStatus.FAILED,
                error=str(e)
            )
    
    async def _select_apis_with_llm(
        self,
        topic: str,
        field: str,
        api_summary: str,
        max_apis: int
    ) -> List[str]:
        """
        Use LLM to intelligently select APIs based on topic.
        
        Args:
            topic: The lesson topic
            field: The learning field
            api_summary: Summary of all available APIs
            max_apis: Maximum number of APIs to select
            
        Returns:
            List of selected API names
        """
        prompt = f"""You are an intelligent API selector for a microlearning platform. Your job is to select the most relevant APIs to fetch content for creating a lesson.

Topic: {topic}
Field: {field}

{api_summary}

Instructions:
1. Analyze the topic and field
2. Select {max_apis} most relevant APIs from the list above
3. Prioritize APIs that will provide diverse, high-quality educational content
4. Consider: relevance, content quality, and diversity of perspectives
5. Return ONLY a JSON array of API names, nothing else

Example output format:
["wikipedia", "nasa", "youtube", "reddit", "arxiv"]

Your selection (JSON array only):"""

        try:
            response = await self.llm_service.generate_text(
                prompt=prompt,
                max_tokens=200,
                temperature=0.3  # Lower temperature for more consistent selection
            )
            
            # Parse JSON response
            response = response.strip()
            
            # Extract JSON array if wrapped in markdown
            if "```" in response:
                response = response.split("```")[1]
                if response.startswith("json"):
                    response = response[4:]
            
            selected_apis = json.loads(response)
            
            if not isinstance(selected_apis, list):
                raise ValueError("Response is not a list")
            
            # Limit to max_apis
            selected_apis = selected_apis[:max_apis]
            
            logger.info(f"LLM selected APIs for '{topic}': {selected_apis}")
            return selected_apis
            
        except Exception as e:
            logger.error(f"Failed to parse LLM response for API selection: {e}")
            # Fallback: use keyword-based selection
            return self._fallback_selection(topic, field, max_apis)
    
    def _fallback_selection(
        self,
        topic: str,
        field: str,
        max_apis: int
    ) -> List[str]:
        """
        Fallback API selection using keyword matching.
        
        Args:
            topic: The lesson topic
            field: The learning field
            max_apis: Maximum number of APIs to select
            
        Returns:
            List of selected API names
        """
        # Search APIs by topic keywords
        topic_matches = APIRegistry.search_apis(topic)
        field_matches = APIRegistry.search_apis(field) if field else []
        
        # Combine and deduplicate
        all_matches = list(set(topic_matches + field_matches))
        
        # Always include wikipedia as a baseline
        if "wikipedia" not in all_matches:
            all_matches.insert(0, "wikipedia")
        
        # Limit to max_apis
        selected = all_matches[:max_apis]
        
        logger.info(f"Fallback selection for '{topic}': {selected}")
        return selected
