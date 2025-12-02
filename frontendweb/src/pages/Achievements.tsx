import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAchievements('user_1').then(setAchievements).catch(console.error).finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

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
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Achievements
          </h1>
          <p className="text-lg text-muted">Track your learning milestones</p>
        </div>

        {/* Progress Overview */}
        <div className="card-honey mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-1">Your Progress</h2>
              <p className="text-muted">{unlockedCount} of {totalCount} achievements unlocked</p>
            </div>
            <div className="text-4xl font-semibold text-charcoal">{completionPercentage}%</div>
          </div>
          <div className="w-full bg-warm-white rounded-full h-2">
            <div className="bg-honey h-2 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-xl text-muted">No achievements available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`card transition-all ${
                  achievement.unlocked ? 'card-sage' : 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">{achievement.name}</h3>
                  {achievement.unlocked && (
                    <span className="pill pill-sage text-xs">Unlocked</span>
                  )}
                </div>
                
                <p className="text-muted text-sm mb-4">{achievement.description}</p>

                <div className="p-3 bg-cream rounded-xl">
                  <div className="text-xs text-muted mb-1">Criteria</div>
                  <div className="text-sm text-charcoal">{achievement.criteria}</div>
                </div>

                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted">Progress</span>
                      <span className="font-medium text-charcoal">{achievement.current || 0} / {achievement.target || 0}</span>
                    </div>
                    <div className="w-full bg-cream-dark rounded-full h-1.5">
                      <div
                        className="bg-coral h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((achievement.current || 0) / (achievement.target || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {achievement.unlocked && achievement.unlocked_at && (
                  <div className="mt-4 text-xs text-muted">
                    Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
