import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Calendar() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await apiService.getUpcomingSessions('user_1');
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (session: any) => {
    if (session.type === 'lesson') navigate(`/lessons/${session.content_id}`);
    else if (session.type === 'quiz') navigate(`/quiz/${session.content_id}`);
    else if (session.type === 'reflection') navigate('/reflection');
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await apiService.completeSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: any[] } = {};
    sessions.forEach(session => {
      const date = new Date(session.scheduled_time).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduled_time).toDateString();
    return sessionDate === new Date().toDateString();
  });

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

  const groupedSessions = groupSessionsByDate();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Calendar
          </h1>
          <p className="text-lg text-muted">Your scheduled learning sessions</p>
        </div>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div className="card-lavender mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Today</h2>
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className="p-4 bg-warm-white rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-medium text-charcoal">{session.title}</div>
                    <div className="text-sm text-muted">
                      {new Date(session.scheduled_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      <span className="mx-2">·</span>
                      <span className="capitalize">{session.type}</span>
                    </div>
                  </div>
                  <button onClick={() => handleStartSession(session)} className="btn-primary">Start</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Sessions */}
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-xl text-muted mb-2">No upcoming sessions</p>
            <p className="text-muted">Set your learning preferences to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  {new Date(dateSessions[0].scheduled_time).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                  })}
                </h3>
                <div className="space-y-3">
                  {dateSessions.map((session) => (
                    <div key={session.id} className="card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-charcoal mb-1">{session.title}</div>
                          <div className="text-sm text-muted">
                            {new Date(session.scheduled_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            <span className="mx-2">·</span>
                            <span className="capitalize">{session.type}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => handleStartSession(session)} className="text-charcoal font-medium hover:underline">
                            Start
                          </button>
                          {session.status !== 'completed' && (
                            <button onClick={() => handleCompleteSession(session.id)} className="text-sage font-medium hover:underline">
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="card text-center py-6">
            <div className="text-2xl font-semibold text-charcoal mb-1">{sessions.filter(s => s.type === 'lesson').length}</div>
            <div className="text-sm text-muted">Lessons</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-2xl font-semibold text-charcoal mb-1">{sessions.filter(s => s.type === 'quiz').length}</div>
            <div className="text-sm text-muted">Quizzes</div>
          </div>
          <div className="card text-center py-6">
            <div className="text-2xl font-semibold text-charcoal mb-1">{sessions.filter(s => s.type === 'reflection').length}</div>
            <div className="text-sm text-muted">Reflections</div>
          </div>
        </div>
      </div>
    </div>
  );
}
