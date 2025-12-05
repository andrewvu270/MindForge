# Design Document - As Built

## Overview

MindForge is an AI-powered microlearning platform that delivers personalized education through multiple learning modalities. The system uses AI agents to orchestrate content generation from 10+ external APIs, synthesize lessons, generate quizzes, and create mobile-optimized media.

**Key Innovation:** Multi-modal learning (swipe cards, deep read, video, flashcards) combined with AI-powered content generation and quiz-based validation ensures actual learning, not just content consumption.

The platform is built with React (web) + FastAPI architecture with AI orchestration services, external API integrations, and gamification features.

## Architecture

### High-Level Architecture (As Built)

```
┌─────────────────────────────────────────────────────────────┐
│              React Web Frontend (Vite + TypeScript)          │
│  Feed │ Learn (Swipe) │ LearnRead │ LearnVideo │ Review     │
│  Quiz │ Progress │ Curriculum │ Achievements │ Leaderboard  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AI Agent Orchestration                       │   │
│  │  - API Selector Agent (chooses best sources)        │   │
│  │  - Content Intelligence Agent (synthesizes)         │   │
│  │  - Quiz Generation Agent (creates assessments)      │   │
│  │  - Video Planning Agent (structures videos)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         LLM Service (Groq + OpenAI Fallback)        │   │
│  │  - Lesson synthesis                                  │   │
│  │  - Quiz generation (5 questions, batch processing)  │   │
│  │  - JSON repair logic                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Media Generation Services                    │   │
│  │  - Image: Hugging Face Stable Diffusion (9:16)     │   │
│  │  - Audio: TTS + Music Mixing                        │   │
│  │  - Video: Planning + Scene Generation               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Progress & Gamification Service              │   │
│  │  - Quiz-based completion (60%+ pass)                │   │
│  │  - Streak tracking, points, achievements            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  External APIs (10+ sources)                 │
│  arXiv │ Reddit │ HackerNews │ NASA │ FRED │ Yahoo Finance │
│  Google Books │ YouTube │ BBC News │ RSS Feeds              │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Supabase (PostgreSQL + Storage)                 │
│  Tables: lessons, quizzes, quiz_questions, user_progress,   │
│          learning_paths, flashcards, achievements            │
│  Storage: Generated images, audio, videos                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions (As Built)

1. **Multi-Agent AI Architecture**: Specialized agents for API selection, content synthesis, quiz generation, and video planning
2. **LLM Fallback Chain**: Groq (Llama 3 70B) → OpenAI (GPT-4) → Hardcoded fallback for resilience
3. **Mobile-First Media**: All images 9:16 portrait (1080x1920), videos vertical, optimized for mobile consumption
4. **Quiz-Based Validation**: Lessons only marked complete when users pass quiz with 60%+ (validates actual learning)
5. **Batch Processing**: Quizzes generated in batches of 3 questions to avoid JSON truncation
6. **JSON Repair Logic**: Handles incomplete LLM responses gracefully
7. **Multi-Modal Learning**: Four learning modes (swipe, read, video, review) for different learning styles
8. **Real-Time Progress**: Stats update immediately on quiz completion (topics learned, minutes, streaks)

## Components and Interfaces (As Built)

### Backend Components

#### 1. AI Agent System

**Purpose**: Orchestrate content generation using specialized AI agents

**Key Classes**:
- `APISelector` (`backend/agents/api_selector_agent.py`): Intelligently selects best APIs for each topic
- `ContentIntelligence` (`backend/agents/content_intelligence_agent.py`): Synthesizes multi-source content
- `QuizGenerator` (`backend/agents/quiz_generation_agent.py`): Creates contextual quizzes
- `VideoPlanningAgent` (`backend/agents/video_planning_agent.py`): Plans video structure

**Implementation**:
```python
# API Selector Agent
class APISelector:
    async def select_apis(self, field: str, topic: str, available_apis: List[str]) -> List[str]:
        # Uses LLM to intelligently choose best sources
        
# Content Intelligence Agent  
class ContentIntelligence:
    async def synthesize_lesson(self, sources: List[dict]) -> dict:
        # Multi-source content fusion with AI
