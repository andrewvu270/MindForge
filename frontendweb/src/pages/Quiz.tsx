import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import LottieEnhanced, { LottieLoader, LottieCelebration } from '../components/LottieEnhanced';
import Confetti from '../components/Confetti';

export default function Quiz() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!lessonId) return;
      
      try {
        // First get the lesson
        const lesson = await apiService.getLesson(lessonId);
        
        // Try to get existing quiz
        const quizData = await apiService.getQuiz(lessonId);
        
        if (quizData && quizData.questions && quizData.questions.length > 0) {
          // Select random 5 questions from the pool
          const questionPool = [...quizData.questions];
          const numQuestions = Math.min(5, questionPool.length);
          
          // Shuffle and take first N questions
          const selectedQuestions = questionPool
            .sort(() => Math.random() - 0.5)
            .slice(0, numQuestions);
          
          // Randomize options for each selected question
          const randomizedQuiz = {
            ...quizData,
            questions: selectedQuestions.map(q => ({
              ...q,
              options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : []
            }))
          };
          
          setQuiz(randomizedQuiz);
        } else {
          // Generate quiz if none exists
          const generated = await apiService.generateQuiz(lessonId, lesson.content);
          setQuiz(generated);
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuiz();
  }, [lessonId]);

  const handleSubmit = async () => {
    try {
      // Format answers as { question_id: selected_answer }
      const formattedAnswers: { [key: string]: string } = {};
      Object.entries(answers).forEach(([questionIndex, optionIndex]) => {
        const question = questions[parseInt(questionIndex)];
        if (question && question.options) {
          formattedAnswers[question.id] = question.options[optionIndex];
        }
      });
      
      const submission = { 
        quiz_id: lessonId!, 
        user_id: 'user_1', 
        answers: formattedAnswers
      };
      
      const res = await apiService.submitQuiz(submission);
      setResult(res);
      
      // Mark lesson as complete if user passes with 60% or more (3/5 questions)
      if (res.percentage >= 60 && lessonId) {
        try {
          await apiService.completeLesson(lessonId, 'user_1');
        } catch (error) {
          console.error('Error completing lesson:', error);
        }
      }
      
      // Show celebration if passing
      if (res.percentage >= 70) {
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <LottieLoader message="Preparing your quiz..." animation="loading" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xl text-muted">Quiz not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-6">Go Back</button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const q = questions[currentQ];

  // Results screen
  if (result) {
    const isPassing = result.percentage >= 70;
    const isPerfect = result.percentage === 100;
    
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        
        {/* Celebration overlay - using existing Lottie */}
        {showCelebration && (
          <>
            <Confetti />
            <LottieCelebration
              message={isPerfect ? 'Perfect Score!' : 'Great Job!'}
              onComplete={() => setShowCelebration(false)}
            />
          </>
        )}
        
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className={`card text-center py-12 ${isPassing ? 'card-sage' : 'card-coral'} animate-scale-in`}>
            {/* Lottie animation instead of emoji */}
            <div className="flex justify-center mb-4">
              <LottieEnhanced 
                animation={isPerfect ? "trophy" : isPassing ? "success" : "book"} 
                size="lg" 
                loop={false}
              />
            </div>
            <h1 className="text-3xl font-semibold text-charcoal mb-2">
              {isPassing ? 'Great job!' : 'Keep learning!'}
            </h1>
            <div className="text-6xl font-semibold text-charcoal my-6">{Math.round(result.percentage)}%</div>
            <p className="text-muted mb-4">
              {result.score} of {result.total_questions} correct
            </p>
            
            {/* Points earned - using Lottie star instead of emoji */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-honey-light rounded-full mb-8">
              <LottieEnhanced animation="star" size="sm" />
              <span className="font-semibold text-charcoal">+{result.points_earned} points</span>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(`/lessons/${lessonId}`)} className="btn-secondary">
                Back to Lesson
              </button>
              <button onClick={() => navigate('/lessons')} className="btn-primary">
                Browse Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-semibold text-charcoal">Quiz</h1>
            <span className="text-sm text-muted">{currentQ + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-cream-dark rounded-full h-1.5">
            <div 
              className="bg-coral h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} 
            />
          </div>
        </div>

        {/* Question */}
        <div className="card mb-8 animate-scale-in">
          <h2 className="text-xl font-semibold text-charcoal mb-6">{q?.question}</h2>
          <div className="space-y-3">
            {q?.options?.map((opt: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setAnswers({ ...answers, [currentQ]: i })} 
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                  answers[currentQ] === i 
                    ? 'border-charcoal bg-cream' 
                    : 'border-cream-dark hover:border-muted-light bg-warm-white'
                }`}
              >
                <span className="font-medium text-charcoal">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button 
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} 
            disabled={currentQ === 0} 
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQ(currentQ + 1)} 
              disabled={answers[currentQ] === undefined} 
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={Object.keys(answers).length !== questions.length} 
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
