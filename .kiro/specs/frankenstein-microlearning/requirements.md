# Requirements Document - MindForge (As Built)

## Introduction

MindForge is an AI-powered microlearning platform that delivers bite-sized lessons (5-10 minutes) across multiple knowledge domains through an engaging, mobile-first web interface. The system uses AI to automatically generate complete lessons with content, quizzes, images, and video plans from real-world sources. The platform features multiple learning modalities (swipe cards, deep read, video, flashcards), intelligent progress tracking with quiz-based validation, and gamification elements.

**Platform:** React web app (mobile-optimized) with FastAPI backend + Supabase PostgreSQL

## Glossary

- **MindForge**: The microlearning platform system
- **Lesson**: A structured learning unit lasting 5-10 minutes with content, quiz, and media
- **Field**: A knowledge domain (Technology, Finance, Economics, Culture, Influence, Global Events)
- **Quiz**: 5 multiple-choice questions generated to validate learning
- **Learning Modes**: Swipe Cards, Deep Read, Video, Review (Flashcards)
- **Streak**: Consecutive days of completed learning activities (passing quizzes)
- **Completion**: Lessons marked complete only when user passes quiz with 60%+ (3/5 questions)
- **AI Agent**: Backend service that orchestrates content generation using LLMs
- **External API**: Third-party data sources (arXiv, Reddit, HackerNews, NASA, Financial APIs, etc.)
- **LLM**: Large Language Model (Groq Llama 3 70B, OpenAI GPT-4)
- **ML Model**: Machine Learning model (Hugging Face Stable Diffusion for images)

## Core Requirements (As Implemented)

### Requirement 1: AI-Powered Lesson Generation

**User Story:** As a learner, I want AI-generated lessons synthesized from multiple real-world sources, so that I can learn current, relevant information across different fields.

#### Acceptance Criteria (Implemented)

1. ✅ System fetches content from 2-4 external APIs per field
2. ✅ AI synthesizes coherent lesson content from multiple sources
3. ✅ Lessons include title, content, learning objectives, and source attribution
4. ✅ System generates 5 contextual quiz questions per lesson
5. ✅ System generates mobile-optimized images (1080x1920, 9:16 portrait)
6. ✅ System plans video structure with scene breakdowns
7. ✅ Fallback mechanisms when APIs fail (Groq → OpenAI → Fallback quiz)
8. ✅ Lessons stored in Supabase with all metadata

**Fields and Sources:**
- Technology: arXiv, Reddit, HackerNews
- Finance: Financial APIs, Reddit
- Economics: FRED, arXiv
- Culture: Google Books, Reddit
- Influence: YouTube, Reddit
- Global Events: BBC News, NASA

### Requirement 2: Multi-Modal Learning Experience

**User Story:** As a learner, I want to consume lessons in different formats, so that I can learn in the way that suits me best.

#### Acceptance Criteria (Implemented)

1. ✅ **Swipe Cards**: TikTok-style cards with intro, context, insights, takeaway
2. ✅ **Deep Read**: Long-form article with progress tracking and scroll-based navigation
3. ✅ **Video Mode**: Mobile-optimized video player (9:16 portrait)
4. ✅ **Review Mode**: Flashcard system for spaced repetition
5. ✅ Cross-navigation between modes with "Try Other Learning Styles" buttons
6. ✅ Consistent lesson content across all modes

### Requirement 3: Quiz-Based Learning Validation

**User Story:** As a learner, I want to prove my understanding through quizzes, so that I only get credit for lessons I actually learned.

#### Acceptance Criteria (Implemented)

1. ✅ 5 multiple-choice questions per lesson
2. ✅ Questions generated from lesson content using AI
3. ✅ Immediate scoring and feedback
4. ✅ Lessons marked complete only when user scores 60%+ (3/5 correct)
5. ✅ Quiz results stored for progress tracking
6. ✅ Celebration animations for passing scores

### Requirement 4: Intelligent Progress Tracking

**User Story:** As a learner, I want to track my learning progress, so that I can see my improvement over time.