```

#### 2. LLM Service with Fallback Chain

**Purpose**: Robust LLM calls with automatic fallback

**Key Classes**:
- `FreeLLMService` (`backend/services/free_llm_service.py`): Main LLM orchestrator
- Groq client (primary, fast)
- OpenAI client (fallback, reliable)
- JSON repair logic for incomplete responses

**Implementation**:
```python
class FreeLLMService:
    async def generate_quiz(self, lesson_content: str) -> List[dict]:
        # Batch processing (3 questions at a time)
        # Groq → OpenAI fallback
        # JSON repair for incomplete responses
        # Retry logic (2 attempts)
```

#### 3. Media Generation Services

**Purpose**: Generate mobile-optimized images, audio, and video content

**Key Classes**:
- `ImageGenerationService` (`backend/services/image_generation_service.py`): Hugging Face Stable Diffusion
- `TTSService` (`backend/services/tts_service.py`): Text-to-speech for narration
- `MusicService` (`backend/services/music_service.py`): Background music generation
- `AudioMixerService` (`backend/services/audio_mixer_service.py`): Mix narration + music
- `VideoGenerationService` (`backend/services/video_generation_service.py`): Video assembly

**Implementation**:
```python
class ImageGenerationService:
    async def generate_lesson_image(self, lesson_content: str, field: str) -> str:
        # Mobile-optimized 9:16 portrait (1080x1920)
        # Field-specific visual styles
        # No text overlays, safe zones for UI
        # Uploads to Supabase storage
```

#### 4. Progress & Gamification Service

**Purpose**: Track learning progress with quiz-based validation

**Key Classes**:
- `ProgressService` (`backend/services/progress_service.py`): Tracks completion, streaks, study time
- `GamificationService` (`backend/services/gamification_service.py`): Points, achievements, leaderboard

**Implementation**:
```python
class ProgressService:
    async def complete_lesson(self, user_id: str, lesson_id: str):
        # Only called when user passes quiz (60%+)
        # Increments lessons_completed
        # Updates total_study_time_minutes
        # Calculates streak (consecutive days)
        # Updates last_activity timestamp
        
    async def get_user_stats(self, user_id: str) -> dict:
        # Returns: topics_learned, minutes, current_streak
```

#### 5. Auto Content Generator

**Purpose**: Automatically generate complete lessons with all components

**Key Classes**:
- `AutoContentGenerator` (`backend/services/auto_content_generator.py`): Orchestrates full lesson generation

**Implementation**:
```python
class AutoContentGenerator:
    async def generate_lesson(self, field: str, topic: str) -> dict:
        # 1. Select best APIs for topic
        # 2. Fetch content from multiple sources
        # 3. Synthesize lesson content
        # 4. Generate 5 quiz questions (batch processing)
        # 5. Create mobile-optimized image (9:16)
        # 6. Plan video structure
        # 7. Generate flashcards
        # 8. Store everything in database
```

### Frontend Components (As Built)

#### Core Learning Pages
- `Feed.tsx`: TikTok-style feed of lessons with "Learn More" button → `/lessons/:id`
- `Learn.tsx`: Swipe cards mode (TikTok-style vertical swipe)
- `LearnRead.tsx`: Deep read mode (long-form article)
- `LearnVideo.tsx`: Video learning mode (9:16 portrait)
- `Flashcards.tsx`: Review mode (spaced repetition)
- `Quiz.tsx`: Assessment with 60% pass threshold for completion

#### Navigation Features
- **Cross-Learning Styles**: Each learning page shows 3 other modes (Swipe Cards, Video, Deep Read, Review)
- **Simple Button UI**: Text-only buttons for quick mode switching
- **Consistent Routing**: All modes accessible from any learning page

#### Progress & Gamification
- `Dashboard.tsx`: Home page with stats (topics learned, minutes, day streak)
- `Progress.tsx`: Detailed progress tracking
- `Achievements.tsx`: Unlocked achievements and badges
- `Leaderboard.tsx`: Global rankings
- `Curriculum.tsx`: Learning paths and structured courses

#### Key UI Decisions
- **Mobile-first design**: All layouts optimized for mobile screens
- **Text contrast**: `text-gray-900` and `text-gray-600` on white backgrounds for readability
- **9:16 images**: All lesson images portrait format for mobile
- **Lottie animations**: Smooth, engaging animations throughout

## Data Models (As Built)

### Core Models

```python
# Lessons (backend/models.py)
class Lesson(BaseModel):
    id: str
    field_id: str
    title: str
    content: str  # AI-synthesized from multiple sources
    summary: str
    estimated_minutes: int
    difficulty_level: str
    image_url: Optional[str]  # 9:16 portrait from Hugging Face
    video_url: Optional[str]
    audio_url: Optional[str]
    sources: Optional[List[str]]  # Source attribution
    created_at: datetime

