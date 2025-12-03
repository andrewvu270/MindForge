import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Learn from './pages/Learn';
import LearnRead from './pages/LearnRead';
import LearnVideo from './pages/LearnVideo';
import Quiz from './pages/Quiz';
import FrankensteinGenerator from './pages/FrankensteinGenerator';
import Reflection from './pages/Reflection';
import ReflectionHistory from './pages/ReflectionHistory';
import Achievements from './pages/Achievements';
import Progress from './pages/Progress';
import Flashcards from './pages/Flashcards';
import Feed from './pages/Feed';
import DailyChallenge from './pages/DailyChallenge';
import Curriculum from './pages/Curriculum';
import { LottieLoader } from './components/LottieEnhanced';

interface User {
  email: string;
  name: string;
}

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: User | null }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem('mindforge_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mindforge_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LottieLoader message="Loading MindForge..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/lessons" element={<ProtectedRoute user={user}><Lessons /></ProtectedRoute>} />
        <Route path="/lessons/:id" element={<ProtectedRoute user={user}><LessonDetail /></ProtectedRoute>} />
        <Route path="/learn/:id" element={<ProtectedRoute user={user}><Learn /></ProtectedRoute>} />
        <Route path="/learn/read/:id" element={<ProtectedRoute user={user}><LearnRead /></ProtectedRoute>} />
        <Route path="/learn/video/:id" element={<ProtectedRoute user={user}><LearnVideo /></ProtectedRoute>} />
        <Route path="/quiz/:lessonId" element={<ProtectedRoute user={user}><Quiz /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute user={user}><FrankensteinGenerator /></ProtectedRoute>} />
        <Route path="/reflection" element={<ProtectedRoute user={user}><Reflection /></ProtectedRoute>} />
        <Route path="/reflection/history" element={<ProtectedRoute user={user}><ReflectionHistory /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute user={user}><Achievements /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute user={user}><Progress /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute user={user}><Flashcards /></ProtectedRoute>} />
        <Route path="/flashcards/:field" element={<ProtectedRoute user={user}><Flashcards /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute user={user}><Feed /></ProtectedRoute>} />
        <Route path="/daily" element={<ProtectedRoute user={user}><DailyChallenge /></ProtectedRoute>} />
        <Route path="/curriculum" element={<ProtectedRoute user={user}><Curriculum /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
