# Design Document

## Overview

MindForge + Frankenstein Microlearning Hub is an AI-powered platform that orchestrates multiple heterogeneous data sources within each learning field to create unified, coherent micro-lessons. The system's core innovation is using AI as an integration layer that normalizes different data types (numeric, informal text, video transcripts, structured content) and synthesizes them into bite-sized lessons with automatically generated quizzes, reflections, and scheduling.

The platform extends the existing React Native + FastAPI architecture with new AI orchestration services, external API integrations, and gamification features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Frontend                     │
│  (Existing screens + New: Reflections, Leaderboard, Calendar)│
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Content Orchestration Service                │   │
│  │  (Multi-source fetching + normalization)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AI Synthesis Service                         │   │
│  │  (OpenAI/Hugging Face integration)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Gamification Service                         │   │
│  │  (Points, streaks, achievements, leaderboard)        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  External APIs Layer                         │
│  Hacker News │ Reddit │ Yahoo Finance │ FRED │ Google Books │
│  YouTube │ BBC News │ Wikipedia                              │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Supabase (PostgreSQL + Auth)                    │
│  Tables: lessons, quizzes, progress, reflections,           │
│          achievements, leaderboard, scheduled_sessions       │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **AI as Integration Layer**: AI models (OpenAI/Hugging Face) serve as the "glue" that normalizes and synthesizes heterogeneous data types
2. **Parallel API Fetching**: Multiple external APIs are called concurrently to minimize latency
3. **Caching Strategy**: External API responses cached for 1-6 hours depending on content freshness requirements
4. **Fallback Mechanisms**: If external APIs fail, system falls back to internal MindForge content only
5. **Rate Limiting**: Implement request queuing and exponential backoff for API rate limits

## Components and Interfaces

### Backend Components

#### 1. Content Orchestration Service

**Purpose**: Fetch and normalize content from multiple heterogeneous sources

**Key Classes**:
- `ContentOrchestrator`: Main coordinator for multi-source fetching
- `SourceAdapter`: Abstract base class for API-specific adapters
- `HackerNewsAdapter`, `RedditAdapter`, `YahooFinanceAdapter`, etc.
- `ContentNormalizer`: Transforms different data types into common format

**Interfaces**:
```python
class SourceAdapter(ABC):
    @abstractmethod
    async def fetch(self, topic: str, limit: int) -> List[RawContent]
    
    @abstractmethod
    def normalize(self, raw_content: RawContent) -> NormalizedContent

class ContentOrchestrator:
    async def fetch_multi_source(
        self, 
        field: str, 
        topic: str, 
        sources: List[str]
    ) -> List[NormalizedContent]
```

#### 2. AI Synthesis Service

**Purpose**: Use AI models to synthesize content, generate quizzes, and provide feedback

**Key Classes**:
- `AIClient`: Wrapper for OpenAI/Hugging Face API calls
- `LessonSynthesizer`: Generates coherent lesson summaries from multiple sources
- `QuizGenerator`: Creates quiz questions from lesson content
- `ReflectionAnalyzer`: Analyzes user reflections and provides feedback

**Interfaces**:
```python
class AIClient:
    async def synthesize_lesson(
        self, 
        contents: List[NormalizedContent], 
        max_words: int = 200
    ) -> str
    
    async def generate_quiz(
        self, 
        lesson_content: str, 
        num_questions: int = 5
    ) -> List[QuizQuestion]
    
    async def analyze_reflection(
        self, 
        reflection_text: str, 
        user_history: List[Reflection]
    ) -> ReflectionFeedback
    
    async def recommend_lessons(
        self, 
        user_progress: UserProgress, 
        available_lessons: List[Lesson]
    ) -> List[str]
```

#### 3. Gamification Service

**Purpose**: Manage points, streaks, achievements, and leaderboard

**Key Classes**:
- `PointsCalculator`: Calculates points based on activity
- `StreakTracker`: Manages daily streaks
- `AchievementManager`: Unlocks and tracks achievements
- `LeaderboardManager`: Updates and retrieves leaderboard rankings

**Interfaces**:
```python
class GamificationService:
    async def award_points(
        self, 
        user_id: str, 
        activity_type: str, 
        metadata: dict
    ) -> int
    
    async def update_streak(self, user_id: str) -> int
    
    async def check_achievements(
        self, 
        user_id: str, 
        user_stats: UserStats
    ) -> List[Achievement]
    
    async def get_leaderboard(
        self, 
        scope: str = "global", 
        limit: int = 100
    ) -> List[LeaderboardEntry]
```

