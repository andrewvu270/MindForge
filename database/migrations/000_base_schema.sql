-- Base Schema Migration
-- Creates all core tables for MindForge
-- Run this first in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories (Fields)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    field_id TEXT,
    field_name TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    difficulty_level TEXT DEFAULT 'beginner',
    estimated_minutes INTEGER DEFAULT 15,
    points INTEGER DEFAULT 10,
    thumbnail_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    images JSONB,
    audio_clips JSONB,
    video_duration_seconds INTEGER,
    sources JSONB,
    learning_objectives JSONB,
    key_concepts JSONB,
    is_published BOOLEAN DEFAULT true,
    is_auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    selected_answer INTEGER,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    completed BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria JSONB,
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- User Stats
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    average_quiz_score FLOAT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Technology', 'tech', 'Latest in tech and AI developments', '💻', '#3B82F6'),
('Finance', 'finance', 'Markets, investing, and economic principles', '💰', '#10B981'),
('Economics', 'economics', 'Economic trends and analysis', '📈', '#8B5CF6'),
('Culture', 'culture', 'Arts, society, and cultural developments', '🎨', '#F59E0B'),
('Influence', 'influence', 'Communication and leadership skills', '🎯', '#EF4444'),
('Global Events', 'global', 'World news and political developments', '🌍', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points_reward) VALUES
('First Steps', 'Complete your first lesson', '🎯', '{"type": "lessons_completed", "value": 1}', 10),
('Quiz Master', 'Get a perfect score on a quiz', '⭐', '{"type": "perfect_scores", "value": 1}', 20),
('Week Warrior', 'Maintain a 7-day streak', '🔥', '{"type": "current_streak", "value": 7}', 50),
('Knowledge Seeker', 'Complete 10 lessons', '📚', '{"type": "lessons_completed", "value": 10}', 100),
('Dedicated Learner', 'Complete 50 lessons', '🏆', '{"type": "lessons_completed", "value": 50}', 500),
('Master Mind', 'Complete 100 lessons', '👑', '{"type": "lessons_completed", "value": 100}', 1000)
ON CONFLICT DO NOTHING;

-- Create default user for testing
INSERT INTO users (id, email, username, display_name) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@mindforge.com', 'demo', 'Demo User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_stats (user_id) VALUES
('00000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id) DO NOTHING;
