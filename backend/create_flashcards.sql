-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id),
    field_id TEXT,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    topic TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON flashcards FOR INSERT WITH CHECK (true);