#### 4. Scheduling Service

**Purpose**: Automatically schedule learning sessions

**Key Classes**:
- `SessionScheduler`: Creates and manages scheduled sessions
- `NotificationManager`: Sends reminders for upcoming sessions

**Interfaces**:
```python
class SessionScheduler:
    async def create_schedule(
        self, 
        user_id: str, 
        preferences: SchedulePreferences
    ) -> List[ScheduledSession]
    
    async def get_upcoming_sessions(
        self, 
        user_id: str, 
        days: int = 7
    ) -> List[ScheduledSession]
```

### Frontend Components

#### New Screens
- `ReflectionScreen`: Daily reflection prompts and feedback
- `LeaderboardScreen`: Global and friend leaderboards
- `CalendarScreen`: View scheduled learning sessions
- `AchievementsScreen`: View unlocked achievements

#### Enhanced Screens
- `LessonDetailScreen`: Show source attribution for multi-source lessons
- `ProgressScreen`: Add streak tracking and cross-field analytics

## Data Models

### Core Models

```python
class NormalizedContent(BaseModel):
    source: str  # "hackernews", "reddit", "yahoo_finance", etc.
    source_type: str  # "text", "numeric", "video_transcript"
    title: str
    content: str
    url: Optional[str]
    metadata: dict
    fetched_at: datetime

class SynthesizedLesson(BaseModel):
    id: str
    field_id: str
    title: str
    summary: str  # AI-generated, <200 words
    sources: List[str]  # Source attribution
    learning_objectives: List[str]
    estimated_minutes: int
    difficulty_level: str
    created_at: datetime

class QuizQuestion(BaseModel):
    id: str
    lesson_id: str
    question: str
    question_type: str  # "multiple_choice", "true_false"
    options: Optional[List[str]]
    correct_answer: str
    explanation: str
    created_at: datetime

class Reflection(BaseModel):
    id: str
    user_id: str
    prompt: str
    response: str
    ai_feedback: str
    quality_score: float  # 0-100
    submitted_at: datetime

class UserProgress(BaseModel):
    user_id: str
    field_id: str
    lessons_completed: int
    quizzes_completed: int
    average_quiz_score: float
    total_points: int
    current_streak: int
    longest_streak: int
    last_activity: datetime

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    criteria: dict
    points_reward: int

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    total_points: int
    current_streak: int
    lessons_completed: int

class ScheduledSession(BaseModel):
    id: str
    user_id: str
    session_type: str  # "lesson", "quiz", "reflection"
    content_id: Optional[str]
    scheduled_time: datetime
    completed: bool
    completed_at: Optional[datetime]
```

### Database Schema Extensions

