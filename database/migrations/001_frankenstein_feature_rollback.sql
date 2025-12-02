-- Rollback Migration: Frankenstein Multi-Source Learning Feature
-- Description: Removes tables and changes added by 001_frankenstein_feature.sql
-- Date: 2024-12-02

-- ============================================
-- Drop triggers first
-- ============================================
DROP TRIGGER IF EXISTS update_streak_on_completion ON user_progress;
DROP FUNCTION IF EXISTS trigger_update_streak();

-- ============================================
-- Drop helper functions
-- ============================================
DROP FUNCTION IF EXISTS award_points(UUID, INT);
DROP FUNCTION IF EXISTS update_user_streak(UUID);

-- ============================================
-- Drop views
-- ============================================
DROP VIEW IF EXISTS leaderboard;

-- Recreate original leaderboard view
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

-- ============================================
-- Drop new tables
-- ============================================
DROP TABLE IF EXISTS reflection_prompts CASCADE;
DROP TABLE IF EXISTS schedule_preferences CASCADE;
DROP TABLE IF EXISTS scheduled_sessions CASCADE;
DROP TABLE IF EXISTS reflections CASCADE;
DROP TABLE IF EXISTS synthesized_lessons CASCADE;

-- ============================================
-- Remove added columns from existing tables
-- ============================================
ALTER TABLE user_progress 
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS quizzes_completed,
    DROP COLUMN IF EXISTS average_quiz_score;

ALTER TABLE achievements
    DROP COLUMN IF EXISTS criteria;

-- ============================================
-- Drop indexes
-- ============================================
DROP INDEX IF EXISTS idx_user_progress_category;
DROP INDEX IF EXISTS idx_synthesized_lessons_category;
DROP INDEX IF EXISTS idx_synthesized_lessons_difficulty;
DROP INDEX IF EXISTS idx_synthesized_lessons_published;
DROP INDEX IF EXISTS idx_reflections_user;
DROP INDEX IF EXISTS idx_reflections_submitted;
DROP INDEX IF EXISTS idx_scheduled_sessions_user_time;
DROP INDEX IF EXISTS idx_scheduled_sessions_user_pending;

-- ============================================
-- Note: This rollback does not restore data
-- ============================================
-- If you need to preserve data before rollback, create a backup first
