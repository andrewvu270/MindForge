# MindForge

AI-powered microlearning platform that synthesizes content from multiple sources into personalized lessons with quizzes, flashcards, and video generation.

## Features

- Multi-source lesson synthesis from 16+ APIs (HackerNews, Reddit, RSS, YouTube, Wikipedia, arXiv, NASA, etc.)
- AI-generated quizzes and spaced repetition flashcards
- Video lessons with narration and visuals
- Gamification: points, streaks, achievements, leaderboards
- Intelligent API selection (LLM-powered)
- Six learning fields: Technology, Finance, Economics, Culture, Influence, Global Events

## Tech Stack

- **Frontend**: React (Vite, TypeScript, TailwindCSS), React Native (Expo)
- **Backend**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL + Bucket Storage)
- **LLM**: Groq (llama-3.3-70b-versatile), OpenAI (gpt-4o-mini fallback)
- **ML**: Text-to-image (HuggingFace FLUX.1-schnell/SDXL, Ollama Cloud, Pollinations), Text-to-speech (Coqui TTS, eSpeak fallback)
- **Content APIs**: Wikipedia, YouTube, Google Books, BBC News (NewsAPI), FRED, NASA, Reddit, Hacker News, arXiv, Yahoo Finance, RSS
- **Agents**: LessonSynthesis Agent, QuizGeneration Agent, ReflectionAnalysis Agent, Recommendation Agent, APISelector Agent, ContentSmart Agent, VideoPlanning Agent
- **Animations**: LottieFiles, MagicUI

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- FFmpeg (`brew install ffmpeg`)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```bash
GROQ_API_KEY=gsk_your_key
HUGGINGFACE_TOKEN=hf_your_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_KEY=your_service_role_key
SUPABASE_BUCKET=lesson-videos
```

Run migrations in Supabase SQL Editor:
```bash
database/migrations/001_frankenstein_feature.sql
database/migrations/002_flashcards_and_quizzes.sql
```

Start server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontendweb
npm install
npm run dev
```

Web app: http://localhost:5173
API docs: http://localhost:8000/docs

## API Keys

### Required (FREE)
- **Groq**: https://console.groq.com (14,400 req/day)
- **HuggingFace**: https://huggingface.co/settings/tokens (1,000 req/day)
- **Supabase**: https://supabase.com (500MB free)

### Optional
- OpenAI, YouTube, NASA, NewsAPI, FRED, Google Books

## Testing

```bash
cd backend
python test_free_stack.py  # Test all services
python -m pytest tests/ -v  # Run tests
```

## Generate Lessons

```bash
cd backend
python free_scheduler.py  # Generate 100 lessons
```

## Cost

Using FREE tier services: **$0/month** for 100 lessons/day

## Current Status

- Backend: 100% functional
- Frontend UI: 100% complete
- Video Generation: 80% (requires FFmpeg)
- Testing: 70% coverage

## Troubleshooting

- **SSL errors**: Run `/Applications/Python\ 3.11/Install\ Certificates.command`
- **FFmpeg not found**: `brew install ffmpeg`
- **Database errors**: Verify Supabase credentials and run migrations
