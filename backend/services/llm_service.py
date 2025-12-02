"""
LLM Service - Wraps OpenAI/Hugging Face for AI reasoning
Can use MCP in development or direct API in production
"""
import os
import logging
import asyncio
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI, OpenAIError, RateLimitError, APITimeoutError
from datetime import datetime

from .content_models import NormalizedContent

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for AI/LLM operations.
    Wraps OpenAI API with Hugging Face fallback and retry logic.
    """
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        hf_api_key: Optional[str] = None,
        use_mcp: bool = False,
        max_retries: int = 3,
        retry_delays: List[float] = None
    ):
        """
        Initialize LLM service.
        
        Args:
            api_key: OpenAI API key (defaults to env var)
            hf_api_key: Hugging Face API key (defaults to env var)
            use_mcp: Whether to use MCP for development (not implemented yet)
            max_retries: Maximum number of retry attempts
            retry_delays: List of delays between retries in seconds
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.hf_api_key = hf_api_key or os.getenv("HUGGINGFACE_API_KEY")
        self.use_mcp = use_mcp
        self.max_retries = max_retries
        self.retry_delays = retry_delays or [1.0, 2.0, 4.0]  # Exponential backoff
        
        # Initialize OpenAI client
        if not self.use_mcp:
            if not self.api_key:
                logger.warning("OPENAI_API_KEY not set, will rely on Hugging Face fallback")
            else:
                self.client = AsyncOpenAI(api_key=self.api_key)
        else:
            # TODO: Implement MCP client for development
            logger.warning("MCP mode not yet implemented, falling back to OpenAI")
            if self.api_key:
                self.client = AsyncOpenAI(api_key=self.api_key)
        
        # Hugging Face client setup (if needed)
        self.hf_client = None
        if self.hf_api_key:
            # Lazy initialization - only create when needed
            logger.info("Hugging Face API key configured for fallback")
    
    async def _call_with_retry(self, func, *args, **kwargs):
        """
        Call an async function with retry logic and error handling.
        
        Args:
            func: Async function to call
            *args, **kwargs: Arguments to pass to function
            
        Returns:
            Function result
            
        Raises:
            Exception: If all retries fail
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
                
            except RateLimitError as e:
                last_error = e
                logger.warning(f"Rate limit hit on attempt {attempt + 1}/{self.max_retries}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                    
            except APITimeoutError as e:
                last_error = e
                logger.warning(f"API timeout on attempt {attempt + 1}/{self.max_retries}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                    
            except OpenAIError as e:
                last_error = e
                logger.error(f"OpenAI error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                    await asyncio.sleep(delay)
                else:
                    # Try Hugging Face fallback on final failure
                    if self.hf_api_key:
                        logger.info("Attempting Hugging Face fallback...")
                        return await self._huggingface_fallback(func.__name__, *args, **kwargs)
                    
            except Exception as e:
                last_error = e
                logger.error(f"Unexpected error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt >= self.max_retries - 1:
                    break
                delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                await asyncio.sleep(delay)
        
        # All retries failed
        raise last_error or Exception("All retry attempts failed")
    
    async def _huggingface_fallback(self, operation: str, *args, **kwargs):
        """
        Fallback to Hugging Face API when OpenAI fails.
        
        Args:
            operation: Name of the operation (for logging)
            *args, **kwargs: Operation arguments
            
        Returns:
            Fallback result
            
        Raises:
            NotImplementedError: Hugging Face integration not yet implemented
        """
        logger.warning(f"Hugging Face fallback for {operation} not yet fully implemented")
        # TODO: Implement actual Hugging Face API calls
        # For now, raise an error to indicate fallback is needed
        raise NotImplementedError(
            "Hugging Face fallback is configured but not yet implemented. "
            "Please ensure OpenAI API is available."
        )
    
    async def synthesize_lesson(
        self, 
        contents: List[NormalizedContent],
        field: str,
        max_words: int = 200
    ) -> Dict[str, Any]:
        """
        Synthesize multiple content sources into a coherent lesson.
        
        Args:
            contents: List of normalized content from different sources
            field: Learning field (tech, finance, etc.)
            max_words: Maximum words for summary
            
        Returns:
            Dict with title, summary, learning_objectives, sources
        """
        async def _synthesize():
            # Build prompt with all sources
            sources_text = "\n\n".join([
                f"Source {i+1} ({content.source}):\nTitle: {content.title}\nContent: {content.content}"
                for i, content in enumerate(contents)
            ])
            
            prompt = f"""You are an expert educator creating a microlearning lesson in the field of {field}.

You have been given content from {len(contents)} different sources with different formats (discussions, news, data, etc.).

Your task is to synthesize these sources into ONE coherent, educational lesson.

Sources:
{sources_text}

