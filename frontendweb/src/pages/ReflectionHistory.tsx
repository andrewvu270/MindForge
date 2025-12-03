import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import { LottieLoader } from '../components/LottieEnhanced';

export default function ReflectionHistory() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    apiService.getReflectionHistory('user_1').then(setReflections).catch(console.error).finally(() => setLoading(false));
  }, []);

  const avgScore = reflections.length > 0
    ? Math.round(reflections.reduce((sum, r) => sum + (r.feedback?.quality_score || 0), 0) / reflections.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <LottieLoader message="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12 animate-slide-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-2">
              Reflection History
            </h1>
            <p className="text-muted">Track your growth over time</p>
          </div>
          <Link to="/reflection" className="btn-primary">New Reflection</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-charcoal mb-1">{reflections.length}</div>
            <div className="text-sm text-muted">Total</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-coral mb-1">{avgScore}</div>
            <div className="text-sm text-muted">Avg Score</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-sage mb-1">{reflections[0]?.feedback?.quality_score || 0}</div>
            <div className="text-sm text-muted">Latest</div>
          </div>
        </div>

        {/* Reflections List */}
        {reflections.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-xl text-muted">No reflections yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 stagger">
            {reflections.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className="card cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-muted">
                    {new Date(r.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-xl font-semibold text-coral">{r.feedback?.quality_score || 0}</div>
                </div>
                <h3 className="font-medium text-charcoal mb-2 line-clamp-2">{r.prompt}</h3>
                <p className="text-muted text-sm line-clamp-2">{r.response}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-warm-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-sm text-muted">
                  {new Date(selected.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <button onClick={() => setSelected(null)} className="text-2xl text-muted hover:text-charcoal">×</button>
              </div>

              <h2 className="text-xl font-semibold text-charcoal mb-4">{selected.prompt}</h2>

              <div className="mb-6 p-4 bg-coral-light rounded-2xl flex justify-between items-center">
                <span className="font-medium text-charcoal">Quality Score</span>
                <span className="text-2xl font-semibold text-coral">{selected.feedback?.quality_score || 0}</span>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-charcoal mb-2">Your Response</h3>
                <p className="text-muted">{selected.response}</p>
              </div>

              {selected.feedback && (
                <div>
                  <h3 className="font-medium text-charcoal mb-2">Feedback</h3>
                  <p className="text-muted">{selected.feedback.feedback_text}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
