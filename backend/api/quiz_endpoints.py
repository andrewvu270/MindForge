"""
API endpoints for quiz generation and submission
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
import uuid
from datetime import datetime

from services.llm_service import LLMService
from agents.quiz_generation_agent import QuizGenerationAgent
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

# Initialize services
llm_service = LLMService()
quiz_agent = QuizGenerationAgent(llm_service)


class QuizGenerationRequest(BaseModel):
    lesson_id: str
    lesson_content: str
    num_questions: int = 5


class QuizSubmissionRequest(BaseModel):
    quiz_id: str
    user_id: str
    answers: Dict[str, str]  # question_id -> selected_answer


class QuizGenerationResponse(BaseModel):
    quiz_id: str
    lesson_id: str
    questions: List[Dict]
    metadata: Dict


class QuizSubmissionResponse(BaseModel):
    quiz_id: str
    user_id: str
    score: int
    total_questions: int
    percentage: float
    correct_answers: List[str]
    incorrect_answers: List[str]
    feedback: Dict[str, str]
    points_earned: int


def generate_fallback_questions(lesson_content: str, num_questions: int = 5) -> List[Dict]:
    """Generate simple fallback questions when LLM fails."""
    # Handle empty or very short content
    if not lesson_content or len(lesson_content) < 50:
        return [{
            "question": "What was the main topic of this lesson?",
            "options": ["A) The content covered", "B) Unrelated topic", "C) Another subject", "D) None"],
            "correct_answer": 0,  # Index of correct option
            "explanation": "Review the lesson for details."
        }]
    
    # Extract key sentences from content for basic questions
    sentences = [s.strip() for s in lesson_content.split('.') if len(s.strip()) > 20]
    
    # Limit to requested number
    sentences = sentences[:num_questions] if sentences else []
    
    questions = []
    for i, sentence in enumerate(sentences):
        # Clean up the sentence
        clean_sentence = sentence[:100] + "..." if len(sentence) > 100 else sentence
        option_a = f"A) {clean_sentence}"
        
        questions.append({
            "question": f"Question {i+1}: Based on the lesson, which statement is correct?",
            "options": [
                option_a,
                "B) This topic was not covered in the lesson",
                "C) The opposite of what was stated",
                "D) None of the above"
            ],
            "correct_answer": 0,  # Index of correct option (first one)
            "explanation": "This was directly stated in the lesson content."
        })
    
    # Ensure we have at least one question
    if not questions:
        questions = [{
            "question": "What was the main topic of this lesson?",
            "options": ["A) The content covered", "B) Unrelated topic", "C) Another subject", "D) None"],
            "correct_answer": 0,  # Index of correct option
            "explanation": "Review the lesson for details."
        }]
    
    return questions


@router.post("/generate", response_model=QuizGenerationResponse)
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate quiz questions from lesson content using AI.
    
    Args:
        request: Quiz generation parameters
        
    Returns:
        Generated quiz with questions
    """
    try:
        logger.info(f"Generating quiz for lesson {request.lesson_id}")
        
        questions = []
        
        # Try AI generation first
        try:
            quiz_response = await quiz_agent.execute({
                "lesson_content": request.lesson_content,
                "num_questions": request.num_questions
            })
            
            if quiz_response.status == "completed":
                questions = quiz_response.result.get("questions", [])
            else:
                logger.warning(f"AI quiz generation failed: {quiz_response.error}, using fallback")
        except Exception as e:
            logger.warning(f"AI quiz generation error: {e}, using fallback")
        
        # Use fallback if AI failed
        if not questions:
            logger.info("Using fallback quiz generation")
            questions = generate_fallback_questions(request.lesson_content, request.num_questions)
        
        if not questions:
            raise HTTPException(
                status_code=500,
                detail="No questions were generated"
            )
        
        # Assign IDs to questions
        quiz_id = str(uuid.uuid4())
        for i, question in enumerate(questions):
            question["id"] = f"{quiz_id}_q{i+1}"
            question["quiz_id"] = quiz_id
            question["lesson_id"] = request.lesson_id
        
        # Store quiz in database
        stored_count = 0
        try:
            client = db.client
            
            # Store each question with the DB-generated ID
            for question in questions:
                db_id = str(uuid.uuid4())
                quiz_data = {
                    "id": db_id,
                    "lesson_id": request.lesson_id,
                    "question": question.get("question"),
                    "options": question.get("options", []),
                    "correct_answer": question.get("correct_answer"),
                    "explanation": question.get("explanation"),
                    "points": 5,
                    "created_at": datetime.now().isoformat()
                }
                result = client.table("quizzes").insert(quiz_data).execute()
                if result.data:
                    # Update question ID to match DB ID for frontend
                    question["id"] = db_id
                    stored_count += 1
                    logger.info(f"Stored question {db_id}")
            
            logger.info(f"Stored {stored_count}/{len(questions)} quiz questions for lesson {request.lesson_id}")
            
        except Exception as e:
            logger.error(f"Failed to store quiz in database: {e}")
            # If storage fails, questions won't be found on submit
            # But we still return them so user can take the quiz
        
        return QuizGenerationResponse(
            quiz_id=quiz_id,
            lesson_id=request.lesson_id,
            questions=questions,
            metadata={
                "num_questions": len(questions),
                "generated_at": datetime.now().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Quiz generation failed: {e}\n{error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.post("/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(request: QuizSubmissionRequest):
    """
    Submit quiz answers and calculate score with feedback.
    
    Args:
        request: Quiz submission with user answers
        
    Returns:
        Quiz results with score and feedback
    """
    try:
        logger.info(f"Processing quiz submission for user {request.user_id}, quiz_id: {request.quiz_id}")
        
        # Fetch quiz questions from database
        # Note: quiz_id is actually the lesson_id in our system
        client = db.client
        lesson_id = request.quiz_id  # Frontend sends lesson_id as quiz_id
        response = client.table("quizzes").select("*").eq("lesson_id", lesson_id).execute()
        
        if not response.data:
            logger.warning(f"No quiz questions found for lesson_id: {lesson_id}")
            # Return empty result instead of 404 to avoid breaking the frontend
            return QuizSubmissionResponse(
                quiz_id=request.quiz_id,
                user_id=request.user_id,
                score=0,
                total_questions=0,
                percentage=0,
                correct_answers=[],
                incorrect_answers=[],
                feedback={"error": "No quiz questions found. Please generate a quiz first."},
                points_earned=0
            )
        
        all_questions = response.data
        logger.info(f"Found {len(all_questions)} questions in database for lesson {lesson_id}")
        logger.info(f"User submitted answers for {len(request.answers)} questions")
        logger.info(f"User answers: {request.answers}")
        
        # Log question IDs from database for debugging
        db_question_ids = [q["id"] for q in all_questions]
        logger.info(f"Database question IDs: {db_question_ids}")
        logger.info(f"Submitted question IDs: {list(request.answers.keys())}")
        
        # Build a lookup of all questions by ID
        questions_by_id = {q["id"]: q for q in all_questions}
        
        # Calculate score - only for questions the user actually answered
        correct_answers = []
        incorrect_answers = []
        feedback = {}
        
        for question_id, user_answer in request.answers.items():
            question = questions_by_id.get(question_id)
            
            if not question:
                logger.warning(f"Question {question_id} not found in database. Available IDs: {db_question_ids[:3]}...")
                continue
            
            correct_answer = question["correct_answer"]
            
            logger.info(f"Comparing Q: {question_id[:8]}..., User: '{user_answer[:50] if user_answer else 'None'}...', Correct: '{str(correct_answer)[:50]}...'")
            
            # Handle both integer index and text correct_answer formats
            is_correct = False
            options = question.get("options", [])
            
            if isinstance(correct_answer, int):
                # correct_answer is an index - compare with the option at that index
                if 0 <= correct_answer < len(options):
                    correct_text = options[correct_answer]
                    is_correct = user_answer == correct_text
                    correct_answer_display = correct_text
                else:
                    correct_answer_display = f"Option {correct_answer}"
            else:
                # correct_answer is text - direct comparison
                is_correct = user_answer == correct_answer
                correct_answer_display = correct_answer
            
            if is_correct:
                correct_answers.append(question_id)
                feedback[question_id] = f"✓ Correct! {question.get('explanation', '')}"
            else:
                incorrect_answers.append(question_id)
                feedback[question_id] = f"✗ Incorrect. The correct answer is: {correct_answer_display}. {question.get('explanation', '')}"
        
        score = len(correct_answers)
        total_questions = len(request.answers)  # Only count questions user actually answered
        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        
        # Calculate points earned
        base_points = score * 5  # 5 points per correct answer
        bonus_points = 10 if percentage == 100 else 0  # Perfect score bonus
        points_earned = base_points + bonus_points
        
        # Store quiz result
        try:
            result_data = {
                "id": str(uuid.uuid4()),
                "user_id": request.user_id,
                "quiz_id": request.quiz_id,
                "lesson_id": request.quiz_id,  # Using quiz_id as lesson_id for now
                "score": score,
                "total_questions": total_questions,
                "percentage": percentage,
                "points_earned": points_earned,
                "completed_at": datetime.now().isoformat()
            }
            client.table("quiz_attempts").insert(result_data).execute()
            
            # Update user stats
            try:
                # Get current stats
                stats_response = client.table("user_stats").select("*").eq("user_id", request.user_id).execute()
                
                if stats_response.data:
                    # Update existing stats
                    current_stats = stats_response.data[0]
                    
                    # Mark lesson as completed if score is 80% or higher (4/5 or 5/5)
                    lessons_completed_increment = 1 if percentage >= 80 else 0
                    
                    updated_stats = {
                        "total_points": current_stats.get("total_points", 0) + points_earned,
                        "quizzes_completed": current_stats.get("quizzes_completed", 0) + 1,
                        "quizzes_passed": current_stats.get("quizzes_passed", 0) + (1 if percentage >= 70 else 0),
                        "perfect_scores": current_stats.get("perfect_scores", 0) + (1 if percentage == 100 else 0),
                        "total_questions_answered": current_stats.get("total_questions_answered", 0) + total_questions,
                        "correct_answers": current_stats.get("correct_answers", 0) + score,
                        "lessons_completed": current_stats.get("lessons_completed", 0) + lessons_completed_increment,
                        "updated_at": datetime.now().isoformat()
                    }
                    client.table("user_stats").update(updated_stats).eq("user_id", request.user_id).execute()
                    
                    if lessons_completed_increment > 0:
                        logger.info(f"✅ Lesson completed! User {request.user_id} now has {updated_stats['lessons_completed']} lessons")
                else:
                    # Create new stats
                    new_stats = {
                        "id": str(uuid.uuid4()),
                        "user_id": request.user_id,
                        "total_points": points_earned,
                        "quizzes_completed": 1,
                        "quizzes_passed": 1 if percentage >= 70 else 0,
                        "perfect_scores": 1 if percentage == 100 else 0,
                        "total_questions_answered": total_questions,
                        "correct_answers": score,
                        "lessons_completed": 0,
                        "current_streak": 0,
                        "longest_streak": 0,
                        "created_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat()
                    }
                    client.table("user_stats").insert(new_stats).execute()
                
                logger.info(f"Updated user stats for {request.user_id}")
            except Exception as e:
                logger.warning(f"Failed to update user stats: {e}")
            
            logger.info(f"Stored quiz result: {score}/{total_questions} ({percentage}%)")
            
        except Exception as e:
            logger.warning(f"Failed to store quiz result: {e}")
        
        return QuizSubmissionResponse(
            quiz_id=request.quiz_id,
            user_id=request.user_id,
            score=score,
            total_questions=total_questions,
            percentage=percentage,
            correct_answers=correct_answers,
            incorrect_answers=incorrect_answers,
            feedback=feedback,
            points_earned=points_earned
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz submission failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Quiz submission failed: {str(e)}"
        )


@router.get("/{lesson_id}")
async def get_quiz_for_lesson(lesson_id: str):
    """
    Get quiz questions for a specific lesson.
    
    Args:
        lesson_id: Lesson ID
        
    Returns:
        Quiz questions
    """
    try:
        client = db.client
        response = client.table("quizzes").select("*").eq("lesson_id", lesson_id).execute()
        
        return {"questions": response.data, "count": len(response.data)}
        
    except Exception as e:
        logger.error(f"Failed to fetch quiz for lesson {lesson_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz: {str(e)}"
        )


# ============================================
# Flashcard Endpoints
# ============================================

class FlashcardGenerationRequest(BaseModel):
    lesson_id: str
    lesson_content: str
    num_cards: int = 10


@router.post("/flashcards/generate")
async def generate_flashcards(request: FlashcardGenerationRequest):
    """
    Generate flashcards from lesson content using AI.
    
    Args:
        request: Flashcard generation parameters
        
    Returns:
        Generated flashcards
    """
    try:
        logger.info(f"Generating flashcards for lesson {request.lesson_id}")
        
        # Generate flashcards using LLM
        flashcards = await llm_service.generate_flashcards(
            lesson_content=request.lesson_content,
            num_cards=request.num_cards
        )
        
        if not flashcards:
            raise HTTPException(
                status_code=500,
                detail="No flashcards were generated"
            )
        
        # Store flashcards in database
        try:
            client = db.client
            
            # Get field_id from lesson
            lesson_response = client.table("lessons").select("field_id").eq("id", request.lesson_id).execute()
            field_id = lesson_response.data[0]["field_id"] if lesson_response.data else "tech"
            
            for card in flashcards:
                flashcard_data = {
                    "id": str(uuid.uuid4()),
                    "lesson_id": request.lesson_id,
                    "field_id": field_id,
                    "front": card.get("front"),
                    "back": card.get("back"),
                    "difficulty": card.get("difficulty", "medium"),
                    "topic": card.get("topic", "General"),
                    "created_at": datetime.now().isoformat()
                }
                client.table("flashcards").insert(flashcard_data).execute()
            
            logger.info(f"Stored {len(flashcards)} flashcards for lesson {request.lesson_id}")
            
        except Exception as e:
            logger.warning(f"Failed to store flashcards in database: {e}")
        
        return {
            "flashcards": flashcards,
            "count": len(flashcards),
            "lesson_id": request.lesson_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flashcard generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Flashcard generation failed: {str(e)}"
        )


@router.get("/flashcards")
async def get_all_flashcards(field_id: Optional[str] = None, limit: int = 50):
    """
    Get all flashcards, optionally filtered by field.
    
    Args:
        field_id: Optional field filter
        limit: Maximum number of flashcards
        
    Returns:
        Flashcards
    """
    try:
        client = db.client
        query = client.table("flashcards").select("*")
        
        if field_id:
            query = query.eq("field_id", field_id)
        
        # Try to order by created_at, but don't fail if column doesn't exist
        try:
            query = query.limit(limit).order("created_at", desc=True)
        except:
            query = query.limit(limit)
            
        response = query.execute()
        
        # Return empty array if no data instead of failing
        flashcards = response.data if response.data else []
        return {"flashcards": flashcards, "count": len(flashcards)}
        
    except Exception as e:
        logger.error(f"Failed to fetch flashcards: {e}")
        import traceback
        logger.error(traceback.format_exc())
        # Return empty result instead of 500 error
        return {"flashcards": [], "count": 0, "error": str(e)}


@router.get("/flashcards/{lesson_id}")
async def get_flashcards_for_lesson(lesson_id: str):
    """
    Get flashcards for a specific lesson.
    
    Args:
        lesson_id: Lesson ID
        
    Returns:
        Flashcards
    """
    try:
        client = db.client
        response = client.table("flashcards").select("*").eq("lesson_id", lesson_id).execute()
        
        return {"flashcards": response.data, "count": len(response.data)}
        
    except Exception as e:
        logger.error(f"Failed to fetch flashcards for lesson {lesson_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch flashcards: {str(e)}"
        )
