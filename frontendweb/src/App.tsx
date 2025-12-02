import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import FrankensteinGenerator from './pages/FrankensteinGenerator';
import Reflection from './pages/Reflection';
import ReflectionHistory from './pages/ReflectionHistory';
import Achievements from './pages/Achievements';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
        <Route path="/quiz/:lessonId" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/generate" element={<FrankensteinGenerator />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/reflection/history" element={<ReflectionHistory />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </Router>
  );
}

export default App;
