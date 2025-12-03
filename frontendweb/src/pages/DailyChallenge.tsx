import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import ClayMascot from '../components/ClayMascot';
import Confetti from '../components/Confetti';
import StreakIcon from '../components/StreakIcon';
import { LottieLoader } from '../components/LottieEnhanced';

interface Challenge {
  id: string;
  type: 'watch' | 'flashcards' | 'quiz' | 'reflection';
  title: string;
  description: string;
  completed: boolean;
  field?: string;
  duration: number;
  contentId?: string;
}

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const [stats, challengeProgress] = await Promise.all([
        apiService.getUserStats('user_1'),
        apiService.getDailyChallengeProgress('user_1'),
      ]);
      
      setStreak(stats?.current_streak || 0);

      // Build challenges based on actual progress
      const completedTasks = challengeProgress?.completed_tasks || [];
      
      setChallenges([
        {
          id: '1',
          type: 'watch',
          title: 'Watch today\'s briefing',
          description: `Complete ${challengeProgress?.lessons_today || 0}/1 lessons`,
          completed: completedTasks.includes('watch'),
          duration: 5,
        },
        {
          id: '2',
          type: 'flashcards',
          title: 'Review 10 flashcards',
          description: 'Reinforce what you\'ve learned',
          completed: completedTasks.includes('flashcards'),
          field: 'Technology',
          duration: 3,
        },
        {
          id: '3',
          type: 'quiz',
          title: 'Pass a quiz',
          description: `Complete ${challengeProgress?.quizzes_today || 0}/1 quizzes`,
          completed: completedTasks.includes('quiz'),
          duration: 5,
        },
        {
          id: '4',
          type: 'reflection',
          title: 'Daily reflection',
          description: `Submit ${challengeProgress?.reflections_today || 0}/1 reflections`,
          completed: completedTasks.includes('reflection'),
          duration: 5,
        },
      ]);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = (challenge: Challenge) => {
    switch (challenge.type) {
      case 'watch':
        navigate('/feed');
        break;
      case 'flashcards':
        navigate('/flashcards');
        break;
      case 'quiz':
        navigate('/lessons');
        break;
      case 'reflection':
        navigate('/reflection');
        break;
    }
  };

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalDuration = challenges.reduce((sum, c) => sum + c.duration, 0);
  const allCompleted = completedCount === challenges.length && challenges.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'watch':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        );
      case 'flashcards':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reflection':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'watch': return 'coral';
      case 'flashcards': return 'honey';
      case 'quiz': return 'sage';
      case 'reflection': return 'sky';
      default: return 'muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <LottieLoader message="Loading challenges..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      {allCompleted && <Confetti />}

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <ClayMascot
            field="Technology"
            size="md"
            animation={allCompleted ? 'celebrate' : 'wave'}
            className="mx-auto mb-4"
          />
          <p className="text-sm text-coral font-medium mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-charcoal mb-2">Daily Challenge</h1>
          <p className="text-muted">Complete all tasks to maintain your streak</p>
        </div>

        {/* Streak card */}
        <div className={`card mb-8 animate-scale-in ${allCompleted ? 'card-sage' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Current streak</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-charcoal animate-float">{streak}</span>
                <span className="text-muted">days</span>
                {streak > 0 && (
                  <StreakIcon
                    days={streak}
                    size="md"
                    intensity={allCompleted ? 'max' : undefined}
                  />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted mb-1">Today's goal</p>
              <p className="text-lg font-medium text-charcoal">~{totalDuration} min</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Progress</span>
              <span className="font-medium text-charcoal">{completedCount}/{challenges.length}</span>
            </div>
            <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allCompleted ? 'bg-sage animate-pulse' : 'bg-coral'
                  }`}
                style={{ width: `${(completedCount / challenges.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-3 mb-8 stagger">
          {challenges.map((challenge) => {
            const color = getColor(challenge.type);
            return (
              <div
                key={challenge.id}
                className={`card transition-all ${challenge.completed ? 'opacity-60 scale-95' : 'hover:shadow-lg'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${color}-light flex items-center justify-center text-${color} flex-shrink-0`}>
                    {getIcon(challenge.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-charcoal">{challenge.title}</h3>
                      {challenge.completed && (
                        <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-muted">{challenge.description}</p>
                    <p className="text-xs text-muted mt-1">{challenge.duration} min</p>
                  </div>

                  {!challenge.completed && (
                    <button
                      onClick={() => handleStartChallenge(challenge)}
                      className="btn-primary text-sm px-4 py-2 flex-shrink-0"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion bonus */}
        <div className={`card ${completedCount === challenges.length ? 'card-sage' : 'bg-cream-dark'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${completedCount === challenges.length ? 'bg-sage' : 'bg-muted/20'} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-6 h-6 ${completedCount === challenges.length ? 'text-white' : 'text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-charcoal">Completion bonus</h3>
              <p className="text-sm text-muted">
                {completedCount === challenges.length
                  ? 'Congratulations! You\'ve completed today\'s challenge.'
                  : 'Complete all tasks to unlock bonus content'}
              </p>
            </div>
            {completedCount === challenges.length && (
              <Link to="/feed" className="btn-primary text-sm">
                Bonus lesson
              </Link>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-sm text-muted hover:text-charcoal">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
