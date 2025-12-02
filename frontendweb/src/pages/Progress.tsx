import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Progress() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getProgress('user_1').then(setProgress).catch(console.error).finally(() => setLoading(false));
  }, []);

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

  const fields = progress?.field_progress || [];
  const quizScores = progress?.quiz_scores || [];
  const progressColors = ['bg-coral', 'bg-sage', 'bg-honey', 'bg-sky', 'bg-lavender', 'bg-rose'];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Progress
          </h1>
          <p className="text-lg text-muted">
            Track your learning journey across all fields
          </p>
        </div>

        {/* Streak Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="card-coral">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Current Streak</p>
                <div className="text-5xl font-semibold text-charcoal">{progress?.current_streak || 0}</div>
                <p className="text-muted mt-1">days in a row</p>
              </div>
              <div className="text-6xl opacity-30">🔥</div>
            </div>
          </div>
          
          <div className="card-sage">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Longest Streak</p>
                <div className="text-5xl font-semibold text-charcoal">{progress?.longest_streak || 0}</div>
                <p className="text-muted mt-1">personal best</p>
              </div>
              <div className="text-6xl opacity-30">⭐</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-charcoal mb-1">{progress?.total_lessons_completed || 0}</div>
            <div className="text-sm text-muted">Lessons</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-charcoal mb-1">{progress?.total_quizzes_completed || 0}</div>
            <div className="text-sm text-muted">Quizzes</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-charcoal mb-1">{progress?.total_learning_time || 0}h</div>
            <div className="text-sm text-muted">Time Spent</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-3xl font-semibold text-charcoal mb-1">{progress?.total_points || 0}</div>
            <div className="text-sm text-muted">Points</div>
          </div>
        </div>

        {/* Field Progress */}
        <div className="card mb-12">
          <h2 className="text-xl font-semibold text-charcoal mb-8">Completion by Field</h2>
          <div className="space-y-6">
            {fields.map((f: any, i: number) => (
              <div key={f.field_id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-charcoal">{f.field_name}</span>
                  <span className="text-sm font-medium text-muted">{f.completion_rate || 0}%</span>
                </div>
                <div className="w-full bg-cream-dark rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${progressColors[i % progressColors.length]} h-full transition-all duration-500 rounded-full`} 
                    style={{ width: `${f.completion_rate || 0}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>{f.completed_lessons || 0} completed</span>
                  <span>{f.total_lessons || 0} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="card-honey">
            <p className="text-sm text-muted mb-2">Average Quiz Score</p>
            <div className="text-5xl font-semibold text-charcoal mb-1">{progress?.average_quiz_score || 0}%</div>
            <p className="text-muted text-sm">across all quizzes</p>
          </div>
          
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-charcoal mb-6">Recent Quizzes</h3>
            {quizScores.length > 0 ? (
              <div className="space-y-3">
                {quizScores.slice(0, 5).map((q: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-cream rounded-2xl">
                    <div>
                      <div className="font-medium text-charcoal">{q.lesson_title}</div>
                      <div className="text-xs text-muted">{new Date(q.completed_at).toLocaleDateString()}</div>
                    </div>
                    <div className={`pill ${q.score >= 80 ? 'pill-sage' : q.score >= 60 ? 'pill-honey' : 'pill-coral'}`}>
                      {q.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">No quiz results yet</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/lessons" className="card group hover:shadow-lg">
            <h3 className="text-lg font-semibold text-charcoal mb-2">Continue Learning</h3>
            <p className="text-muted mb-4">Pick up where you left off</p>
            <span className="text-charcoal font-medium group-hover:underline">Browse Lessons →</span>
          </Link>
          <Link to="/leaderboard" className="card group hover:shadow-lg">
            <h3 className="text-lg font-semibold text-charcoal mb-2">See Rankings</h3>
            <p className="text-muted mb-4">Compare with other learners</p>
            <span className="text-charcoal font-medium group-hover:underline">View Leaderboard →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