# Quiz Questions (stored in quiz_questions table)
class QuizQuestion(BaseModel):
    id: str
    lesson_id: str
    question: str
    options: List[str]  # 4 options for multiple choice
    correct_answer: str
    explanation: str
    order: int  # Question order (1-5)

# Quiz Submissions
class QuizSubmission(BaseModel):
    user_id: str
    lesson_id: str
    answers: dict  # question_id -> user_answer
    score: int  # Number correct
    percentage: float  # Score percentage
    passed: bool  # True if >= 60%
    submitted_at: datetime

# User Progress (tracks completion via quiz validation)
class UserProgress(BaseModel):
    user_id: str
    field_id: str
    lessons_completed: int  # Only increments on quiz pass (60%+)
    total_study_time_minutes: int
    current_streak: int  # Consecutive days
    longest_streak: int
    last_activity: datetime

# Learning Paths
class LearningPath(BaseModel):
    id: str
    field_id: str
    title: str
    description: str
    difficulty_level: str
    estimated_hours: int
    lessons: List[str]  # Ordered lesson IDs
    created_at: datetime

# Flashcards (for review mode)
class Flashcard(BaseModel):
    id: str
    lesson_id: str
    front: str  # Question/term
    back: str  # Answer/definition
    difficulty: int  # Spaced repetition difficulty
    next_review: datetime
```

### Database Schema (As Built)

See `database/migrations/` for complete schema:

**Key Tables:**

```sql
-- Lessons (000_base_schema.sql)
CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    field_id VARCHAR(50) REFERENCES fields(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    estimated_minutes INT,
    difficulty_level VARCHAR(20),
    image_url TEXT,  -- Supabase storage URL
    video_url TEXT,
    audio_url TEXT,
    sources JSONB,  -- Array of source APIs used
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Questions (002_flashcards_and_quizzes.sql)
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,  -- Array of 4 options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order INT,  -- 1-5
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Submissions
CREATE TABLE quiz_submissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    lesson_id UUID REFERENCES lessons(id),
    answers JSONB NOT NULL,
    score INT NOT NULL,
    percentage FLOAT NOT NULL,
    passed BOOLEAN NOT NULL,  -- True if >= 60%
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- User Progress (tracks quiz-validated completion)
CREATE TABLE user_progress (
    user_id UUID NOT NULL,
    field_id VARCHAR(50) REFERENCES fields(id),
    lessons_completed INT DEFAULT 0,  -- Only increments on quiz pass
    total_study_time_minutes INT DEFAULT 0,
    current_streak INT DEFAULT 0,  -- Consecutive days
    longest_streak INT DEFAULT 0,
    last_activity TIMESTAMP,
    PRIMARY KEY (user_id, field_id)
);

-- Learning Paths (004_learning_paths.sql)
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY,
    field_id VARCHAR(50) REFERENCES fields(id),
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20),
    estimated_hours INT,
    lessons JSONB NOT NULL,  -- Ordered array of lesson IDs
    created_at TIMESTAMP DEFAULT NOW()
);

