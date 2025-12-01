-- MindForge Database Schema
-- Supabase PostgreSQL

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(7),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  difficulty VARCHAR(20) DEFAULT 'beginner',
  points INTEGER DEFAULT 10,
  reading_time INTEGER, -- in minutes
  tags TEXT[], -- PostgreSQL array
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL, -- Array of 4 options
  correct_answer INTEGER NOT NULL, -- Index of correct answer (0-3)
  explanation TEXT,
  points INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  prediction_type VARCHAR(50) NOT NULL, -- 'market', 'tech', 'event'
  target_value VARCHAR(100),
  deadline TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  is_correct BOOLEAN,
  points_wagered INTEGER DEFAULT 50,
  points_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  points_reward INTEGER DEFAULT 0,
  condition_type VARCHAR(50), -- 'streak', 'points', 'lessons', 'predictions'
  condition_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.total_points,
  u.current_streak,
  u.level,
  RANK() OVER (ORDER BY u.total_points DESC) as rank
FROM users u
WHERE u.total_points > 0
ORDER BY u.total_points DESC;

-- Insert sample categories
INSERT INTO categories (name, slug, icon, color, description) VALUES
('Technology', 'tech', '🤖', '#00FFF0', 'Latest in AI, software, and digital innovation'),
('Finance', 'finance', '📈', '#FF6B35', 'Markets, investing, and economic trends'),
('Culture', 'culture', '🌍', '#00FF88', 'Society, arts, and lifestyle trends'),
('Influence', 'influence', '💡', '#9B59B6', 'Communication, persuasion, and soft skills'),
('Global Events', 'events', '🌐', '#E74C3C', 'World news and trending topics');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, points_reward, condition_type, condition_value) VALUES
('First Steps', 'Complete your first lesson', '🎯', 10, 'lessons', 1),
('Knowledge Seeker', 'Complete 10 lessons', '📚', 50, 'lessons', 10),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 100, 'streak', 7),
('Market Prophet', 'Win 5 market predictions', '📊', 150, 'predictions', 5),
('Tech Expert', 'Complete 25 tech lessons', '💻', 200, 'lessons', 25);

-- Create indexes for performance
CREATE INDEX idx_lessons_category ON lessons(category_id);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
