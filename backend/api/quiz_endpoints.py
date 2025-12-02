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
        
        # Generate quiz using AI agent
        quiz_response = await quiz_agent.execute({
            "lesson_content": request.lesson_content,
            "num_questions": request.num_questions
        })
        
        if quiz_response.status != "completed":
            raise HTTPException(
                status_code=500,
                detail=f"Quiz generation failed: {quiz_response.error}"
            )
        
        questions = quiz_response.result.get("questions", [])
        
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
        try:
            client = db.get_client()
            
            # Store each question
            for question in questions:
                quiz_data = {
                    "id": str(uuid.uuid4()),
                    "lesson_id": request.lesson_id,
                    "question": question.get("question"),
                    "options": question.get("options", []),
                    "correct_answer": question.get("correct_answer"),
                    "explanation": question.get("explanation"),
                    "points": 5,
                    "created_at": datetime.now().isoformat()
                }
                client.table("quizzes").insert(quiz_data).execute()
            
            logger.info(f"Stored quiz {quiz_id} with {len(questions)} questions")
            
        except Exception as e:
            logger.warning(f"Failed to store quiz in database: {e}")
            # Continue even if storage fails
        
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
        logger.error(f"Quiz generation failed: {e}", exc_info=True)
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
        logger.info(f"Processing quiz submission for user {request.user_id}")
        
        # Fetch quiz questions from database
        client = db.get_client()
        response = client.table("quizzes").select("*").eq("lesson_id", request.quiz_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        questions = response.data
        
        # Calculate score
        correct_answers = []
        incorrect_answers = []
        feedback = {}
        
        for question in questions:
            question_id = question["id"]
            correct_answer = question["correct_answer"]
            user_answer = request.answers.get(question_id, "")
            
            if user_answer == correct_answer:
                correct_answers.append(question_id)
                feedback[question_id] = f"✓ Correct! {question.get('explanation', '')}"
            else:
                incorrect_answers.append(question_id)
                feedback[question_id] = f"✗ Incorrect. The correct answer is: {correct_answer}. {question.get('explanation', '')}"
        
        score = len(correct_answers)
        total_questions = len(questions)
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
                "score": score,
                "total_questions": total_questions,
                "percentage": percentage,
                "points_earned": points_earned,
                "completed_at": datetime.now().isoformat()
            }
            client.table("quiz_attempts").insert(result_data).execute()
            
            # Update user progress
            # TODO: Implement user progress update
            
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
        client = db.get_client()
        response = client.table("quizzes").select("*").eq("lesson_id", lesson_id).execute()
        
        return {"questions": response.data, "count": len(response.data)}
        
    except Exception as e:
        logger.error(f"Failed to fetch quiz for lesson {lesson_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quiz: {str(e)}"
        )
