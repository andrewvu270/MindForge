"""
LLM Service - Multi-provider LLM with automatic fallback
Primary: Groq (free, fast, 14,400 requests/day)
Fallback: OpenAI (paid, reliable)
"""
import os
import logging
import asyncio
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI, OpenAIError, RateLimitError, APITimeoutError
from groq import AsyncGroq
from datetime import datetime

from .content_models import NormalizedContent

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for AI/LLM operations with automatic provider fallback.
    
    Provider Priority:
    1. Groq (free, fast, 14,400 req/day)
    2. OpenAI (paid, reliable)
    """
    
    def __init__(
        self, 
        groq_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None, 
        hf_api_key: Optional[str] = None,
        use_mcp: bool = False,
        max_retries: int = 3,
        retry_delays: List[float] = None
    ):
        """
        Initialize LLM service.
        
        Args:
            groq_api_key: Groq API key (defaults to env var)
            openai_api_key: OpenAI API key (defaults to env var)
            hf_api_key: Hugging Face API key (defaults to env var)
            use_mcp: Whether to use MCP for development (not implemented yet)
            max_retries: Maximum number of retry attempts
            retry_delays: List of delays between retries in seconds
        """
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.hf_api_key = hf_api_key or os.getenv("HUGGINGFACE_API_KEY")
        self.use_mcp = use_mcp
        self.max_retries = max_retries
        self.retry_delays = retry_delays or [1.0, 2.0, 4.0]  # Exponential backoff
        
        # Initialize Groq client (primary)
        self.groq_client = None
        if self.groq_api_key:
            self.groq_client = AsyncGroq(api_key=self.groq_api_key)
            logger.info("Groq client initialized (primary LLM)")
        else:
            logger.warning("GROQ_API_KEY not set, will use OpenAI only")
        
        # Initialize OpenAI client (fallback)
        self.openai_client = None
        if self.openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=self.openai_api_key)
            logger.info("OpenAI client initialized (fallback LLM)")
        else:
            logger.warning("OPENAI_API_KEY not set")
        
        # For backward compatibility
        self.client = self.groq_client or self.openai_client
        
        # Hugging Face client setup (if needed)
        self.hf_client = None
        if self.hf_api_key:
            logger.info("Hugging Face API key configured for fallback")
    
    async def _call_llm(self, messages: List[Dict], model: Optional[str] = None, **kwargs):
        """
        Call LLM with automatic provider fallback.
        
        Tries Groq first, falls back to OpenAI if Groq fails.
        
        Args:
            messages: Chat messages
            model: Specific model to use (optional)
            **kwargs: Additional parameters
            
        Returns:
            LLM response
        """
        # Try Groq first (free, fast)
        if self.groq_client:
            try:
                groq_model = model or "llama-3.3-70b-versatile"
                logger.info(f"Trying Groq ({groq_model})...")
                
                response = await self.groq_client.chat.completions.create(
                    model=groq_model,
                    messages=messages,
                    **kwargs
                )
                
                logger.info(f"✅ Groq success (tokens: {response.usage.total_tokens})")
                return response
                
            except Exception as e:
                logger.warning(f"Groq failed: {e}, falling back to OpenAI...")
        
        # Fallback to OpenAI
        if self.openai_client:
            try:
                openai_model = model or "gpt-4o-mini"
                logger.info(f"Using OpenAI fallback ({openai_model})...")
                
                response = await self.openai_client.chat.completions.create(
                    model=openai_model,
                    messages=messages,
                    **kwargs
                )
                
                logger.info(f"✅ OpenAI success (tokens: {response.usage.total_tokens})")
                return response
                
            except Exception as e:
                logger.error(f"OpenAI also failed: {e}")
                raise
        
        raise Exception("No LLM providers available")
    
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
            
            prompt = f"""Synthesize these {len(contents)} sources into ONE educational lesson about {field}.

Sources:
{sources_text}

