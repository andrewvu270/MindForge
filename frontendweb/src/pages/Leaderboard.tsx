import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot, { MascotLoader } from '../components/ClayMascot';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getLeaderboard(100).then(setLeaderboard).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <MascotLoader field="Technology" message="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Leaderboard
          </h1>
          <p className="text-lg text-muted">See how you rank against others</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* 2nd Place */}
            <div className="card-sage text-center py-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl mb-2">🥈</div>
              <div className="text-2xl font-semibold text-muted mb-3">2</div>
              <div className="w-12 h-12 rounded-full bg-warm-white mx-auto mb-3 flex items-center justify-center font-semibold text-charcoal">
                {leaderboard[1]?.username?.charAt(0)}
              </div>
              <div className="font-medium text-charcoal text-sm mb-1">{leaderboard[1]?.username}</div>
              <div className="text-xl font-semibold text-charcoal">{leaderboard[1]?.total_points}</div>
            </div>
            
            {/* 1st Place */}
            <div className="card-honey text-center py-8 animate-scale-in relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <ClayMascot field="Technology" size="sm" animation="celebrate" />
              </div>
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-semibold text-honey mb-3">1</div>
              <div className="w-14 h-14 rounded-full bg-warm-white mx-auto mb-3 flex items-center justify-center font-semibold text-charcoal text-lg">
                {leaderboard[0]?.username?.charAt(0)}
              </div>
              <div className="font-medium text-charcoal mb-1">{leaderboard[0]?.username}</div>
              <div className="text-2xl font-semibold text-charcoal">{leaderboard[0]?.total_points}</div>
            </div>
            
            {/* 3rd Place */}
            <div className="card-coral text-center py-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl mb-2">🥉</div>
              <div className="text-2xl font-semibold text-muted mb-3">3</div>
              <div className="w-12 h-12 rounded-full bg-warm-white mx-auto mb-3 flex items-center justify-center font-semibold text-charcoal">
                {leaderboard[2]?.username?.charAt(0)}
              </div>
              <div className="font-medium text-charcoal text-sm mb-1">{leaderboard[2]?.username}</div>
              <div className="text-xl font-semibold text-charcoal">{leaderboard[2]?.total_points}</div>
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="space-y-3 stagger">
          {leaderboard.map((user, i) => (
            <div 
              key={user.user_id} 
              className={`card flex items-center gap-4 ${user.user_id === 'user_1' ? 'ring-2 ring-coral' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm font-medium text-muted">
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white font-semibold">
                {user.username?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal truncate">{user.username}</div>
                <div className="text-xs text-muted">{user.lessons_completed || 0} lessons</div>
              </div>
              <div className="text-xl font-semibold text-charcoal">{user.total_points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
