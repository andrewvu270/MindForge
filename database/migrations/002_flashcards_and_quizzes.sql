-- Migration: Flashcards and Enhanced Quiz System
-- Description: Adds flashcards table and enhances quiz tracking with user stats
-- Date: 2024-12-02

-- ============================================
-- 1. Create flashcards table
-- ============================================
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,  -- References lessons or synthesized_lessons
    field_id VARCHAR(50),  -- Optional field categorization
    topic VARCHAR(255),
    front TEXT NOT NULL,  -- Question/prompt
    back TEXT NOT NULL,  -- Answer/explanation
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flashcards_lesson ON flashcards(lesson_id);
CREATE INDEX idx_flashcards_field ON flashcards(field_id);
CREATE INDEX idx_flashcards_difficulty ON flashcards(difficulty);

-- ============================================
-- 2. Create quizzes table (question pool)
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,  -- References lessons or synthesized_lessons
    question TEXT NOT NULL,
    options JSONB NOT NULL,  -- Array of answer options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);

-- ============================================
-- 3. Create quiz_attempts table (user submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL,  -- lesson_id (quiz identifier)
    lesson_id UUID NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage FLOAT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed_at DESC);

-- ============================================
-- 4. Create user_stats table (comprehensive stats)
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    quizzes_passed INTEGER DEFAULT 0,  -- Score >= 70%
    perfect_scores INTEGER DEFAULT 0,  -- Score = 100%
    total_questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_points ON user_stats(total_points DESC);

-- ============================================
-- 5. Create flashcard_progress table (user mastery)
-- ============================================
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    mastered BOOLEAN DEFAULT FALSE,
    times_reviewed INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, flashcard_id)
);

CREATE INDEX idx_flashcard_progress_user ON flashcard_progress(user_id);
CREATE INDEX idx_flashcard_progress_mastered ON flashcard_progress(user_id, mastered);

-- ============================================
-- 6. Helper functions
-- ============================================

-- Function to update user stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_stats_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert user stats
    INSERT INTO user_stats (user_id, quizzes_completed, total_points, total_questions_answered, correct_answers, quizzes_passed, perfect_scores)
    VALUES (
        NEW.user_id,
        1,
        NEW.points_earned,
        NEW.total_questions,
        NEW.score,
        CASE WHEN NEW.percentage >= 70 THEN 1 ELSE 0 END,
        CASE WHEN NEW.percentage = 100 THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        quizzes_completed = user_stats.quizzes_completed + 1,
        total_points = user_stats.total_points + NEW.points_earned,
        total_questions_answered = user_stats.total_questions_answered + NEW.total_questions,
        correct_answers = user_stats.correct_answers + NEW.score,
        quizzes_passed = user_stats.quizzes_passed + CASE WHEN NEW.percentage >= 70 THEN 1 ELSE 0 END,
        perfect_scores = user_stats.perfect_scores + CASE WHEN NEW.percentage = 100 THEN 1 ELSE 0 END,
        lessons_completed = user_stats.lessons_completed + CASE WHEN NEW.percentage >= 80 THEN 1 ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
DROP TRIGGER IF EXISTS trigger_update_stats_on_quiz ON quiz_attempts;
CREATE TRIGGER trigger_update_stats_on_quiz
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_quiz();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE flashcards IS 'Flashcards generated from lesson content for spaced repetition learning';
COMMENT ON TABLE quizzes IS 'Pool of quiz questions for each lesson (10-15 questions, users see random 5)';
COMMENT ON TABLE quiz_attempts IS 'User quiz submissions and scores';
COMMENT ON TABLE user_stats IS 'Comprehensive user statistics for gamification and progress tracking';
COMMENT ON TABLE flashcard_progress IS 'User progress on individual flashcards (mastery tracking)';

COMMENT ON COLUMN flashcards.front IS 'Question or prompt shown on front of card';
COMMENT ON COLUMN flashcards.back IS 'Answer or explanation shown on back of card';
COMMENT ON COLUMN quizzes.options IS 'JSONB array of answer options';
COMMENT ON COLUMN quiz_attempts.percentage IS 'Score as percentage (0-100)';
COMMENT ON COLUMN user_stats.lessons_completed IS 'Lessons completed (quiz score >= 80%)';

