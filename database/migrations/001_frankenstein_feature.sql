-- Migration: Frankenstein Multi-Source Learning Feature
-- Description: Adds tables for synthesized lessons, reflections, scheduled sessions, and enhanced progress tracking
-- Date: 2024-12-02

-- ============================================
-- 1. Create synthesized_lessons table
-- ============================================
CREATE TABLE IF NOT EXISTS synthesized_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    sources JSONB NOT NULL,  -- Array of source objects with name, title, url
    learning_objectives JSONB,  -- Array of learning objective strings
    key_concepts JSONB,  -- Array of key concept strings
    estimated_minutes INT DEFAULT 15,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    points INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_synthesized_lessons_category ON synthesized_lessons(category_id);
CREATE INDEX idx_synthesized_lessons_difficulty ON synthesized_lessons(difficulty_level);
CREATE INDEX idx_synthesized_lessons_published ON synthesized_lessons(is_published);

-- ============================================
-- 2. Create reflections table
-- ============================================
CREATE TABLE IF NOT EXISTS reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    ai_feedback TEXT,
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 100),
    insights JSONB,  -- Array of insight strings
    suggestion TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_submitted ON reflections(submitted_at DESC);

-- ============================================
-- 3. Enhance user_progress table
-- ============================================
-- Note: user_progress already exists, so we'll add new columns
ALTER TABLE user_progress 
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
    ADD COLUMN IF NOT EXISTS quizzes_completed INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS average_quiz_score FLOAT DEFAULT 0;

-- Create index on category for better query performance
CREATE INDEX IF NOT EXISTS idx_user_progress_category ON user_progress(user_id, category_id);

-- ============================================
-- 4. Enhance achievements table
-- ============================================
-- The achievements table already exists, add criteria column if needed
ALTER TABLE achievements
    ADD COLUMN IF NOT EXISTS criteria JSONB;

-- Update existing achievements to have criteria
UPDATE achievements 
SET criteria = jsonb_build_object(
    'type', condition_type,
    'value', condition_value
)
WHERE criteria IS NULL AND condition_type IS NOT NULL;

-- ============================================
-- 5. Create scheduled_sessions table
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('lesson', 'quiz', 'reflection')),
    content_id UUID,  -- Can reference lessons, synthesized_lessons, or be NULL for reflections
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_sessions_user_time ON scheduled_sessions(user_id, scheduled_time);
CREATE INDEX idx_scheduled_sessions_user_pending ON scheduled_sessions(user_id, completed) WHERE completed = FALSE;

-- ============================================
-- 6. Create schedule_preferences table
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferred_days JSONB,  -- Array of day names: ["Monday", "Tuesday", ...]
    preferred_time TIME,  -- Preferred time of day
    sessions_per_week INT DEFAULT 3 CHECK (sessions_per_week >= 1 AND sessions_per_week <= 7),
    lesson_frequency INT DEFAULT 2,  -- Lessons per week
    quiz_frequency INT DEFAULT 2,  -- Quizzes per week
    reflection_frequency INT DEFAULT 1,  -- Reflections per week
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. Update leaderboard view to include more metrics
-- ============================================
DROP VIEW IF EXISTS leaderboard;

CREATE VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.total_points,
    u.current_streak,
    u.longest_streak,
    u.level,
    COUNT(DISTINCT up.lesson_id) as lessons_completed,
    COUNT(DISTINCT ua.achievement_id) as achievements_earned,
    RANK() OVER (ORDER BY u.total_points DESC) as rank
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.total_points > 0
GROUP BY u.id, u.username, u.display_name, u.total_points, u.current_streak, u.longest_streak, u.level
ORDER BY u.total_points DESC;

-- ============================================
-- 8. Create helper functions
-- ============================================

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    last_activity_date DATE;
    today DATE := CURRENT_DATE;
BEGIN
    -- Get the last activity date (excluding today)
    SELECT DATE(MAX(completed_at))
    INTO last_activity_date
    FROM user_progress
    WHERE user_id = p_user_id
    AND DATE(completed_at) < today;
    
    -- Update streak based on last activity
    IF last_activity_date IS NULL THEN
        -- First activity ever
        UPDATE users SET current_streak = 1 WHERE id = p_user_id;
    ELSIF last_activity_date = today - INTERVAL '1 day' THEN
        -- Consecutive day - increment streak
        UPDATE users 
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE id = p_user_id;
    ELSIF last_activity_date < today - INTERVAL '1 day' THEN
        -- Streak broken - reset to 1
        UPDATE users SET current_streak = 1 WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET total_points = total_points + p_points,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Create triggers
-- ============================================

-- Trigger to update user streak on lesson completion
CREATE OR REPLACE FUNCTION trigger_update_streak()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_streak(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_streak_on_completion ON user_progress;
CREATE TRIGGER update_streak_on_completion
    AFTER INSERT ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak();

-- ============================================
-- 10. Insert sample data for testing
-- ============================================

-- Sample reflection prompts (can be used by the system)
CREATE TABLE IF NOT EXISTS reflection_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'influence',
    difficulty VARCHAR(20) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO reflection_prompts (prompt, category, difficulty) VALUES
('Describe a recent situation where you successfully influenced someone''s decision. What techniques did you use?', 'influence', 'beginner'),
('Reflect on a time when your attempt to persuade someone failed. What could you have done differently?', 'influence', 'intermediate'),
('How do you adapt your communication style when speaking to different audiences? Provide specific examples.', 'influence', 'intermediate'),
('What role does active listening play in your ability to influence others? Share a recent experience.', 'influence', 'beginner'),
('Describe how you build trust and credibility in professional relationships.', 'influence', 'advanced');

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE synthesized_lessons IS 'Lessons generated from multiple external sources using AI synthesis';
COMMENT ON TABLE reflections IS 'User reflections on influence skills with AI-generated feedback';
COMMENT ON TABLE scheduled_sessions IS 'Scheduled learning sessions (lessons, quizzes, reflections)';
COMMENT ON TABLE schedule_preferences IS 'User preferences for automatic session scheduling';
COMMENT ON TABLE reflection_prompts IS 'Pool of reflection prompts for daily influence skill development';

COMMENT ON COLUMN synthesized_lessons.sources IS 'JSONB array of source objects: [{"name": "hackernews", "title": "...", "url": "..."}]';
COMMENT ON COLUMN synthesized_lessons.learning_objectives IS 'JSONB array of learning objective strings';
COMMENT ON COLUMN reflections.quality_score IS 'AI-assessed quality score from 0-100';
COMMENT ON COLUMN scheduled_sessions.session_type IS 'Type of session: lesson, quiz, or reflection';
