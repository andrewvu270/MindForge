import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Reflection() {
  const [prompt, setPrompt] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiService.getDailyReflection().then((data) => {
      setPrompt(data);
      if (data.submitted) { setResponse(data.user_response || ''); setFeedback(data.feedback); }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setSubmitting(true);
    try {
      const result = await apiService.submitReflection('user_1', response);
      setFeedback(result.feedback);
    } catch (e) { console.error(e); }
    setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12 animate-slide-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-2">
              Daily Reflection
            </h1>
            <p className="text-muted">Reflect on your influence skills</p>
          </div>
          <Link to="/reflection/history" className="btn-secondary">History</Link>
        </div>

        {/* Prompt */}
        <div className="card-honey mb-8">
          <span className="pill bg-warm-white/80 text-charcoal text-xs mb-4 inline-block">Today's Prompt</span>
          <p className="text-xl font-medium text-charcoal leading-relaxed">
            {prompt?.prompt || 'No prompt available.'}
          </p>
        </div>

        {/* Response Form */}
        {!feedback && (
          <div className="card mb-8">
            <label className="block font-medium text-charcoal mb-3">Your Response</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Share your thoughts..."
              className="input h-48 resize-none mb-4"
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">{response.length} characters</span>
              <button 
                onClick={handleSubmit} 
                disabled={!response.trim() || submitting} 
                className="btn-primary disabled:opacity-40"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="space-y-6 animate-slide-up">
            <div className="card-sage">
              <div className="flex justify-between items-center mb-4">
                <span className="pill pill-sage text-xs">AI Feedback</span>
                <div className="text-3xl font-semibold text-charcoal">{feedback.quality_score}/100</div>
              </div>
              <div className="w-full bg-warm-white rounded-full h-2 mb-4">
                <div className="bg-sage h-full rounded-full" style={{ width: `${feedback.quality_score}%` }} />
              </div>
              <p className="text-charcoal">{feedback.feedback_text}</p>
            </div>

            {feedback.strengths?.length > 0 && (
              <div className="card">
                <h4 className="font-medium text-charcoal mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-sage font-medium">+</span>
                      <span className="text-muted">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.areas_for_growth?.length > 0 && (
              <div className="card">
                <h4 className="font-medium text-charcoal mb-3">Areas for Growth</h4>
                <ul className="space-y-2">
                  {feedback.areas_for_growth.map((a: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-coral font-medium">→</span>
                      <span className="text-muted">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
