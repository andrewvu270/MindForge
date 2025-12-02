import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiService.getUserStats('user_1').then(setStats).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12 animate-slide-up">
          <p className="text-muted mb-2">Welcome back</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Ready to learn something new?
          </h1>
          <p className="text-lg text-muted">
            You're on a <span className="text-charcoal font-medium">{stats?.current_streak || 0} day streak</span>. Keep it going.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 stagger">
          <div className="card-coral">
            <div className="text-3xl font-semibold text-charcoal mb-1">{stats?.total_points || 0}</div>
            <div className="text-sm text-muted">Points</div>
          </div>
          <div className="card-sage">
            <div className="text-3xl font-semibold text-charcoal mb-1">{stats?.current_streak || 0}</div>
            <div className="text-sm text-muted">Day Streak</div>
          </div>
          <div className="card-honey">
            <div className="text-3xl font-semibold text-charcoal mb-1">{stats?.lessons_completed || 0}</div>
            <div className="text-sm text-muted">Lessons</div>
          </div>
          <div className="card-sky">
            <div className="text-3xl font-semibold text-charcoal mb-1">#{stats?.leaderboard_rank || '-'}</div>
            <div className="text-sm text-muted">Rank</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link to="/reflection" className="card group hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-coral-light flex items-center justify-center">
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="pill pill-coral">Daily</span>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">Today's Reflection</h2>
            <p className="text-muted mb-4">Take 5 minutes to reflect and get AI feedback</p>
            <span className="text-charcoal font-medium group-hover:underline">Start now →</span>
          </Link>

          <Link to="/generate" className="card group hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center">
                <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="pill pill-sage">AI-Powered</span>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">Generate Lesson</h2>
            <p className="text-muted mb-4">Create custom lessons from multiple sources</p>
            <span className="text-charcoal font-medium group-hover:underline">Create →</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/lessons', label: 'Browse Lessons', icon: '📚' },
            { to: '/progress', label: 'View Progress', icon: '📊' },
            { to: '/achievements', label: 'Achievements', icon: '🏆' },
            { to: '/leaderboard', label: 'Leaderboard', icon: '👥' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card group text-center py-8 hover:shadow-lg">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-medium text-charcoal group-hover:text-coral transition-colors">
                {item.label}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