-- Flashcards (002_flashcards_and_quizzes.sql)
CREATE TABLE flashcards (
    id UUID PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty INT DEFAULT 0,
    next_review TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```


## Key Implementation Details

### Quiz Generation System

**Challenge:** LLMs generating incomplete JSON, causing fallback quizzes

**Solution Implemented:**
1. **Batch Processing**: Generate 3 questions at a time instead of all 5
2. **JSON Repair Logic**: Handle incomplete JSON responses gracefully
3. **Fallback Chain**: Groq → OpenAI → Hardcoded fallback
4. **Retry Logic**: 2 attempts per generation
5. **Environment Loading**: Explicit `load_dotenv()` for API keys

### Quiz-Based Completion Validation

**Philosophy:** Lessons only count as "complete" when users demonstrate learning

**Implementation:**
- Quiz pass threshold: 60% (3/5 questions correct)
- `Quiz.tsx` calls `apiService.completeLesson()` only when `percentage >= 60`
- Stats update in real-time: topics learned, minutes, day streak
- Streak calculation based on consecutive days of activity

### Mobile-First Media Generation

**Images:**
- Aspect ratio: 9:16 portrait (1080x1920)
- Generated via Hugging Face Stable Diffusion
- Field-specific visual styles (tech = futuristic, finance = professional, etc.)
- No text overlays, safe zones for UI elements
- Uploaded to Supabase storage

**Videos:**
- Vertical format (9:16) for mobile
- AI-planned scene structure
- TTS narration + background music mixing
- Optimized for short attention spans (5-7 minutes)

## Error Handling (As Implemented)

### LLM Service Failures

**Groq → OpenAI Fallback Chain:**
```python
try:
    response = await self._generate_with_groq(prompt)
except Exception as e:
    logger.warning(f"Groq failed: {e}, falling back to OpenAI")
    response = await self._generate_with_openai(prompt)
```

**JSON Repair Logic:**
- Handles incomplete JSON from LLM responses
- Attempts to repair common JSON errors
- Falls back to hardcoded quiz if repair fails

**Retry Logic:**
- 2 attempts per LLM call
- Exponential backoff between retries
- Comprehensive error logging

### External API Failures

**Implemented:**
- Timeout handling (10-30 seconds depending on API)
- Try/except blocks around all API calls
- Logging of failures for debugging
- Graceful degradation (continue with available sources)

**Not Implemented:**
- Automatic retry logic for external APIs
- Request queuing for rate limits
- Caching layer (would improve performance)

### Database Failures

**Implemented:**
- Supabase client handles connection pooling
- Error logging for failed queries
- Transaction support for multi-step operations

**Known Issues:**
- Occasional timeout errors during lesson generation (Supabase free tier limits)
- No automatic retry for failed database writes

## Testing Strategy (As Implemented)

### Manual Testing

**Primary Testing Approach:**
- Manual testing through web interface
- Testing quiz generation with debug scripts
- Verifying lesson generation end-to-end
- UI/UX testing across different screen sizes

**Test Scripts Created:**
- `test_quiz_generation_debug.py` - Debug quiz generation issues
- `test_one_lesson.py` - Test single lesson generation
- `test_complete_lesson.py` - Test full lesson pipeline
- `generate_six_lessons.py` - Generate multiple lessons for testing

### Integration Testing

**Tested Workflows:**
1. **Lesson Generation Pipeline:**
   - API selection → Content fetching → AI synthesis → Quiz generation → Image generation → Database storage
   
2. **Quiz Workflow:**
   - Quiz generation → User submission → Scoring → Completion validation (60%+) → Progress update

3. **Multi-Modal Learning:**
   - Swipe cards → Deep read → Video → Review (flashcards)
   - Cross-learning style navigation

4. **Progress Tracking:**
   - Quiz completion → Stats update → Streak calculation

### Known Issues & Limitations

**Database Timeouts:**
- Occasional Supabase timeout errors during lesson generation
- Transient network issues, not code bugs
- Workaround: Retry failed generations manually

**API Rate Limits:**
- Free tier limits on external APIs
- No automatic rate limit handling
- Manual monitoring required

**Testing Gaps:**
- No automated unit tests
- No property-based testing
- No CI/CD pipeline
- Limited error scenario testing

## Performance Considerations (As Implemented)

### Current Performance

**Lesson Generation:**
- Takes 20-30 seconds per lesson (API calls + LLM + image generation)
- Batch processing for quizzes (3 questions at a time) reduces timeouts
- Async/await used throughout for non-blocking operations

**Image Generation:**
- Hugging Face Stable Diffusion: 5-10 seconds per image
- Images uploaded to Supabase storage
- URLs stored in database for fast retrieval

**Database Queries:**
- Simple queries (< 100ms)
- Occasional timeouts on complex writes (Supabase free tier)
- No caching layer implemented

### Optimization Opportunities

**Not Implemented (Would Improve Performance):**
1. **Caching Layer**: Redis for API responses, generated content
2. **Background Jobs**: Celery/RQ for async lesson generation
3. **Database Indexing**: Additional indexes on frequently queried fields
4. **CDN**: For serving images and static assets
5. **Connection Pooling**: Advanced database connection management
6. **Lazy Loading**: Load lesson content on-demand
7. **Pagination**: For large lists (currently loading all items)

### Scalability Considerations

**Current Architecture:**
- FastAPI backend deployed on Vercel (serverless)
- Supabase free tier (limited connections, storage)
- No load balancing or horizontal scaling

**For Production:**
- Move to dedicated backend hosting (Railway, Render, AWS)
- Upgrade Supabase tier for better performance
- Implement caching layer (Redis)
- Add CDN for media assets
- Background job queue for lesson generation

## Security Considerations (As Implemented)

**Implemented:**
1. **API Key Management**: All keys in `.env` file, loaded via `load_dotenv()`
2. **Environment Variables**: Groq, OpenAI, Hugging Face, Supabase keys
3. **Supabase Client**: Parameterized queries prevent SQL injection
4. **CORS**: Configured in FastAPI for frontend domain

**Not Implemented:**
1. **User Authentication**: Currently using hardcoded `user_1` for testing
2. **Rate Limiting**: No per-user rate limits
3. **Input Validation**: Minimal validation on user inputs
4. **Authorization**: No role-based access control
5. **API Key Rotation**: No automatic key rotation

**For Production:**
- Implement Supabase Auth for real user authentication
- Add rate limiting middleware
- Validate and sanitize all user inputs
- Implement proper authorization checks
- Set up API key rotation policies
- Add request logging and monitoring

## Deployment Strategy (As Implemented)

### Current Deployment

**Frontend:**
- Deployed on Vercel: https://mindforge.vercel.app/
- React + Vite + TypeScript
- Automatic deployments from GitHub main branch

**Backend:**
- Deployed on Vercel (serverless functions)
- FastAPI with Python 3.11
- Environment variables configured in Vercel dashboard

**Database:**
- Supabase hosted PostgreSQL (free tier)
- Supabase Storage for media files (images, audio, video)

**External Services:**
- Groq API (primary LLM)
- OpenAI API (fallback LLM)
- Hugging Face API (image generation)
- 10+ external content APIs

### Development Workflow

**Built with Kiro IDE:**
- Vibe coding approach (conversational development)
- Rapid iteration on features
- Real-time debugging and fixes
- Multi-file coordinated changes

**Version Control:**
- GitHub repository
- Main branch auto-deploys to Vercel
- No CI/CD pipeline (manual testing)

### Production Readiness

**What's Working:**
- ✅ Full lesson generation pipeline
- ✅ Multi-modal learning interface
- ✅ Quiz-based completion validation
- ✅ Progress tracking and gamification
- ✅ Mobile-optimized media

**What Needs Work:**
- ❌ User authentication (currently hardcoded user)
- ❌ Rate limiting and abuse prevention
- ❌ Caching layer for performance
- ❌ Automated testing suite
- ❌ Error monitoring and logging
- ❌ Database connection pooling
- ❌ Background job queue

### Future Deployment Improvements

1. **Authentication**: Implement Supabase Auth
2. **Monitoring**: Add Sentry for error tracking
3. **Caching**: Redis layer for API responses
4. **Background Jobs**: Celery/RQ for async tasks
5. **CI/CD**: Automated testing and deployment
6. **Database**: Upgrade Supabase tier for production
7. **CDN**: CloudFlare for media assets

