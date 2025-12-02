# Database Migrations

This directory contains database migration scripts for the MindForge application.

## Migration Files

### 001_frankenstein_feature.sql
Adds support for the Frankenstein multi-source learning feature:
- `synthesized_lessons` - Lessons generated from multiple external sources
- `reflections` - User reflections with AI feedback
- `scheduled_sessions` - Automatic session scheduling
- `schedule_preferences` - User scheduling preferences
- `reflection_prompts` - Pool of reflection prompts
- Enhanced `user_progress` table with category tracking
- Enhanced `achievements` table with JSONB criteria
- Helper functions for streak tracking and point awarding
- Triggers for automatic streak updates

### 001_frankenstein_feature_rollback.sql
Rollback script to undo changes from 001_frankenstein_feature.sql

## How to Apply Migrations

### Using psql (PostgreSQL CLI)

```bash
# Apply migration
psql -U your_username -d mindforge -f database/migrations/001_frankenstein_feature.sql

# Rollback migration
psql -U your_username -d mindforge -f database/migrations/001_frankenstein_feature_rollback.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Execute the query

### Using Python

```python
import psycopg2

# Connect to database
conn = psycopg2.connect(
    host="your-host",
    database="mindforge",
    user="your-user",
    password="your-password"
)

# Read and execute migration
with open('database/migrations/001_frankenstein_feature.sql', 'r') as f:
    migration_sql = f.read()
    
with conn.cursor() as cur:
    cur.execute(migration_sql)
    conn.commit()

conn.close()
```

## Migration Checklist

Before applying a migration:
- [ ] Backup your database
- [ ] Review the migration SQL
- [ ] Test on a development/staging environment first
- [ ] Verify rollback script works

After applying a migration:
- [ ] Verify tables were created successfully
- [ ] Check indexes are in place
- [ ] Test application functionality
- [ ] Update application models if needed

## New Tables Schema

### synthesized_lessons
Stores AI-generated lessons from multiple sources.

**Key columns:**
- `sources` (JSONB) - Array of source objects with name, title, URL
- `learning_objectives` (JSONB) - Array of learning objectives
- `summary` (TEXT) - AI-synthesized lesson content

### reflections
Stores user reflections with AI-generated feedback.

**Key columns:**
- `quality_score` (FLOAT) - AI-assessed score 0-100
- `ai_feedback` (TEXT) - Constructive feedback from AI
- `insights` (JSONB) - Key insights identified

### scheduled_sessions
Manages automatic scheduling of learning activities.

**Key columns:**
- `session_type` - 'lesson', 'quiz', or 'reflection'
- `scheduled_time` - When the session should be available
- `completed` - Whether user completed the session

## Helper Functions

### update_user_streak(user_id UUID)
Updates user's current and longest streak based on activity.

### award_points(user_id UUID, points INT)
Awards points to a user and updates their total.

## Triggers

### update_streak_on_completion
Automatically updates user streak when they complete a lesson.

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- JSONB columns are used for flexible, queryable JSON data
- Indexes are created on frequently queried columns
- Foreign keys include `ON DELETE CASCADE` where appropriate
- Check constraints ensure data validity (e.g., quality_score 0-100)
