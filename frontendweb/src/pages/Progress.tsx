import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot from '../components/ClayMascot';
import { StreakFire, LottieLoader } from '../components/LottieEnhanced';

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
        <LottieLoader message="Loading your progress..." />
      </div>
    );
  }

  const fields = progress?.field_progress || [];
  const totalLessons = progress?.total_lessons_completed || 0;
  const totalMinutes = totalLessons * 5;
  const streak = progress?.current_streak || 0;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center animate-slide-up">
          <ClayMascot
            field="User"
            size="md"
            animation={totalLessons > 10 ? 'celebrate' : 'wave'}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-semibold text-charcoal mb-2">Your progress</h1>
          <p className="text-muted">Track your learning journey</p>
        </div>

        {/* Summary Stats */}
        <div className="card mb-8 animate-scale-in">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-semibold text-charcoal animate-float">{totalLessons}</div>
              <div className="text-sm text-muted">Lessons completed</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-charcoal animate-float" style={{ animationDelay: '0.2s' }}>{totalMinutes}</div>
              <div className="text-sm text-muted">Minutes learned</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 animate-float" style={{ animationDelay: '0.4s' }}>
                {streak > 0 ? (
                  <StreakFire days={streak} />
                ) : (
                  <div className="text-4xl font-semibold text-charcoal">{streak}</div>
                )}
              </div>
              <div className="text-sm text-muted">Day streak</div>
            </div>
          </div>
        </div>

        {/* Knowledge by Field */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Knowledge by topic</h2>
          <div className="card">
            {fields.length > 0 ? (
              <div className="space-y-6 stagger">
                {fields.map((f: any) => {
                  const percentage = Math.min(100, (f.completed_lessons || 0) * 10);
                  const colors: Record<string, string> = {
                    'Technology': 'bg-coral',
                    'Finance': 'bg-sage',
                    'Economics': 'bg-honey',
                    'Culture': 'bg-sky',
                    'Influence': 'bg-lavender',
                    'Global Events': 'bg-rose',
                  };
                  const color = colors[f.field_name] || 'bg-coral';

                  return (
                    <div key={f.field_id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <ClayMascot field={f.field_name} size="sm" animation="idle" />
                          <span className="font-medium text-charcoal">{f.field_name}</span>
                        </div>
                        <span className="text-sm text-muted">{f.completed_lessons || 0} lessons</span>
                      </div>
                      <div className="w-full bg-cream-dark rounded-full h-2 overflow-hidden">
                        <div
                          className={`${color} h-full rounded-full transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted text-center py-8">
                Complete lessons to see your progress by topic
              </p>
            )}
          </div>
        </div>

        {/* Topics You Understand */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Topics you now understand</h2>
          <div className="card">
            {totalLessons > 0 ? (
              <div className="flex flex-wrap gap-2">
                {/* These would come from actual completed lessons in production */}
                {['Market fundamentals', 'AI basics', 'Economic indicators', 'Negotiation principles', 'Tech trends', 'Global trade'].slice(0, Math.min(6, totalLessons)).map((topic, i) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 bg-sage-light text-sage text-sm rounded-full animate-scale-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ✓ {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">
                Complete your first lesson to start building knowledge
              </p>
            )}
          </div>
        </div>

        {/* Quiz Performance */}
        {progress?.quiz_scores?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-charcoal mb-4">Recent quiz scores</h2>
            <div className="space-y-3">
              {progress.quiz_scores.slice(0, 5).map((q: any, i: number) => (
                <div key={i} className="card flex justify-between items-center">
                  <div>
                    <div className="font-medium text-charcoal">{q.lesson_title}</div>
                    <div className="text-xs text-muted">
                      {new Date(q.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${q.score >= 80 ? 'text-sage' : q.score >= 60 ? 'text-honey' : 'text-coral'
                    }`}>
                    {q.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link to="/dashboard" className="text-coral font-medium hover:underline">
            Continue learning
          </Link>
        </div>
      </div>
    </div>
  );
}
