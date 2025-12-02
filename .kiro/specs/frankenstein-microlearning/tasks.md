# Implementation Plan

- [ ] 1. Set up external API integration infrastructure
  - Create base adapter classes and implement API clients for all external sources
  - Implement content normalization layer
  - _Requirements: 1.1, 1.2, 1.5-1.10_

- [x] 1.1 Create base SourceAdapter abstract class
  - Define abstract methods: fetch(), normalize()
  - Implement common error handling and retry logic
  - Add timeout configuration (10 seconds default)
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Implement Hacker News API adapter
  - Fetch top stories and comments
  - Normalize to NormalizedContent format
  - Handle rate limiting
  - _Requirements: 1.5_

- [x] 1.3 Implement Reddit API adapter
  - Fetch posts from relevant subreddits
  - Extract text content from posts and comments
  - Normalize to NormalizedContent format
  - _Requirements: 1.5, 1.8, 1.10_

- [x] 1.4 Implement Yahoo Finance API adapter
  - Fetch stock data and market indicators
  - Convert numeric data to human-readable insights
  - Normalize to NormalizedContent format
  - _Requirements: 1.6, 1.14_

- [x] 1.5 Implement FRED API adapter
  - Fetch economic indicators
  - Convert numeric data to simplified explanations
  - Normalize to NormalizedContent format
  - _Requirements: 1.7, 1.14_

- [x] 1.6 Implement Google Books API adapter
  - Search and fetch book excerpts
  - Extract relevant passages
  - Normalize to NormalizedContent format
  - _Requirements: 1.8_

- [x] 1.7 Implement YouTube Data API adapter
  - Fetch video metadata
  - Extract transcripts/captions using YouTube API
  - Normalize transcript text to NormalizedContent format
  - _Requirements: 1.9, 1.13_

- [x] 1.8 Implement BBC News API adapter
  - Fetch latest news articles
  - Extract article content
  - Normalize to NormalizedContent format
  - _Requirements: 1.10_

- [x] 1.9 Implement Wikipedia API adapter
  - Search and fetch article summaries
  - Use as supplemental source
  - Normalize to NormalizedContent format
  - _Requirements: 1.11_

- [ ] 1.10 Write property test for multi-source retrieval
  - **Property 1: Multi-source retrieval count**
  - **Validates: Requirements 1.1**

- [ ] 1.11 Write property test for format normalization
  - **Property 2: Format normalization**
  - **Validates: Requirements 1.2**

- [ ] 1.12 Write property test for video transcript extraction
  - **Property 7: Video transcript extraction**
  - **Validates: Requirements 1.13**

- [ ] 1.13 Write property test for numeric data transformation
  - **Property 8: Numeric data transformation**
  - **Validates: Requirements 1.14**

- [ ] 2. Implement Content Orchestration Service
  - Build multi-source fetching coordinator
  - Implement caching layer
  - Add fallback mechanisms
  - _Requirements: 1.1, 1.2, 1.11, 1.12_

- [x] 2.1 Create ContentOrchestrator class
  - Implement fetch_multi_source() method
  - Add parallel API calling using asyncio
  - Implement source selection logic based on field
  - _Requirements: 1.1_

- [ ] 2.2 Implement caching layer with Redis or in-memory cache
  - Cache external API responses (1-6 hours based on content type)
  - Implement cache invalidation logic
  - Add cache hit/miss metrics
  - _Requirements: 1.1_

- [ ] 2.3 Add fallback mechanisms for API failures
  - Implement Wikipedia fallback when primary sources insufficient
  - Handle partial success scenarios
  - Return internal MindForge content if all external sources fail
  - _Requirements: 1.11, 1.12_

- [ ] 2.4 Write property test for Wikipedia fallback
  - **Property 5: Wikipedia fallback invocation**
  - **Validates: Requirements 1.11**

- [ ] 2.5 Write property test for conflict resolution
  - **Property 6: Conflict resolution without errors**
  - **Validates: Requirements 1.12**

- [x] 3. Implement AI Synthesis Service
  - Set up OpenAI/Hugging Face client
  - Implement lesson synthesis
  - Add quiz generation
  - Implement reflection analysis
  - _Requirements: 1.3, 1.4, 2.1-2.4, 5.2, 5.3, 8.2-8.5_

