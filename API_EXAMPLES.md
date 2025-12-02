# MindForge API Examples

## Setup

```bash
# Set OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Start the server
cd backend
python3 main.py
```

Server runs at: `http://localhost:8000`

## 1. Generate a Lesson (The Frankenstein Magic! 🧪)

```bash
curl -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{
    "field": "technology",
    "topic": "artificial intelligence",
    "num_sources": 3,
    "generate_quiz": true,
    "num_quiz_questions": 5
  }'
```

**What happens:**
1. Fetches from Hacker News, Reddit, Wikipedia
2. AI synthesizes heterogeneous sources into one lesson
3. Generates 5 quiz questions
4. Returns unified lesson with source attribution

**Response:**
```json
{
  "lesson": {
    "title": "Understanding Artificial Intelligence",
    "summary": "AI combines insights from...",
    "learning_objectives": [...],
    "key_concepts": [...],
    "sources": [
      {"name": "hackernews", "title": "...", "url": "..."},
      {"name": "reddit", "title": "...", "url": "..."},
      {"name": "wikipedia", "title": "...", "url": "..."}
    ]
  },
  "quiz": {
    "questions": [...]
  },
  "metadata": {
    "num_sources": 3,
    "sources": [...]
  }
}
```

## 2. Award Points for Completing a Lesson

```bash
curl -X POST http://localhost:8000/api/gamification/award-points \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "activity_type": "lesson_completed",
    "difficulty": "intermediate",
    "completion_time_minutes": 8
  }'
```

**Response:**
```json
{
  "points_earned": 20,
  "new_streak": 1,
  "streak_milestone": null,
  "new_achievements": [
    {
      "id": "first_lesson",
      "name": "First Steps",
      "description": "Complete your first lesson",
      "icon": "🎓",
      "points": 10
    }
  ],
  "total_achievement_points": 10
}
```

## 3. Get User Stats

```bash
curl http://localhost:8000/api/gamification/stats/user123
```

**Response:**
```json
{
  "user_id": "user123",
  "total_points": 30,
  "current_streak": 1,
  "longest_streak": 1,
  "lessons_completed": 1,
  "quizzes_completed": 0,
  "reflections_submitted": 0,
  "unlocked_achievements": ["first_lesson"],
  "rank": 1
}
```

## 4. Get Leaderboard

```bash
curl http://localhost:8000/api/gamification/leaderboard?limit=10
```

**Response:**
```json
[
  {
    "rank": 1,
    "user_id": "user123",
    "username": "User123",
    "total_points": 30,
    "current_streak": 1,
    "lessons_completed": 1
  }
]
```

## 5. Get All Achievements

```bash
curl http://localhost:8000/api/gamification/achievements
```

**Response:**
```json
{
  "achievements": [
    {
      "id": "first_lesson",
      "name": "First Steps",
      "description": "Complete your first lesson",
      "icon": "🎓",
      "criteria": {"lessons_completed": 1},
      "points": 10
    },
    {
      "id": "ten_lessons",
      "name": "Dedicated Learner",
      "description": "Complete 10 lessons",
      "icon": "📚",
      "criteria": {"lessons_completed": 10},
      "points": 50
    }
  ]
}
```

## 6. Get User's Achievements

```bash
curl http://localhost:8000/api/gamification/achievements/user123
```

**Response:**
```json
{
  "unlocked": [
    {
      "id": "first_lesson",
      "name": "First Steps",
      "icon": "🎓",
      "points": 10
    }
  ],
  "locked": [
    {
      "id": "ten_lessons",
      "name": "Dedicated Learner",
      "icon": "📚",
      "points": 50
    }
  ]
}
```

## 7. Health Check

```bash
curl http://localhost:8000/api/lessons/health
```

**Response:**
```json
{
  "status": "healthy",
  "adapters": ["hackernews", "reddit", "finance", "wikipedia", "rss"],
  "agents": ["synthesis", "quiz"]
}
```

## Complete User Flow Example

```bash
# 1. Generate a lesson about AI
LESSON=$(curl -s -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{"field": "technology", "topic": "AI", "generate_quiz": true}')

echo "Lesson generated!"

# 2. Award points for completing the lesson
curl -X POST http://localhost:8000/api/gamification/award-points \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo_user",
    "activity_type": "lesson_completed",
    "difficulty": "intermediate"
  }'

# 3. Award points for completing the quiz (perfect score!)
curl -X POST http://localhost:8000/api/gamification/award-points \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo_user",
    "activity_type": "quiz_completed",
    "quiz_score": 100
  }'

# 4. Check user stats
curl http://localhost:8000/api/gamification/stats/demo_user

# 5. Check leaderboard
curl http://localhost:8000/api/gamification/leaderboard
```

## Testing Different Fields

```bash
# Technology
curl -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{"field": "technology", "topic": "machine learning"}'

# Finance
curl -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{"field": "finance", "topic": "stock market"}'

# Culture
curl -X POST http://localhost:8000/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{"field": "culture", "topic": "philosophy"}'
```

## Points System

| Activity | Base Points | Multipliers |
|----------|-------------|-------------|
| Lesson (Beginner) | 10 | 1.0x |
| Lesson (Intermediate) | 15 | 1.5x |
| Lesson (Advanced) | 20 | 2.0x |
| Lesson (Expert) | 25 | 2.5x |
| Quiz Completed | 5 | - |
| Perfect Quiz | +15 | Bonus |
| Reflection | 8 | - |
| 7-day Streak | - | +10% all points |
| 30-day Streak | - | +50% all points |
| Speed Bonus (<10 min) | +5 | Bonus |

## Achievements

1. **First Steps** (🎓) - Complete 1 lesson - 10 pts
2. **Dedicated Learner** (📚) - Complete 10 lessons - 50 pts
3. **Perfect Score** (💯) - Get 100% on a quiz - 25 pts
4. **Week Warrior** (🔥) - 7-day streak - 30 pts
5. **Renaissance Learner** (🌈) - Study 3 fields - 40 pts
6. **Self-Aware** (🧘) - Submit 10 reflections - 35 pts

---

**Pro Tip:** The `/api/lessons/generate` endpoint is the core "Frankenstein" feature - it fetches from multiple heterogeneous sources and uses AI to synthesize them into one coherent lesson!
