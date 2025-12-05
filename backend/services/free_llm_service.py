"""
Free LLM Service using Groq API with OpenAI fallback
Completely free alternative to OpenAI/Anthropic
"""
import os
import httpx
import logging
import json
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv()

logger = logging.getLogger(__name__)


class FreeLLMService:
    """
    Free LLM service using Groq API (Llama 3.1 70B) with OpenAI fallback
    14,400 requests/day FREE tier for Groq
    """
    
    def __init__(self):
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.groq_base_url = "https://api.groq.com/openai/v1"
        self.openai_base_url = "https://api.openai.com/v1"
        self.groq_model = "llama-3.3-70b-versatile"
        self.openai_model = "gpt-3.5-turbo"
        
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY not found. Will use OpenAI fallback if available")
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not found")
        
        # Determine which service to use
        self.use_groq = bool(self.groq_api_key)
        self.use_openai = bool(self.openai_api_key)
    
    async def generate_text(
        self, 
        prompt: str, 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate text using Groq API with OpenAI fallback."""
        # Try Groq first if available
        if self.use_groq:
            result = await self._generate_with_groq(prompt, max_tokens, temperature)
            if result:
                return result
            logger.warning("Groq failed, trying OpenAI fallback...")
        
        # Fallback to OpenAI
        if self.use_openai:
            result = await self._generate_with_openai(prompt, max_tokens, temperature)
            if result:
                return result
        
        logger.error("Both Groq and OpenAI failed")
        return ""
    
    async def _generate_with_groq(
        self, 
        prompt: str, 
        max_tokens: int,
        temperature: float
    ) -> str:
        """Generate text using Groq API."""
        try:
            timeout = httpx.Timeout(15.0, connect=5.0, read=15.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.groq_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.groq_model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("✅ Groq API success")
                    return data["choices"][0]["message"]["content"]
                else:
                    error_detail = response.text
                    logger.error(f"Groq API error: {response.status_code} - {error_detail}")
                    return ""
                    
        except httpx.TimeoutException as e:
            logger.error(f"Groq API timeout: {e}")
            return ""
        except httpx.ConnectError as e:
            logger.error(f"Groq API connection failed: {e}")
            return ""
        except httpx.ReadTimeout as e:
            logger.error(f"Groq API read timeout: {e}")
            return ""
        except Exception as e:
            logger.error(f"Groq generation failed: {type(e).__name__}: {e}")
            return ""
    
    async def _generate_with_openai(
        self, 
        prompt: str, 
        max_tokens: int,
        temperature: float
    ) -> str:
        """Generate text using OpenAI API as fallback."""
        try:
            timeout = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.openai_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.openai_model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("✅ OpenAI API success (fallback)")
                    return data["choices"][0]["message"]["content"]
                else:
                    error_detail = response.text
                    logger.error(f"OpenAI API error: {response.status_code} - {error_detail}")
                    return ""
                    
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
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
        max_retries = 2
        
        for attempt in range(max_retries):
            try:
                # Strategy: Generate 3 questions at a time to avoid truncation
                all_questions = []
                batch_size = 3
                
                for batch_num in range((num_questions + batch_size - 1) // batch_size):
                    questions_needed = min(batch_size, num_questions - len(all_questions))
                    
                    prompt = f"""You are an expert educator creating quiz questions for microlearning.

Create {questions_needed} engaging multiple-choice questions that:
- Test KEY CONCEPTS from the lesson (not trivial details)
- Use clear, concise language
- Have plausible distractors (wrong answers that seem reasonable)
- Include helpful explanations

Lesson content:
{lesson_content[:800]}

Return ONLY valid JSON array (no markdown, no extra text):
[{{"question":"What is the main principle of X?","options":["A) First concept","B) Second concept","C) Third concept","D) Fourth concept"],"correct_answer":"A) First concept","explanation":"Brief reason why this is correct"}}]

Requirements:
- Questions must be specific to THIS lesson
- Options should be 3-8 words each
- Explanations should be 1 sentence
- Return complete valid JSON"""
                    
                    response = await self.generate_text(prompt, max_tokens=600, temperature=0.5)
                    
                    if not response:
                        continue
                    
                    # Try to parse
                    try:
                        batch_questions = json.loads(response)
                        if isinstance(batch_questions, list):
                            all_questions.extend(batch_questions)
                            logger.info(f"✅ Got {len(batch_questions)} questions (batch {batch_num + 1})")
                    except json.JSONDecodeError:
                        # Try repair
                        repaired = self._repair_json(response)
                        if repaired:
                            try:
                                batch_questions = json.loads(repaired)
                                if isinstance(batch_questions, list):
                                    all_questions.extend(batch_questions)
                                    logger.info(f"✅ Repaired and got {len(batch_questions)} questions")
                            except:
                                logger.warning(f"Batch {batch_num + 1} failed, continuing...")
                    
                    # Stop if we have enough
                    if len(all_questions) >= num_questions:
                        break
            
                if len(all_questions) > 0:
                    logger.info(f"✅ Total: {len(all_questions)} quiz questions generated")
                    return all_questions[:num_questions]
                else:
                    if attempt < max_retries - 1:
                        logger.warning(f"No questions generated, retrying (attempt {attempt + 1}/{max_retries})...")
                        continue
                    else:
                        logger.error("No questions generated after retries, using fallback")
                        return self._get_fallback_quiz()
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Quiz generation failed (attempt {attempt + 1}/{max_retries}): {e}")
                    continue
                else:
                    logger.error(f"Quiz generation failed after retries: {e}")
                    return self._get_fallback_quiz()
        
        return self._get_fallback_quiz()
    
    def _repair_json(self, text: str) -> Optional[str]:
        """Attempt to repair incomplete JSON by closing unterminated strings/arrays"""
        try:
            # Strategy 1: Find last complete object and close array
            last_brace = text.rfind('}')
            if last_brace == -1:
                return None
            
            # Take everything up to and including the last }
            repaired = text[:last_brace + 1]
            
            # Count open brackets to close array properly
            open_brackets = repaired.count('[') - repaired.count(']')
            if open_brackets > 0:
                repaired += ']' * open_brackets
            
            # Validate it's proper JSON
            try:
                json.loads(repaired)
                return repaired
            except:
                pass
            
            # Strategy 2: Try to find last complete question with all fields
            # Look for pattern: }] or }, to find end of previous question
            patterns = ['},', '}]']
            for pattern in patterns:
                last_pos = repaired.rfind(pattern)
                if last_pos != -1:
                    attempt = repaired[:last_pos + 1] + ']'
                    try:
                        json.loads(attempt)
                        return attempt
                    except:
                        continue
            
            return None
        except Exception as e:
            logger.error(f"JSON repair failed: {e}")
            return None
    
    def _get_fallback_quiz(self) -> List[Dict]:
        """Return fallback quiz when generation fails"""
        logger.warning("⚠️  Using fallback quiz")
        return [{
            "question": "What is the main topic?",
            "options": ["A) Technology", "B) Finance", "C) Economics", "D) Culture"],
            "correct_answer": "A) Technology",
            "explanation": "Based on lesson content"
        }]
    
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