```sql
-- New tables to add to existing schema

CREATE TABLE synthesized_lessons (
    id UUID PRIMARY KEY,
    field_id VARCHAR(50) REFERENCES fields(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    sources JSONB NOT NULL,  -- Array of source names
    learning_objectives JSONB,
    estimated_minutes INT,
    difficulty_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reflections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    ai_feedback TEXT,
    quality_score FLOAT,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_progress (
    user_id UUID NOT NULL,
    field_id VARCHAR(50) REFERENCES fields(id),
    lessons_completed INT DEFAULT 0,
    quizzes_completed INT DEFAULT 0,
    average_quiz_score FLOAT DEFAULT 0,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity TIMESTAMP,
    PRIMARY KEY (user_id, field_id)
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    criteria JSONB NOT NULL,
    points_reward INT DEFAULT 0
);

CREATE TABLE user_achievements (
    user_id UUID NOT NULL,
    achievement_id UUID REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE leaderboard (
    user_id UUID PRIMARY KEY,
    username VARCHAR(100),
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheduled_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    session_type VARCHAR(20) NOT NULL,
    content_id UUID,
    scheduled_time TIMESTAMP NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_sessions_user_time 
    ON scheduled_sessions(user_id, scheduled_time);
CREATE INDEX idx_leaderboard_points 
    ON leaderboard(total_points DESC);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Multi-Source Content Integration Properties

**Property 1: Multi-source retrieval count**
*For any* lesson request for a valid field, the system should retrieve content from 2 to 4 different sources within that field
**Validates: Requirements 1.1**

**Property 2: Format normalization**
*For any* set of retrieved content with different data formats (numeric, text, video transcripts), the normalization process should produce outputs that all conform to the same NormalizedContent schema
**Validates: Requirements 1.2**

**Property 3: Summary word count constraint**
*For any* set of normalized content, the AI-synthesized lesson summary should contain fewer than 200 words
**Validates: Requirements 1.3**

**Property 4: Lesson structure completeness**
*For any* displayed lesson, the output should contain all required fields: learning objectives, source attribution, title, and content
**Validates: Requirements 1.4**

**Property 5: Wikipedia fallback invocation**
*For any* lesson request where primary sources return insufficient content, the system should invoke the Wikipedia API
**Validates: Requirements 1.11**

**Property 6: Conflict resolution without errors**
*For any* set of sources with conflicting information, the AI synthesis process should complete without errors and produce a coherent output
**Validates: Requirements 1.12**

**Property 7: Video transcript extraction**
*For any* video content URL, the system should extract transcripts or captions before passing to the synthesis engine
**Validates: Requirements 1.13**

**Property 8: Numeric data transformation**
*For any* numeric data input (stock prices, economic indicators), the system should convert it to human-readable text before synthesis
**Validates: Requirements 1.14**

### Quiz Generation Properties

**Property 9: Quiz question count**
*For any* completed lesson, the generated quiz should contain between 3 and 5 questions
**Validates: Requirements 2.1**

**Property 10: Quiz format consistency**
*For any* generated quiz, all questions should follow the same schema with required fields: question, question_type, options (if multiple choice), correct_answer, and explanation
**Validates: Requirements 2.2**

**Property 11: Quiz scoring accuracy**
*For any* quiz submission, the calculated score should equal the number of correct answers divided by total questions
**Validates: Requirements 2.3**

**Property 12: Feedback completeness**
*For any* quiz result, feedback should include explanations for all questions (both correct and incorrect)
**Validates: Requirements 2.4**

**Property 13: Quiz result persistence**
*For any* completed quiz, the results should be retrievable from the database immediately after submission
**Validates: Requirements 2.5**

### Gamification Properties

**Property 14: Points award consistency**
*For any* lesson completion, points should be awarded and the amount should be deterministic based on difficulty and completion time
**Validates: Requirements 3.1**

**Property 15: Streak increment on consecutive days**
*For any* user completing activities on consecutive days, the streak counter should increment by exactly 1 each day
**Validates: Requirements 3.2**

**Property 16: Achievement unlock on criteria match**
*For any* user whose stats meet achievement criteria, the achievement should be unlocked and visible
**Validates: Requirements 3.3**

**Property 17: Leaderboard ordering**
*For any* leaderboard query, results should be ordered by total_points in descending order
**Validates: Requirements 3.4**

**Property 18: Leaderboard real-time update**
*For any* point update, the user's leaderboard rank should be recalculated within the same transaction
**Validates: Requirements 3.5**

### Recommendation Properties

**Property 19: Recommendation trigger on completion**
*For any* lesson completion, the recommendation engine should be invoked to analyze user progress
**Validates: Requirements 4.1**

**Property 20: Recommendation difficulty progression**
*For any* set of recommendations, the suggested lessons should match or slightly exceed the user's current difficulty level
**Validates: Requirements 4.2**

**Property 21: Recommendation count**
*For any* recommendation request, the system should return between 3 and 5 suggested lessons
**Validates: Requirements 4.3**

**Property 22: Cross-field recommendation diversity**
*For any* user with completed lessons in multiple fields, at least one recommendation should be from a different field than the most recent lesson
**Validates: Requirements 4.4**

### Reflection Properties

**Property 23: Daily reflection generation**
*For any* new day, the system should generate exactly one new reflection prompt for influence skills
**Validates: Requirements 5.1**

**Property 24: Reflection analysis trigger**
*For any* submitted reflection, the AI analysis service should be invoked
**Validates: Requirements 5.2**

**Property 25: Reflection feedback generation**
*For any* analyzed reflection, constructive feedback should be generated and stored
**Validates: Requirements 5.3**

**Property 26: Reflection quality tracking**
*For any* reflection with feedback, a quality score between 0 and 100 should be assigned and stored
**Validates: Requirements 5.4**

**Property 27: Reflection history completeness**
*For any* user viewing reflection history, all past reflections should include the prompt, response, feedback, and quality score
**Validates: Requirements 5.5**

### Scheduling Properties

**Property 28: Schedule generation from preferences**
*For any* valid user preferences, the system should generate a schedule containing lessons, quizzes, and reflections
**Validates: Requirements 6.1**

**Property 29: Calendar session persistence**
*For any* scheduled session, it should be retrievable from the calendar by user_id and scheduled_time
**Validates: Requirements 6.2**

**Property 30: Notification trigger on enabled**
*For any* user with notifications enabled, reminders should be sent before scheduled sessions
**Validates: Requirements 6.3**

**Property 31: Session availability at scheduled time**
*For any* scheduled session, it should become accessible when the current time equals or exceeds the scheduled_time
**Validates: Requirements 6.4**

**Property 32: Completion triggers next scheduling**
*For any* completed scheduled session, the system should mark it complete and generate the next session in the sequence
**Validates: Requirements 6.5**

### Analytics Properties

**Property 33: Completion rate calculation**
*For any* user and field, the completion rate should equal (lessons_completed / total_lessons_in_field) * 100
**Validates: Requirements 7.1**

**Property 34: Quiz score trend calculation**
*For any* user with multiple quiz results, the trend should be calculated from historical scores ordered by date
**Validates: Requirements 7.2**

**Property 35: Streak display accuracy**
*For any* user analytics view, both current_streak and longest_streak should be displayed and match database values
**Validates: Requirements 7.3**

**Property 36: Cross-field distribution sum**
*For any* user's cross-field learning distribution, the percentages across all fields should sum to 100%
**Validates: Requirements 7.4**

**Property 37: Real-time metric updates**
*For any* completed activity, analytics metrics should be recalculated and updated within the same request cycle
**Validates: Requirements 7.5**

### AI Agent Orchestration Properties

**Property 38: Field-to-API routing**
*For any* lesson request with a valid field, the system should invoke the correct external APIs associated with that field
**Validates: Requirements 8.1**

**Property 39: AI synthesis invocation**
*For any* retrieved content, the AI synthesis service should be called to generate a summary
**Validates: Requirements 8.2**

**Property 40: Quiz generation AI invocation**
*For any* quiz generation request, the AI service should be called with the lesson content
**Validates: Requirements 8.3**

**Property 41: Reflection analysis AI invocation**
*For any* submitted reflection, the AI service should be called to analyze and provide feedback
**Validates: Requirements 8.4**

**Property 42: Recommendation AI invocation**
*For any* recommendation request, the AI service should be called with user progress data
**Validates: Requirements 8.5**

**Property 43: Leaderboard persistence**
*For any* leaderboard update, the new rankings should be persisted to the database
**Validates: Requirements 8.6**

**Property 44: Rate limit fallback**
*For any* API rate limit error, the system should implement a fallback strategy (queue or use cached data) without failing the request
**Validates: Requirements 8.7**

## Error Handling

### External API Failures

1. **Timeout Handling**: All external API calls have 10-second timeouts
2. **Retry Logic**: Failed requests retry up to 3 times with exponential backoff (1s, 2s, 4s)
3. **Fallback Strategy**: If all external sources fail, use internal MindForge content only
4. **Partial Success**: If some sources succeed and others fail, proceed with available content

### AI Service Failures

1. **Model Fallback**: If OpenAI fails, fallback to Hugging Face (or vice versa)
2. **Degraded Mode**: If AI synthesis fails, return raw content with basic formatting
3. **Quiz Fallback**: If quiz generation fails, use pre-generated quiz templates
4. **Reflection Fallback**: If reflection analysis fails, provide generic constructive feedback

### Database Failures

1. **Connection Pooling**: Maintain connection pool with automatic reconnection
2. **Transaction Rollback**: All multi-step operations use database transactions
3. **Read Replicas**: Use read replicas for analytics queries to reduce load

### Rate Limiting

1. **Request Queuing**: Queue requests when approaching rate limits
2. **Caching**: Cache external API responses (1-6 hours depending on content type)
3. **User Feedback**: Inform users when rate limits cause delays

## Testing Strategy

### Unit Testing

**Framework**: pytest for backend, Jest for frontend

**Coverage Areas**:
- Content normalization functions for each data type
- Points calculation logic
- Streak tracking logic
- Quiz scoring algorithms
- Schedule generation logic
- Analytics calculation functions

**Example Unit Tests**:
- Test that numeric data (e.g., stock prices) converts to readable text
- Test that video URLs trigger transcript extraction
- Test that quiz scoring correctly handles edge cases (all correct, all wrong, partial)
- Test that streak resets after a gap in activity
- Test that leaderboard ranks are calculated correctly

### Property-Based Testing

**Framework**: Hypothesis (Python) for backend, fast-check (TypeScript) for frontend

**Configuration**: Each property test runs minimum 100 iterations

**Test Tagging**: Each property-based test includes a comment with format:
`# Feature: frankenstein-microlearning, Property X: [property description]`