- [ ] 3.1 Create AIClient wrapper class
  - Configure OpenAI API client
  - Add Hugging Face fallback
  - Implement retry logic and error handling
  - _Requirements: 8.2_

- [ ] 3.2 Implement lesson synthesis method
  - Take multiple NormalizedContent inputs
  - Generate coherent summary <200 words
  - Include source attribution
  - Generate learning objectives
  - _Requirements: 1.3, 1.4_

- [ ] 3.3 Implement quiz generation method
  - Generate 3-5 questions from lesson content
  - Use consistent format (multiple choice, true/false)
  - Include explanations for answers
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 3.4 Implement reflection analysis method
  - Analyze user reflection text
  - Generate constructive feedback
  - Calculate quality score (0-100)
  - Track progress over time
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 3.5 Implement recommendation engine
  - Analyze user progress and preferences
  - Consider difficulty progression
  - Generate 3-5 lesson recommendations
  - Include cross-field opportunities
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3.6 Write property test for summary word count
  - **Property 3: Summary word count constraint**
  - **Validates: Requirements 1.3**

- [ ] 3.7 Write property test for lesson structure
  - **Property 4: Lesson structure completeness**
  - **Validates: Requirements 1.4**

- [ ] 3.8 Write property test for quiz question count
  - **Property 9: Quiz question count**
  - **Validates: Requirements 2.1**

- [ ] 3.9 Write property test for quiz format consistency
  - **Property 10: Quiz format consistency**
  - **Validates: Requirements 2.2**

- [ ] 3.10 Write property test for feedback completeness
  - **Property 12: Feedback completeness**
  - **Validates: Requirements 2.4**

- [ ] 3.11 Write property test for recommendation count
  - **Property 21: Recommendation count**
  - **Validates: Requirements 4.3**

- [ ] 4. Implement database schema and models
  - Create new tables for synthesized lessons, reflections, progress, achievements
  - Update existing models
  - Add indexes for performance
  - _Requirements: All_

- [ ] 4.1 Create database migration for new tables
  - synthesized_lessons table
  - reflections table
  - user_progress table
  - achievements and user_achievements tables
  - leaderboard table
  - scheduled_sessions table
  - _Requirements: All_

- [ ] 4.2 Create Pydantic models for new entities
  - NormalizedContent, SynthesizedLesson
  - Reflection, ReflectionFeedback
  - UserProgress, Achievement, LeaderboardEntry
  - ScheduledSession, SchedulePreferences
  - _Requirements: All_

- [ ] 4.3 Add database indexes
  - Index on scheduled_sessions(user_id, scheduled_time)
  - Index on leaderboard(total_points DESC)
  - Index on user_progress(user_id, field_id)
  - _Requirements: 7.1-7.5_

- [x] 5. Implement Gamification Service
  - Points calculation and awarding
  - Streak tracking
  - Achievement system
  - Leaderboard management
  - _Requirements: 3.1-3.5_

- [ ] 5.1 Create PointsCalculator class
  - Calculate points based on lesson difficulty
  - Factor in completion time
  - Award bonus points for streaks
  - _Requirements: 3.1_

- [ ] 5.2 Implement StreakTracker class
  - Track consecutive days of activity
  - Increment streak on daily completion
  - Reset streak after gaps
  - Track longest streak
  - _Requirements: 3.2_

- [ ] 5.3 Implement AchievementManager class
  - Define achievement criteria
  - Check criteria on user activity
  - Unlock achievements when criteria met
  - Store unlocked achievements
  - _Requirements: 3.3_

- [ ] 5.4 Implement LeaderboardManager class
  - Calculate user rankings based on points
  - Update leaderboard in real-time
  - Support global and friend leaderboards
  - Cache top 100 for performance
  - _Requirements: 3.4, 3.5_

- [ ] 5.5 Write property test for points calculation
  - **Property 14: Points award consistency**
  - **Validates: Requirements 3.1**

- [ ] 5.6 Write property test for streak tracking
  - **Property 15: Streak increment on consecutive days**
  - **Validates: Requirements 3.2**

- [ ] 5.7 Write property test for achievement unlocking
  - **Property 16: Achievement unlock on criteria match**
  - **Validates: Requirements 3.3**

- [ ] 5.8 Write property test for leaderboard ordering
  - **Property 17: Leaderboard ordering**
  - **Validates: Requirements 3.4**

