import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import { LottieLoader } from '../components/LottieEnhanced';

export default function Reflection() {
  const [prompt, setPrompt] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiService.getDailyReflection(),
      apiService.getLessons(''),
    ]).then(([reflectionData, lessons]) => {
      setPrompt(reflectionData);
      setRecentLessons(lessons.slice(0, 3));
      if (reflectionData.submitted) {
        setResponse(reflectionData.user_response || '');
        setFeedback(reflectionData.feedback);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setSubmitting(true);
    try {
      const result = await apiService.submitReflection('user_1', response);
      setFeedback(result.feedback);

      // Analyze reflection for topics (FREE)
      try {
        const analysis = await apiService.analyzeReflection('user_1', response);
        console.log('Analysis:', analysis);
      } catch (e) {
        console.error('Topic analysis failed:', e);
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <LottieLoader message="Loading reflection..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-coral font-medium mb-1">Daily practice</p>
              <h1 className="text-3xl font-semibold text-charcoal">Reflection</h1>
            </div>
            <Link to="/reflection/history" className="text-sm text-muted hover:text-charcoal">
              View history
            </Link>
          </div>
          <p className="text-muted">
            Connect what you've learned to your real life. This helps move knowledge from short-term to long-term memory.
          </p>
        </div>

        {/* What you learned today */}
        {!feedback && recentLessons.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted mb-3">Recent lessons to reflect on:</p>
            <div className="flex flex-wrap gap-2">
              {recentLessons.map((lesson) => (
                <span key={lesson.id} className="text-xs px-3 py-1.5 bg-sky-light text-sky rounded-full">
                  {lesson.title?.slice(0, 30)}...
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prompt */}
        <div className="card-honey mb-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-3">Today's prompt</p>
          <p className="text-lg text-charcoal leading-relaxed">
            {prompt?.prompt || 'Think about something you learned recently. How could you apply it in your work or life this week?'}
          </p>
        </div>

        {/* Response Form */}
        {!feedback && (
          <div className="card mb-6">
            <label className="block text-sm font-medium text-charcoal mb-3">Your response</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your thoughts here. Be specific about how you'll apply what you learned..."
              className="input h-40 resize-none mb-4"
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">{response.length} characters · aim for 100+</span>
              <button
                onClick={handleSubmit}
                disabled={!response.trim() || response.length < 20 || submitting}
                className="btn-primary disabled:opacity-40"
              >
                {submitting ? 'Analyzing...' : 'Submit reflection'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="space-y-4">
            {/* Score and summary */}
            <div className="card-sage">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Reflection quality</p>
                  <div className="text-3xl font-semibold text-charcoal">{feedback.quality_score}/100</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted mb-1">Streak bonus</p>
                  <p className="text-lg font-semibold text-sage">+5 days</p>
                </div>
              </div>
              <div className="w-full bg-warm-white rounded-full h-2 mb-4">
                <div className="bg-sage h-full rounded-full transition-all" style={{ width: `${feedback.quality_score}%` }} />
              </div>
              <p className="text-charcoal">{feedback.feedback_text}</p>
            </div>

            {/* What you did well */}
            {feedback.strengths?.length > 0 && (
              <div className="card">
                <p className="text-sm font-medium text-charcoal mb-3">What you did well</p>
                <ul className="space-y-2">
                  {feedback.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-sage flex-shrink-0">+</span>
                      <span className="text-muted">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to explore */}
            {feedback.areas_for_growth?.length > 0 && (
              <div className="card">
                <p className="text-sm font-medium text-charcoal mb-3">To deepen your understanding</p>
                <ul className="space-y-2">
                  {feedback.areas_for_growth.map((a: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-coral flex-shrink-0">→</span>
                      <span className="text-muted">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next steps */}
            <div className="card bg-lavender-light">
              <p className="text-sm font-medium text-charcoal mb-3">What's next?</p>
              <p className="text-sm text-muted mb-4">
                Your reflection has been saved. Come back tomorrow for a new prompt.
                Consistent reflection builds deeper understanding over time.
              </p>
              <div className="flex gap-3">
                <Link to="/flashcards" className="btn-secondary text-sm">
                  Review flashcards
                </Link>
                <Link to="/dashboard" className="btn-primary text-sm">
                  Back to learning
                </Link>
              </div>
            </div>

            {/* Your response */}
            <div className="card">
              <p className="text-sm font-medium text-charcoal mb-3">Your response</p>
              <p className="text-sm text-muted whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}

        {/* Why reflect - only show before submission */}
        {!feedback && (
          <div className="p-6 bg-sky-light rounded-2xl">
            <p className="text-sm font-medium text-charcoal mb-2">Why reflect?</p>
            <ul className="text-sm text-muted space-y-2">
              <li>• Reflection activates deeper processing in your brain</li>
              <li>• Connecting new info to your life makes it stick</li>
              <li>• Writing forces you to clarify your thinking</li>
              <li>• Regular reflection builds a habit of learning</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
