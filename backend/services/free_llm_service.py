"""
Free LLM Service using Groq API
Completely free alternative to OpenAI/Anthropic
"""
import os
import httpx
import logging
import json
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class FreeLLMService:
    """
    Free LLM service using Groq API (Llama 3.1 70B)
    14,400 requests/day FREE tier
    """
    
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.base_url = "https://api.groq.com/openai/v1"
        # Use the latest stable Llama model
        self.model = "llama-3.3-70b-versatile"
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found. Set it in .env file")
    
    async def generate_text(
        self, 
        prompt: str, 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate text using Groq API."""
        try:
            # Use shorter timeout to avoid hanging
            timeout = httpx.Timeout(10.0, connect=5.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error_detail = response.text
                    logger.error(f"Groq API error: {response.status_code} - {error_detail}")
                    return ""
                    
        except httpx.TimeoutException:
            logger.error("Groq API timeout - connection too slow or API unavailable")
            return ""
        except httpx.ConnectError as e:
            logger.error(f"Groq API connection failed: {e}")
            return ""
        except Exception as e:
            logger.error(f"Free LLM generation failed: {e}")
            return ""
    
    async def synthesize_lesson(
        self, 
        sources: List[Dict], 
        field: str,
        max_words: int = 300
    ) -> Dict:
        """Synthesize lesson from multiple sources."""
        try:
            # Prepare source content
            source_text = ""
            for i, source in enumerate(sources[:5]):
                source_text += f"\nSource {i+1}:\n"
                source_text += source.get('content', '')[:500]
            
            prompt = f"""Synthesize a {max_words}-word educational lesson about {field}.

Sources:
{source_text}

Create a lesson with:
1. Engaging title
2. Clear explanation
3. Key concepts
4. Learning objectives

Format as JSON:
{{
    "title": "Lesson title",
    "content": "Main lesson content ({max_words} words max)",
    "key_concepts": ["concept1", "concept2", "concept3"],
    "learning_objectives": ["objective1", "objective2"]
}}"""
            
            response = await self.generate_text(prompt, max_tokens=800)
            
            # Parse JSON response
            try:
                lesson_data = json.loads(response)
                return lesson_data
            except json.JSONDecodeError:
                # Fallback
                return {
                    "title": f"Latest Insights in {field}",
                    "content": response[:max_words * 6],
                    "key_concepts": [field.lower(), "trends"],
                    "learning_objectives": [f"Understand {field} fundamentals"]
                }
                
        except Exception as e:
            logger.error(f"Lesson synthesis failed: {e}")
            return {
                "title": f"Introduction to {field}",
                "content": "This lesson covers the fundamentals.",
                "key_concepts": [field.lower()],
                "learning_objectives": [f"Learn about {field}"]
            }
    
    async def generate_quiz(
        self, 
        lesson_content: str, 
        num_questions: int = 5
    ) -> List[Dict]:
        """Generate quiz questions from lesson content."""
        try:
            prompt = f"""Generate {num_questions} multiple choice questions from this lesson:

{lesson_content}

Format as JSON array:
[
    {{
        "question": "Question text?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correct_answer": "A) Option 1",
        "explanation": "Why this is correct"
    }}
]"""
            
            response = await self.generate_text(prompt, max_tokens=600)
            
            try:
                questions = json.loads(response)
                return questions[:num_questions]
            except json.JSONDecodeError:
                return [{
                    "question": "What is the main topic?",
                    "options": ["A) Technology", "B) Finance", "C) Economics", "D) Culture"],
                    "correct_answer": "A) Technology",
                    "explanation": "Based on lesson content"
                }]
                
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            return []
    
    async def extract_topics(self, text: str) -> List[str]:
        """Extract key topics from text (for reflection analysis)."""
        try:
            prompt = f"""Analyze this user reflection and extract key learning topics they're interested in.

User's reflection:
{text}

Extract:
1. Explicit topics mentioned (e.g., "I want to learn blockchain")
2. Implicit interests (e.g., "struggling with finances" → "personal finance")
3. Skills they want to develop
4. Problems they want to solve

Return 3-5 specific, actionable topics as a comma-separated list.
Focus on educational topics we can create lessons about.

Topics:"""
            
            response = await self.generate_text(prompt, max_tokens=100)
            topics = [t.strip().lower() for t in response.split(',')]
            return [t for t in topics if len(t) > 2][:5]
            
        except Exception as e:
            logger.error(f"Topic extraction failed: {e}")
            return []
    
    async def generate_flashcards(
        self, 
        lesson_content: str, 
        num_cards: int = 10
    ) -> List[Dict]:
        """Generate flashcards from lesson content."""
        try:
            prompt = f"""Generate {num_cards} flashcards from this lesson:

{lesson_content}

Format as JSON array:
[
    {{
        "topic": "Main topic",
        "front": "Question or term",
        "back": "Answer or definition",
        "difficulty": "easy|medium|hard"
    }}
]"""
            
            response = await self.generate_text(prompt, max_tokens=800)
            
            try:
                flashcards = json.loads(response)
                return flashcards[:num_cards]
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Flashcard generation failed: {e}")
            return []
    
    async def analyze_reflection_deep(self, text: str) -> Dict:
        """
        Deep analysis of user reflection to extract:
        - Topics of interest
        - Learning goals
        - Knowledge gaps
        - Emotional state
        - Difficulty level preference
        """
        try:
            prompt = f"""Analyze this user's learning reflection deeply:

"{text}"

Extract and return as JSON:
{{
    "topics": ["topic1", "topic2", "topic3"],
    "learning_goals": ["goal1", "goal2"],
    "knowledge_gaps": ["gap1", "gap2"],
    "difficulty_preference": "beginner|intermediate|advanced",
    "interests": ["interest1", "interest2"],
    "challenges": ["challenge1", "challenge2"]
}}

Focus on actionable insights for content generation."""
            
            response = await self.generate_text(prompt, max_tokens=300)
            
            try:
                analysis = json.loads(response)
                return analysis
            except json.JSONDecodeError:
                # Fallback to simple topic extraction
                topics = await self.extract_topics(text)
                return {
                    "topics": topics,
                    "learning_goals": [],
                    "knowledge_gaps": [],
                    "difficulty_preference": "intermediate",
                    "interests": topics,
                    "challenges": []
                }
                
        except Exception as e:
            logger.error(f"Deep reflection analysis failed: {e}")
            return {
                "topics": [],
                "learning_goals": [],
                "knowledge_gaps": [],
                "difficulty_preference": "intermediate",
                "interests": [],
                "challenges": []
            }


# Singleton instance
_free_llm_service = None

def get_free_llm_service() -> FreeLLMService:
    """Get or create the free LLM service instance."""
    global _free_llm_service
    if _free_llm_service is None:
        _free_llm_service = FreeLLMService()
    return _free_llm_service
