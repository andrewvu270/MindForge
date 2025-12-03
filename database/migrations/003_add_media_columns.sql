-- Migration to add media columns if they don't exist
-- Run this in your Supabase SQL Editor
-- This is safe to run multiple times

-- Add audio_clips column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'audio_clips'
    ) THEN
        ALTER TABLE lessons ADD COLUMN audio_clips JSONB;
        RAISE NOTICE 'Added audio_clips column';
    ELSE
        RAISE NOTICE 'audio_clips column already exists';
    END IF;
END $$;

-- Add video_duration_seconds column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'video_duration_seconds'
    ) THEN
        ALTER TABLE lessons ADD COLUMN video_duration_seconds INTEGER;
        RAISE NOTICE 'Added video_duration_seconds column';
    ELSE
        RAISE NOTICE 'video_duration_seconds column already exists';
    END IF;
END $$;

-- Add audio column if it doesn't exist (for mixed audio track)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'audio'
    ) THEN
        ALTER TABLE lessons ADD COLUMN audio TEXT;
        RAISE NOTICE 'Added audio column';
    ELSE
        RAISE NOTICE 'audio column already exists';
    END IF;
END $$;

-- Verify columns exist
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('audio', 'audio_clips', 'video_duration_seconds', 'images', 'sources', 'audio_url', 'video_url')
ORDER BY column_name;
