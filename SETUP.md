# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key

## Backend Setup

```bash
cd backend

# 1. Install dependencies
pip3 install -r requirements.txt

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...

# 4. Test the system
python3 demo.py

# 5. Start the API server
python3 main.py
```

Server runs at: http://localhost:8000

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file (optional, defaults to localhost:8000)
cp .env.example .env

# 3. Start the app
npm start
```

## Quick Test

### Option 1: Demo Script (No Frontend)
```bash
cd backend
python3 demo.py
```

This will:
- Fetch from multiple sources
- Synthesize a lesson with AI
- Generate quiz questions
- Show gamification system

### Option 2: API Test (No Frontend)
```bash
# Start backend
cd backend
python3 main.py

# In another terminal, test the API
curl -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{
    "field": "technology",
    "topic": "AI",
    "generate_quiz": true
  }'
```

### Option 3: Full Stack (With Frontend)
```bash
# Terminal 1: Backend
cd backend
python3 main.py

# Terminal 2: Frontend
cd frontend
npm start

# Then open the app and tap "Demo" tab
```

## Getting OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

## Troubleshooting

### "OPENAI_API_KEY not set"
- Make sure you created `backend/.env` file
- Make sure the key starts with `sk-`
- Restart the backend server after adding the key

### "Connection refused" on frontend
- Make sure backend is running on port 8000
- Check `frontend/.env` has correct API URL
- If testing on physical device, use your computer's IP address

### "Module not found"
```bash
# Backend
cd backend
pip3 install -r requirements.txt

# Frontend
cd frontend
npm install
```

## What You Can Do

1. **Generate Lessons** - Fetch from multiple sources and synthesize with AI
2. **Take Quizzes** - AI-generated questions from lesson content
3. **Earn Points** - Complete lessons and quizzes to earn points
4. **Track Streaks** - Daily learning streaks with bonuses
5. **Unlock Achievements** - 6 achievements to unlock
6. **Compete** - Leaderboard with rankings

## API Endpoints

- `POST /api/lessons/generate` - Generate multi-source lesson
- `POST /api/gamification/award-points` - Award points
- `GET /api/gamification/stats/{user_id}` - Get user stats
- `GET /api/gamification/leaderboard` - Get rankings
- `GET /api/gamification/achievements` - List achievements

See `API_EXAMPLES.md` for more examples.