#### Acceptance Criteria (Implemented)

1. ✅ Topics learned counter (lessons completed with passing quiz)
2. ✅ Total study time tracking
3. ✅ Daily streak tracking (consecutive days with completed lessons)
4. ✅ Real-time stats updates on dashboard
5. ✅ Progress only counts when quiz passed (60%+)
6. ✅ Streak calculation based on last activity date

### Requirement 5: Gamification System

**User Story:** As a learner, I want points and achievements, so that I stay motivated to continue learning.

#### Acceptance Criteria (Implemented)

1. ✅ Points awarded for lesson completion
2. ✅ Streak tracking with current and longest streak
3. ✅ Daily challenge system (4 tasks: watch, quiz, reflection, flashcards)
4. ✅ Leaderboard system (implemented but not fully populated)
5. ✅ Achievement system (framework in place)

### Requirement 6: Mobile-First Design

**User Story:** As a mobile learner, I want an optimized mobile experience, so that I can learn on my phone.

#### Acceptance Criteria (Implemented)

1. ✅ Responsive design with TailwindCSS
2. ✅ Touch-friendly UI elements
3. ✅ Mobile-optimized images (9:16 portrait)
4. ✅ Vertical video support
5. ✅ Swipe gestures for card navigation
6. ✅ Progress bars and visual feedback

### Requirement 7: Content Feed

**User Story:** As a learner, I want a social media-style feed, so that I can discover and consume lessons easily.

#### Acceptance Criteria (Implemented)

1. ✅ Vertical scrolling feed of lessons
2. ✅ Lesson cards with images, titles, and metadata
3. ✅ "Learn More" button navigates to lesson detail
4. ✅ Field-based filtering
5. ✅ Engaging visual design with animations

## Technical Requirements (As Implemented)

### Backend Architecture

1. ✅ FastAPI async web framework
2. ✅ Supabase PostgreSQL database
3. ✅ AI agent architecture for content generation
4. ✅ LLM integration (Groq + OpenAI fallback)
5. ✅ ML model integration (Hugging Face Stable Diffusion)
6. ✅ External API adapters (10+ sources)
7. ✅ Robust error handling and fallback chains

### Frontend Architecture

1. ✅ React 18 + TypeScript
2. ✅ Vite build system
3. ✅ TailwindCSS styling
4. ✅ Lottie animations
5. ✅ React Router for navigation
6. ✅ Axios for API communication

### AI/ML Pipeline

1. ✅ Multi-agent content orchestration
2. ✅ API selector agent for source selection
3. ✅ Content intelligence agent for synthesis
4. ✅ Quiz generation agent with fallbacks
5. ✅ Image generation with prompt engineering
6. ✅ Video planning agent for scene structure

## Non-Functional Requirements (As Implemented)

### Performance

1. ✅ Async API calls for parallel processing
2. ✅ Caching strategy for external APIs
3. ✅ Optimized database queries
4. ✅ Lazy loading of content

### Reliability

1. ✅ Fallback chains (Groq → OpenAI → Hardcoded)
2. ✅ Error handling at all layers
3. ✅ Retry logic for transient failures
4. ✅ JSON repair for incomplete LLM responses

### Security

1. ✅ Environment variables for API keys
2. ✅ Supabase authentication (framework in place)
3. ✅ Input validation
4. ✅ CORS configuration

### Usability

1. ✅ Intuitive navigation
2. ✅ Clear visual hierarchy
3. ✅ Immediate feedback
4. ✅ Accessible design patterns
5. ✅ Consistent UI across pages

## Future Enhancements (Not Yet Implemented)

1. ⏳ Complete video generation pipeline
2. ⏳ Social features (sharing, friends)
3. ⏳ Offline mode
4. ⏳ More fields and topics
5. ⏳ Personalized AI tutor
6. ⏳ Community-generated content
7. ⏳ Advanced analytics
8. ⏳ Reflection system with AI feedback
9. ⏳ Automated scheduling
10. ⏳ Push notifications