- [ ] 6. Implement Scheduling Service
  - Session scheduling based on preferences
  - Calendar integration
  - Notification system
  - Session completion tracking
  - _Requirements: 6.1-6.5_

- [ ] 6.1 Create SessionScheduler class
  - Generate schedule from user preferences
  - Create scheduled sessions for lessons, quizzes, reflections
  - Balance session types throughout week
  - _Requirements: 6.1_

- [ ] 6.2 Implement calendar integration
  - Store scheduled sessions in database
  - Provide API to retrieve upcoming sessions
  - Mark sessions as available at scheduled time
  - _Requirements: 6.2, 6.4_

- [ ] 6.3 Implement NotificationManager class
  - Send reminders before scheduled sessions
  - Support push notifications for mobile
  - Respect user notification preferences
  - _Requirements: 6.3_

- [ ] 6.4 Implement session completion handler
  - Mark sessions as complete
  - Trigger next session scheduling
  - Update user progress
  - _Requirements: 6.5_

- [ ] 6.5 Write property test for schedule generation
  - **Property 28: Schedule generation from preferences**
  - **Validates: Requirements 6.1**

- [ ] 6.6 Write property test for session completion
  - **Property 32: Completion triggers next scheduling**
  - **Validates: Requirements 6.5**

- [ ] 7. Implement backend API endpoints
  - Lesson generation endpoint
  - Quiz endpoints
  - Reflection endpoints
  - Progress and analytics endpoints
  - Gamification endpoints
  - Scheduling endpoints
  - _Requirements: All_

- [ ] 7.1 Create POST /api/lessons/generate endpoint
  - Accept field and topic parameters
  - Orchestrate multi-source content fetching
  - Synthesize lesson using AI
  - Store synthesized lesson
  - Return lesson with source attribution
  - _Requirements: 1.1-1.14_

- [ ] 7.2 Update GET /api/lessons endpoints
  - Include synthesized lessons in results
  - Add source attribution to response
  - Support filtering by field and difficulty
  - _Requirements: 1.4_

- [ ] 7.3 Create POST /api/quiz/generate endpoint
  - Generate quiz from lesson content using AI
  - Store quiz questions
  - Return quiz with 3-5 questions
  - _Requirements: 2.1, 2.2_

- [ ] 7.4 Update POST /api/quiz/submit endpoint
  - Calculate score accurately
  - Generate feedback with explanations
  - Store quiz results
  - Update user progress
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 7.5 Create reflection endpoints
  - GET /api/reflections/daily - get today's prompt
  - POST /api/reflections - submit reflection
  - GET /api/reflections/history - get past reflections
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 7.6 Create gamification endpoints
  - GET /api/leaderboard - get rankings
  - GET /api/achievements - get user achievements
  - GET /api/progress/{user_id} - get detailed progress
  - _Requirements: 3.3, 3.4, 7.1-7.5_

- [ ] 7.7 Create scheduling endpoints
  - POST /api/schedule/preferences - set preferences
  - GET /api/schedule/upcoming - get upcoming sessions
  - POST /api/schedule/complete/{session_id} - mark complete
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 7.8 Create recommendation endpoint
  - GET /api/recommendations/{user_id}
  - Return 3-5 personalized lesson suggestions
  - _Requirements: 4.1-4.4_

- [ ] 7.9 Write property test for quiz scoring
  - **Property 11: Quiz scoring accuracy**
  - **Validates: Requirements 2.3**

- [ ] 7.10 Write property test for quiz persistence
  - **Property 13: Quiz result persistence**
  - **Validates: Requirements 2.5**

- [ ] 7.11 Write property test for analytics calculations
  - **Property 33: Completion rate calculation**
  - **Property 36: Cross-field distribution sum**
  - **Validates: Requirements 7.1, 7.4**

- [ ] 8. Update React Native frontend
  - Update existing screens
  - Create new screens for reflections, leaderboard, calendar
  - Connect to new backend endpoints
  - _Requirements: All_

- [ ] 8.1 Update LessonDetailScreen
  - Display source attribution for multi-source lessons
  - Show "Generated from X sources" badge
  - Add links to original sources
  - _Requirements: 1.4_