**Key Property Tests**:

1. **Property 2: Format normalization**
   - Generate random content in different formats (text, numeric, video)
   - Verify all outputs conform to NormalizedContent schema
   - Check that required fields are present and correctly typed

2. **Property 3: Summary word count constraint**
   - Generate random sets of normalized content
   - Verify synthesized summaries are always < 200 words
   - Test with varying content lengths and complexities

3. **Property 11: Quiz scoring accuracy**
   - Generate random quiz submissions with varying correct/incorrect answers
   - Verify score calculation: (correct / total) * 100
   - Test edge cases: all correct, all wrong, empty submission

4. **Property 15: Streak increment on consecutive days**
   - Generate random sequences of activity dates
   - Verify streak increments for consecutive days
   - Verify streak resets after gaps

5. **Property 17: Leaderboard ordering**
   - Generate random sets of user scores
   - Verify leaderboard is always sorted by points descending
   - Test with ties, zero scores, and large datasets

6. **Property 36: Cross-field distribution sum**
   - Generate random user activity across fields
   - Verify distribution percentages sum to 100%
   - Test with uneven distributions and edge cases

### Integration Testing

**Areas**:
- End-to-end lesson generation: API fetch → normalization → AI synthesis → storage
- Quiz workflow: generation → user submission → scoring → storage
- Gamification flow: activity completion → points award → leaderboard update
- Scheduling flow: preference setting → schedule generation → session completion

