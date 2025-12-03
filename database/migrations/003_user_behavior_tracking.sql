-- User Behavior Tracking Tables
-- Stores user interests, preferences, and learning patterns

-- User interests and topics
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    source TEXT NOT NULL, -- 'reflection', 'learning_goal', 'knowledge_gap', 'manual_request', 'completion'
    priority_score FLOAT DEFAULT 1.0,
    engagement_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, topic, source)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    preference_type TEXT NOT NULL, -- 'difficulty', 'learning_style', 'content_type'
    preference_value TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, preference_type)
);

-- User learning patterns
CREATE TABLE IF NOT EXISTS user_learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'best_time', 'session_length', 'preferred_field'
    pattern_value TEXT NOT NULL,
    confidence_score FLOAT DEFAULT 0.5,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, pattern_type)
);

-- Content generation requests (for tracking what users want)
CREATE TABLE IF NOT EXISTS content_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    field_id TEXT,
    request_type TEXT DEFAULT 'manual', -- 'manual', 'suggested', 'auto'
    status TEXT DEFAULT 'pending', -- 'pending', 'generated', 'failed'
    lesson_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Reflection analysis results
CREATE TABLE IF NOT EXISTS reflection_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    reflection_id TEXT,
    reflection_text TEXT NOT NULL,
    topics JSONB,
    learning_goals JSONB,
    knowledge_gaps JSONB,
    difficulty_preference TEXT,
    interests JSONB,
    challenges JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_topic ON user_interests(topic);
CREATE INDEX IF NOT EXISTS idx_user_interests_priority ON user_interests(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_content_requests_user_id ON content_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_content_requests_status ON content_requests(status);
CREATE INDEX IF NOT EXISTS idx_reflection_analysis_user_id ON reflection_analysis(user_id);

-- Function to update priority scores based on engagement
CREATE OR REPLACE FUNCTION update_topic_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Increase priority when user engages with topic
    UPDATE user_interests
    SET 
        priority_score = priority_score * 1.1,
        engagement_count = engagement_count + 1,
        last_updated = NOW()
    WHERE user_id = NEW.user_id
    AND topic = NEW.topic;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update priorities
CREATE TRIGGER trigger_update_topic_priority
AFTER INSERT ON content_requests
FOR EACH ROW
EXECUTE FUNCTION update_topic_priority();
