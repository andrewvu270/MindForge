-- Migration 004: Learning Paths System
-- Adds structured learning paths separate from user-generated lessons

-- ============================================
-- 1. Create learning_paths table
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    name TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    description TEXT,
    order_index INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    estimated_hours DECIMAL(4,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster field lookups
CREATE INDEX IF NOT EXISTS idx_learning_paths_field_id ON learning_paths(field_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON learning_paths(difficulty);

-- ============================================
-- 2. Create path_lessons table
-- ============================================
CREATE TABLE IF NOT EXISTS path_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 15,
    difficulty_level TEXT,
    
    -- Media
    video_url TEXT,
    audio_url TEXT,
    thumbnail_url TEXT,
    images JSONB,
    
    -- Learning content
    learning_objectives JSONB,
    key_concepts JSONB,
    
    -- Prerequisites
    prerequisite_lesson_id UUID REFERENCES path_lessons(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_path_lessons_path_id ON path_lessons(path_id);
CREATE INDEX IF NOT EXISTS idx_path_lessons_order ON path_lessons(path_id, order_index);

-- ============================================
-- 3. Add lesson_type to existing lessons table
-- ============================================
-- This distinguishes user-generated lessons from path lessons
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'lesson_type'
    ) THEN
        ALTER TABLE lessons ADD COLUMN lesson_type TEXT DEFAULT 'user_generated';
        ALTER TABLE lessons ADD CONSTRAINT check_lesson_type 
            CHECK (lesson_type IN ('user_generated', 'path_lesson', 'frankenstein'));
    END IF;
END $$;

-- ============================================
-- 4. Create user_lesson_progress table
-- ============================================
-- Track user progress through learning paths
CREATE TABLE IF NOT EXISTS user_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_lesson_id UUID REFERENCES path_lessons(id),
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, path_id)
);

CREATE INDEX IF NOT EXISTS idx_user_path_progress_user ON user_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_path ON user_path_progress(path_id);

-- ============================================
-- 5. Create path_lesson_completions table
-- ============================================
-- Track individual lesson completions within paths
CREATE TABLE IF NOT EXISTS path_lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    path_lesson_id UUID NOT NULL REFERENCES path_lessons(id) ON DELETE CASCADE,
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent_minutes INTEGER,
    quiz_score INTEGER,
    
    UNIQUE(user_id, path_lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_path_lesson_completions_user ON path_lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_path_lesson_completions_lesson ON path_lesson_completions(path_lesson_id);

-- ============================================
-- 6. Update existing lessons to be user_generated
-- ============================================
UPDATE lessons 
SET lesson_type = 'user_generated' 
WHERE lesson_type IS NULL OR lesson_type = '';

-- ============================================
-- 7. Create view for easy path querying
-- ============================================
CREATE OR REPLACE VIEW learning_paths_with_lessons AS
SELECT 
    lp.id as path_id,
    lp.field_id,
    lp.field_name,
    lp.name as path_name,
    lp.difficulty,
    lp.description,
    lp.order_index,
    COUNT(pl.id) as lesson_count,
    SUM(pl.estimated_minutes) as total_minutes,
    json_agg(
        json_build_object(
            'id', pl.id,
            'title', pl.title,
            'order_index', pl.order_index,
            'estimated_minutes', pl.estimated_minutes
        ) ORDER BY pl.order_index
    ) as lessons
FROM learning_paths lp
LEFT JOIN path_lessons pl ON lp.id = pl.path_id
GROUP BY lp.id, lp.field_id, lp.field_name, lp.name, lp.difficulty, lp.description, lp.order_index;

-- ============================================
-- 8. Add comments for documentation
-- ============================================
COMMENT ON TABLE learning_paths IS 'Curated learning paths with structured curriculum';
COMMENT ON TABLE path_lessons IS 'Lessons that belong to specific learning paths';
COMMENT ON TABLE user_path_progress IS 'Tracks user progress through learning paths';
COMMENT ON TABLE path_lesson_completions IS 'Individual lesson completion records';
COMMENT ON COLUMN lessons.lesson_type IS 'Type: user_generated (Frankenstein), path_lesson, or frankenstein';