### API Testing

**External API Mocking**: Use VCR.py to record/replay external API responses for consistent testing

**Test Cases**:
- Each external API adapter (Hacker News, Reddit, Yahoo Finance, etc.)
- API failure scenarios and fallback behavior
- Rate limiting and retry logic
- Response parsing and error handling

## Performance Considerations

### Caching Strategy

1. **External API Responses**: Cache for 1-6 hours based on content freshness
   - News/Reddit: 1 hour
   - Finance data: 15 minutes
   - Books/Wikipedia: 6 hours

2. **AI-Generated Content**: Cache synthesized lessons for 24 hours
3. **Leaderboard**: Cache top 100 for 5 minutes, invalidate on updates
4. **User Progress**: Cache per user for 1 minute

### Optimization

1. **Parallel API Calls**: Use asyncio to fetch from multiple sources concurrently
2. **Database Indexing**: Index on user_id, field_id, scheduled_time, points
3. **Lazy Loading**: Load lesson content only when user opens lesson detail
4. **Pagination**: Paginate leaderboard, lesson lists, and reflection history

### Scalability

1. **Horizontal Scaling**: FastAPI backend can scale horizontally behind load balancer
2. **Database Connection Pooling**: Use pgbouncer for PostgreSQL connection pooling
3. **Background Jobs**: Use Celery for async tasks (quiz generation, reflection analysis)
4. **CDN**: Serve static assets and cached content via CDN

## Security Considerations

1. **API Key Management**: Store all API keys in environment variables, never in code
2. **Rate Limiting**: Implement per-user rate limits to prevent abuse
3. **Input Validation**: Validate all user inputs (reflection text, quiz answers)
4. **SQL Injection Prevention**: Use parameterized queries via Supabase client
5. **Authentication**: Use Supabase Auth for user authentication
6. **CORS**: Configure CORS to allow only frontend domain in production

## Deployment Strategy

### Development Phase (Using Kiro IDE)

1. **MCP Integration**: Define AI tasks as MCP tools for development
2. **Agent Hooks**: Automate testing of fetch, summarize, quiz generation
3. **Steering Docs**: Ensure AI outputs meet quality standards

### Production Deployment

1. **Backend**: Deploy FastAPI to cloud platform (AWS, GCP, or Heroku)
2. **Database**: Use Supabase hosted PostgreSQL
3. **Frontend**: Deploy React Native app to App Store and Google Play
4. **Environment Variables**: Configure all API keys and secrets
5. **Monitoring**: Set up error tracking (Sentry) and performance monitoring

## Implementation Priorities for 4-Day Deadline

### Day 1: Core Infrastructure
- Set up external API adapters (Hacker News, Reddit, Yahoo Finance, FRED)
- Implement content normalization
- Set up AI client (OpenAI/Hugging Face)
- Basic lesson synthesis

### Day 2: AI Features
- Quiz generation
- Reflection prompts and analysis
- Recommendation engine
- Test multi-source integration

### Day 3: Gamification & Scheduling
- Points and streak tracking
- Achievements system
- Leaderboard
- Session scheduling
- Calendar integration

### Day 4: Frontend & Polish
- Update React Native screens
- Connect all backend endpoints
- Testing and bug fixes
- Demo preparation

