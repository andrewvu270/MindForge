import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot from '../components/ClayMascot';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [todaysBriefing, setTodaysBriefing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getUserStats('user_1'),
      apiService.getLessons(''),
    ]).then(([s, l]) => {
      setStats(s);
      setTodaysBriefing(l.slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const topicsLearned = stats?.lessons_completed || 0;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-coral font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-charcoal">Good morning</h1>
        </div>

        {/* Main CTA - Video Feed */}
        <Link 
          to="/feed"
          className="block mb-8 rounded-3xl overflow-hidden relative group"
        >
          <div className="aspect-[16/9] bg-gradient-to-br from-coral to-lavender relative">
            {/* Animated mascot preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ClayMascot field="User" size="lg" animation="wave" />
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white/70 text-sm mb-1">Today's briefing</p>
              <h2 className="text-xl font-semibold text-white mb-2">Watch and learn</h2>
              <p className="text-white/60 text-sm">Scroll through bite-sized lessons</p>
            </div>
          </div>
        </Link>

        {/* Daily Challenge Card */}
        <Link to="/daily" className="card mb-8 block hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-honey-light flex items-center justify-center">
                <svg className="w-6 h-6 text-honey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-charcoal group-hover:text-coral transition-colors">Daily Challenge</h3>
                <p className="text-sm text-muted">0/4 completed · ~18 min</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-charcoal">{stats?.current_streak || 0}</div>
              <div className="text-xs text-muted">day streak</div>
            </div>
          </div>
        </Link>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">{topicsLearned}</div>
            <div className="text-xs text-muted">Topics learned</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">{topicsLearned * 5}</div>
            <div className="text-xs text-muted">Minutes</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-semibold text-charcoal">{stats?.current_streak || 0}</div>
            <div className="text-xs text-muted">Day streak</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link to="/feed" className="card text-center py-5 group hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-coral-light mx-auto mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-charcoal">Watch</div>
          </Link>
          <Link to="/flashcards" className="card text-center py-5 group hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-honey-light mx-auto mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-honey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-sm font-medium text-charcoal">Review</div>
          </Link>
          <Link to="/reflection" className="card text-center py-5 group hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-light mx-auto mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-charcoal">Reflect</div>
          </Link>
        </div>

        {/* Today's Topics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Today's topics</h2>
            <Link to="/lessons" className="text-sm text-coral font-medium hover:underline">See all</Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBriefing.map((lesson, i) => (
                <Link 
                  key={lesson.id}
                  to={`/learn/${lesson.id}`}
                  className="card flex items-center gap-4 group hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-cream-dark flex items-center justify-center flex-shrink-0 text-sm font-semibold text-muted">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted mb-0.5">{lesson.field_name} · {lesson.estimated_minutes || 5} min</p>
                    <h3 className="font-medium text-charcoal truncate group-hover:text-coral transition-colors">
                      {lesson.title}
                    </h3>
                  </div>
                  <svg className="w-5 h-5 text-muted group-hover:text-coral transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Progress */}
        {topicsLearned > 0 && (
          <div className="card">
            <p className="text-sm text-muted mb-3">Topics you understand</p>
            <div className="flex flex-wrap gap-2">
              {['Market dynamics', 'AI basics', 'Economic indicators', 'Negotiation'].slice(0, Math.min(4, topicsLearned)).map((topic) => (
                <span key={topic} className="text-xs px-3 py-1 bg-sage-light text-sage rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
