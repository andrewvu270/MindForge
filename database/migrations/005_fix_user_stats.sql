-- Migration 005: Fix user_stats table structure
-- Ensures user_stats table has all required columns

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add reflections_submitted if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_stats' AND column_name = 'reflections_submitted'
    ) THEN
        ALTER TABLE user_stats ADD COLUMN reflections_submitted INTEGER DEFAULT 0;
    END IF;
    
    -- Ensure user_id is the primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_stats' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE user_stats ADD PRIMARY KEY (user_id);
    END IF;
END $$;

-- Create index on last_activity_date for streak calculations
CREATE INDEX IF NOT EXISTS idx_user_stats_last_activity ON user_stats(last_activity_date);

-- Update any NULL values to defaults
UPDATE user_stats 
SET 
    total_points = COALESCE(total_points, 0),
    lessons_completed = COALESCE(lessons_completed, 0),
    quizzes_completed = COALESCE(quizzes_completed, 0),
    perfect_scores = COALESCE(perfect_scores, 0),
    current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0),
    total_study_time_minutes = COALESCE(total_study_time_minutes, 0),
    average_quiz_score = COALESCE(average_quiz_score, 0.0),
    reflections_submitted = COALESCE(reflections_submitted, 0)
WHERE 
    total_points IS NULL 
    OR lessons_completed IS NULL 
    OR quizzes_completed IS NULL;

-- Add comment
COMMENT ON TABLE user_stats IS 'User statistics and progress tracking';