Return ONLY valid JSON with NO additional text, explanations, or formatting:
{{
    "title": "clear engaging title",
    "summary": "brief overview under 50 words",
    "content": "Detailed lesson content in Markdown format. Structure with: # Introduction, ## Core Concepts, ## Real-world Application, ## Conclusion. Use bullet points and bold text for emphasis. Do NOT use emojis.",
    "learning_objectives": ["objective 1", "objective 2", "objective 3"],
    "key_concepts": ["concept 1", "concept 2", "concept 3"]
}}

CRITICAL: Return ONLY the JSON object. No preamble, no explanation, no markdown formatting (except inside the content string), no code blocks."""

            response = await self._call_llm(
                messages=[
                    {"role": "system", "content": "You are a JSON API that returns educational lesson data. Return ONLY valid JSON with no additional text."},
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

            response = await self._call_llm(
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
            questions = []
            if isinstance(result, dict) and "questions" in result:
                questions = result["questions"]
            elif isinstance(result, list):
                questions = result
            
            # Convert correct_answer from text to index for database compatibility
            for question in questions:
                if "correct_answer" in question and "options" in question:
                    correct_answer = question["correct_answer"]
                    options = question["options"]
                    
                    # If correct_answer is text, find its index in options
                    if isinstance(correct_answer, str):
                        try:
                            # Try exact match first
                            if correct_answer in options:
                                question["correct_answer"] = options.index(correct_answer)
                            else:
                                # Try matching without letter prefix (e.g., "option 1" matches "A) option 1")
                                for i, option in enumerate(options):
                                    if correct_answer in option or option in correct_answer:
                                        question["correct_answer"] = i
                                        break
                                else:
                                    # Default to first option if no match found
                                    logger.warning(f"Could not match correct_answer '{correct_answer}' to options, defaulting to 0")
                                    question["correct_answer"] = 0
                        except Exception as e:
                            logger.warning(f"Error converting correct_answer to index: {e}, defaulting to 0")
                            question["correct_answer"] = 0
            
            return questions
        
        try:
            return await self._call_with_retry(_generate)
        except Exception as e:
            logger.error(f"Failed to generate quiz after retries: {e}")
            raise
    
    async def generate_flashcards(
        self,
        lesson_content: str,
        num_cards: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate flashcards from lesson content."""
        async def _generate():
            prompt = f"""Create {num_cards} flashcards from this lesson:

{lesson_content}

Format as JSON:
{{"flashcards": [{{"front": "What is X?", "back": "X is...", "difficulty": "easy", "topic": "topic name"}}]}}"""

            response = await self._call_llm(
                messages=[
                    {"role": "system", "content": "You are an expert at creating educational flashcards."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get("flashcards", [])
        
        try:
            return await self._call_with_retry(_generate)
        except Exception as e:
            logger.error(f"Failed to generate flashcards: {e}")
            return []
    
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

            response = await self._call_llm(
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

            response = await self._call_llm(
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

    async def generate_curriculum(
        self,
        field: str,
        num_lessons: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate a structured curriculum (path of lessons) for a field.
        
        Args:
            field: Field of study (e.g., "Technology", "Finance")
            num_lessons: Number of lessons in the path
            
        Returns:
            List of lesson topics with descriptions and difficulty
        """
        async def _generate():
            prompt = f"""Create a structured learning path (curriculum) for {field} with {num_lessons} lessons.
The path should progress from Beginner to Intermediate to Advanced.

Return ONLY valid JSON array:
[
    {{
        "title": "Lesson Title",
        "description": "Brief description of what will be covered",
        "difficulty": "Beginner",
        "key_topics": ["topic 1", "topic 2"]
    }},
    ...
]"""

            response = await self._call_llm(
                messages=[
                    {"role": "system", "content": "You are an expert curriculum designer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            if isinstance(result, dict) and "lessons" in result:
                return result["lessons"]
            elif isinstance(result, list):
                return result
            else:
                return []
        
        try:
            return await self._call_with_retry(_generate)
        except Exception as e:
            logger.error(f"Failed to generate curriculum: {e}")
            return []

# Singleton instance
_llm_service = None

def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
