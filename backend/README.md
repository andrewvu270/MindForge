# MindForge Backend

AI-powered microlearning platform with multi-source content integration.

## Quick Start

```bash
# Install dependencies
pip3 install -r requirements.txt

# Set OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Run demo
python3 demo.py

# Start API server
python3 main.py
```

## Architecture

```
Backend
├── agents/              # AI agents (synthesis, quiz, reflection, recommendation)
├── services/           # Core services (LLM, orchestration, gamification)
│   └── adapters/      # External API adapters (5 sources)
├── api/               # FastAPI endpoints
└── tests/             # 45+ tests
```

## Key Features

### 1. Multi-Source Integration
- Fetches from 5 heterogeneous sources
- Normalizes different data types (text, numeric, discussions, news)
- Parallel fetching with fallback mechanisms

### 2. AI Agents
- **LessonSynthesisAgent**: Combines multiple sources into coherent lessons
- **QuizGenerationAgent**: Creates quiz questions from content
- **ReflectionAnalysisAgent**: Analyzes user reflections
- **RecommendationAgent**: Suggests next lessons

### 3. Gamification
- Points system with difficulty multipliers
- Streak tracking with bonuses
- 6 achievements
- Leaderboard with rankings

## API Endpoints

### Lessons
- `POST /api/lessons/generate` - Generate lesson from multiple sources
- `GET /api/lessons/health` - Health check

### Gamification
- `POST /api/gamification/award-points` - Award points
- `GET /api/gamification/stats/{user_id}` - User stats
- `GET /api/gamification/leaderboard` - Rankings
- `GET /api/gamification/achievements` - All achievements

## Testing

```bash
# Run all tests
python3 -m pytest tests/ -v

# Run specific test file
python3 -m pytest tests/test_integration.py -v

# Run with coverage
python3 -m pytest tests/ --cov=. --cov-report=html
```

## Environment Variables

```bash
OPENAI_API_KEY=your-key-here  # Required for AI synthesis
SUPABASE_URL=your-url         # Optional, for database
SUPABASE_KEY=your-key         # Optional, for database
```

## Development

```bash
# Format code
black .

# Type checking
mypy .

# Linting
flake8 .
```