- [ ] 8.2 Create ReflectionScreen
  - Display daily reflection prompt
  - Text input for user response
  - Submit button
  - Show AI feedback after submission
  - Display quality score and progress
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.3 Create ReflectionHistoryScreen
  - List past reflections
  - Show prompt, response, feedback for each
  - Display quality score trends
  - _Requirements: 5.5_

- [ ] 8.4 Create LeaderboardScreen
  - Display global leaderboard
  - Show user's rank and points
  - Add friend leaderboard tab
  - Real-time updates
  - _Requirements: 3.4, 3.5_

- [ ] 8.5 Create AchievementsScreen
  - Grid of achievements
  - Show locked and unlocked states
  - Display achievement criteria
  - Show progress toward locked achievements
  - _Requirements: 3.3_

- [ ] 8.6 Create CalendarScreen
  - Calendar view of scheduled sessions
  - List view of upcoming sessions
  - Tap to start session
  - Mark sessions as complete
  - _Requirements: 6.2, 6.4, 6.5_

- [ ] 8.7 Update ProgressScreen
  - Add streak display (current and longest)
  - Show cross-field learning distribution chart
  - Display quiz score trends
  - Add completion rates per field
  - _Requirements: 7.1-7.5_

- [ ] 8.8 Update HomeScreen
  - Add "Today's Reflection" card
  - Show current streak prominently
  - Display next scheduled session
  - Add quick access to leaderboard
  - _Requirements: 3.2, 5.1, 6.4_

- [ ] 8.9 Update API service client
  - Add methods for new endpoints
  - Handle multi-source lesson generation
  - Add reflection, scheduling, gamification methods
  - _Requirements: All_

- [ ] 9. Implement error handling and rate limiting
  - Add retry logic for external APIs
  - Implement fallback strategies
  - Handle rate limits gracefully
  - _Requirements: 8.7, 8.8_

- [ ] 9.1 Add exponential backoff retry logic
  - Retry failed API calls up to 3 times
  - Use delays: 1s, 2s, 4s
  - Log retry attempts
  - _Requirements: 8.7_

- [ ] 9.2 Implement rate limit handling
  - Detect rate limit errors
  - Queue requests when approaching limits
  - Use cached data when available
  - Inform users of delays
  - _Requirements: 8.7_

- [ ] 9.3 Add comprehensive error handling
  - Handle timeout errors
  - Handle API authentication errors
  - Handle malformed responses
  - Return user-friendly error messages
  - _Requirements: 8.7_

- [ ] 9.4 Write property test for rate limit fallback
  - **Property 44: Rate limit fallback**
  - **Validates: Requirements 8.7**

- [ ] 10. Testing and quality assurance
  - Run all property-based tests
  - Integration testing
  - End-to-end testing
  - Performance testing
  - _Requirements: All_

- [ ] 10.1 Run all property-based tests
  - Ensure all 44 properties pass with 100+ iterations
  - Fix any failing tests
  - Document test coverage
  - _Requirements: All_

- [ ] 10.2 Perform integration testing
  - Test full lesson generation flow
  - Test quiz workflow end-to-end
  - Test gamification flow
  - Test scheduling flow
  - _Requirements: All_

- [ ] 10.3 Test with real external APIs
  - Verify all API adapters work with live data
  - Test rate limiting behavior
  - Test fallback mechanisms
  - _Requirements: 1.5-1.11, 8.7_

- [ ] 10.4 Performance testing
  - Test parallel API fetching performance
  - Verify caching improves response times
  - Test leaderboard query performance
  - Optimize slow queries
  - _Requirements: All_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Documentation and deployment preparation
  - Update README with new features
  - Document API endpoints
  - Prepare demo scenarios
  - _Requirements: All_

- [ ] 12.1 Update README documentation
  - Document new "Frankenstein" multi-source feature
  - List all external APIs used
  - Add setup instructions for API keys
  - Document gamification features
  - _Requirements: All_

- [ ] 12.2 Create API documentation
  - Document all new endpoints
  - Include request/response examples
  - Document error codes
  - _Requirements: All_

- [ ] 12.3 Prepare demo scenarios
  - Create demo user account
  - Generate sample lessons from multiple sources
  - Showcase gamification features
  - Demonstrate reflection and scheduling
  - _Requirements: All_

- [ ] 12.4 Set up environment variables
  - Configure all API keys
  - Set up OpenAI/Hugging Face keys
  - Configure database connection
  - _Requirements: All_
