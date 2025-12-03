# Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg: `brew install ffmpeg`

## Backend

```bash
cd backend
pip install -r requirements.txt
```

### Environment Variables

Create `backend/.env`:
```bash
# Required - AI Services
GROQ_API_KEY=gsk_your_groq_key
HUGGINGFACE_TOKEN=hf_your_token

# Required - Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_KEY=your_service_role_key
SUPABASE_BUCKET=lesson-videos

# Optional
OPENAI_API_KEY=sk_your_openai_key
```

### Database Setup

Run in Supabase SQL Editor:
```sql
-- Run these migration files:
-- database/migrations/001_frankenstein_feature.sql
-- database/migrations/002_flashcards_and_quizzes.sql
```

### Supabase Storage

1. Go to Supabase Dashboard > Storage
2. Create bucket: `lesson-videos` (public)

### Start Server

```bash
uvicorn main:app --reload --port 8000
```

## Frontend

```bash
cd frontendweb
npm install
npm run dev
```

## API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| Groq | https://console.groq.com | 14,400/day |
| HuggingFace | https://huggingface.co/settings/tokens | 1,000/day |
| Supabase | https://supabase.com | 500MB |
| NASA | https://api.nasa.gov | 1,000/hour |
| NewsAPI | https://newsapi.org | 100/day |

## Testing

```bash
cd backend
python test_free_stack.py  # Test services
python -m pytest tests/ -v  # Run tests
```

## Troubleshooting

- **SSL errors**: `/Applications/Python\ 3.11/Install\ Certificates.command`
- **FFmpeg**: `brew install ffmpeg`
- **Database**: Check Supabase credentials, run migrations