Create a lesson with:
1. A clear, engaging title
2. A summary that integrates insights from ALL sources (max {max_words} words)
3. 3-5 specific learning objectives
4. Key concepts covered

Format your response as JSON:
{{
    "title": "lesson title",
    "summary": "integrated summary under {max_words} words",
    "learning_objectives": ["objective 1", "objective 2", ...],
    "key_concepts": ["concept 1", "concept 2", ...]
}}

Remember: Synthesize and integrate - don't just concatenate. Find connections between sources."""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {"role": "system", "content": "You are an expert educator who creates engaging microlearning content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Add source attribution
            result["sources"] = [
                {
                    "name": content.source,
                    "title": content.title,
                    "url": content.url
                }
                for content in contents
            ]
            
            return result
        
        try:
            return await self._call_with_retry(_synthesize)
        except Exception as e:
            logger.error(f"Failed to synthesize lesson after retries: {e}")
            raise
    
    async def generate_quiz(
        self,
        lesson_content: str,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate quiz questions from lesson content.
        
        Args:
            lesson_content: The lesson text
            num_questions: Number of questions to generate
            
        Returns:
            List of question dictionaries
        """
        async def _generate():
            prompt = f"""Create {num_questions} multiple choice quiz questions based on this lesson:

{lesson_content}

Requirements:
- Mix of difficulty levels
- Clear, unambiguous questions
- 4 options per question (A, B, C, D)
- Include explanations for correct answers
- Test understanding, not just memorization

Format as JSON array:
[
    {{
        "question": "question text",
        "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
        "correct_answer": "A) option 1",
        "explanation": "why this is correct"
    }},
    ...
]"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at creating educational assessments."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Handle different response formats
            if isinstance(result, dict) and "questions" in result:
                return result["questions"]
            elif isinstance(result, list):
                return result
            else:
                return []
        
        try:
            return await self._call_with_retry(_generate)
        except Exception as e:
            logger.error(f"Failed to generate quiz after retries: {e}")
            raise
    
    async def analyze_reflection(
        self,
        reflection_text: str,
        user_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Analyze user reflection and provide feedback.
        
        Args:
            reflection_text: User's reflection response
            user_history: Previous reflections for context
            
        Returns:
            Dict with feedback, quality_score, insights
        """
        async def _analyze():
            history_context = ""
            if user_history:
                history_context = "\n\nPrevious reflections:\n" + "\n".join([
                    f"- {r.get('response', '')[:100]}..."
                    for r in user_history[-3:]  # Last 3 reflections
                ])
            
            prompt = f"""Analyze this reflection on influence skills and provide constructive feedback:

Reflection: {reflection_text}
{history_context}

Provide:
1. Constructive feedback (2-3 sentences)
2. Quality score (0-100) based on depth, self-awareness, and actionability
3. Key insights or patterns you notice
4. One specific suggestion for improvement

Format as JSON:
{{
    "feedback": "constructive feedback",
    "quality_score": 85,
    "insights": ["insight 1", "insight 2"],
    "suggestion": "specific suggestion"
}}"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a supportive coach helping people develop influence skills."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            return json.loads(response.choices[0].message.content)
        
        try:
            return await self._call_with_retry(_analyze)
        except Exception as e:
            logger.error(f"Failed to analyze reflection after retries: {e}")
            raise
    
    async def recommend_lessons(
        self,
        user_progress: Dict[str, Any],
        available_lessons: List[Dict[str, Any]],
        num_recommendations: int = 5
    ) -> List[str]:
        """
        Recommend next lessons based on user progress.
        
        Args:
            user_progress: User's learning history and preferences
            available_lessons: List of available lessons
            num_recommendations: Number of lessons to recommend
            
        Returns:
            List of lesson IDs
        """
        async def _recommend():
            progress_summary = f"""
User Progress:
- Completed lessons: {user_progress.get('lessons_completed', 0)}
- Fields studied: {', '.join(user_progress.get('fields', []))}
- Average quiz score: {user_progress.get('average_score', 0)}%
- Current streak: {user_progress.get('streak', 0)} days
"""

            lessons_summary = "\n".join([
                f"- {lesson['id']}: {lesson['title']} (Field: {lesson['field']}, Difficulty: {lesson['difficulty']})"
                for lesson in available_lessons[:20]  # Limit to avoid token limits
            ])
            
            prompt = f"""{progress_summary}

Available Lessons:
{lessons_summary}

Recommend {num_recommendations} lessons that:
1. Match or slightly exceed user's current level
2. Provide variety across fields
3. Build on completed lessons
4. Maintain engagement

Return JSON array of lesson IDs:
{{"lesson_ids": ["id1", "id2", ...]}}"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI learning advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get("lesson_ids", [])
        
        try:
            return await self._call_with_retry(_recommend)
        except Exception as e:
            logger.error(f"Failed to recommend lessons after retries: {e}")
            raise
