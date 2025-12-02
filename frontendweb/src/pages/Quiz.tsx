import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Quiz() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) apiService.getQuiz(lessonId).then(setQuiz).catch(console.error).finally(() => setLoading(false));
  }, [lessonId]);

  const handleSubmit = async () => {
    const submission = { 
      quiz_id: quiz.id, 
      user_id: 'user_1', 
      answers: Object.entries(answers).map(([q, a]) => ({ 
        question_id: quiz.questions[parseInt(q)].id, 
        selected_option: a 
      })) 
    };
    const res = await apiService.submitQuiz(submission);
    setResult(res);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
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
    const isPassing = result.score >= 70;
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className={`card text-center py-12 ${isPassing ? 'card-sage' : 'card-coral'}`}>
            <div className="text-6xl mb-4">{isPassing ? '🎉' : '📚'}</div>
            <h1 className="text-3xl font-semibold text-charcoal mb-2">
              {isPassing ? 'Great job!' : 'Keep learning!'}
            </h1>
            <div className="text-6xl font-semibold text-charcoal my-6">{result.score}%</div>
            <p className="text-muted mb-8">
              {result.correct_count} of {result.total_questions} correct
            </p>
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
