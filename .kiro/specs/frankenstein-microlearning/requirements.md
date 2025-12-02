# Requirements Document

## Introduction

MindForge + Frankenstein Microlearning Hub is an AI-powered microlearning platform that delivers bite-sized lessons (5-25 minutes) across multiple knowledge domains. The system pulls content from external APIs, uses AI to generate summaries and quizzes, automatically schedules learning sessions, and includes gamification features with progress analytics. The platform is designed for busy professionals seeking efficient, structured learning across technology, finance, economics, culture, influence skills, and global events.

**Platform:** React Native mobile app with FastAPI backend (existing foundation will be extended)

## Glossary

- **MindForge**: The microlearning platform system
- **Lesson**: A structured learning unit lasting 5-25 minutes
- **Field**: A knowledge domain (Technology, Finance, Economics, Culture, Influence Skills, Global Events)
- **Quiz**: A set of questions generated to reinforce lesson content
- **Reflection**: A daily prompt for soft skills development with AI feedback
- **Streak**: Consecutive days of completed learning activities
- **Leaderboard**: A ranking system showing user performance
- **AI Agent**: Backend service that processes content using AI models
- **External API**: Third-party data sources (Hacker News, Yahoo Finance, FRED, Google Books, YouTube, BBC News, Reddit, Wikipedia)
- **MCP**: Model Context Protocol used during development in Kiro IDE
- **Session**: A scheduled learning activity (lesson, quiz, or reflection)

## Requirements

### Requirement 1

**User Story:** As a learner, I want to access field-specific bite-sized lessons synthesized from multiple heterogeneous sources within that field, so that I can efficiently learn with unified, coherent content that combines different data types and formats.

#### Acceptance Criteria

1. WHEN a user requests a lesson for a specific field THEN the MindForge SHALL retrieve content from 2 to 4 different sources within that field simultaneously
2. WHEN content is retrieved from multiple sources THEN the MindForge SHALL normalize different data formats (numeric data, informal text, news articles, video transcripts, structured lessons) into a unified format
3. WHEN content is normalized THEN the MindForge SHALL use AI to synthesize a coherent lesson summary of less than 200 words that integrates all source materials
4. WHEN a lesson is displayed THEN the MindForge SHALL present content in a structured format with clear learning objectives and source attribution
5. WHERE the field is Technology THEN the MindForge SHALL fetch content from Hacker News API, Reddit API, and internal MindForge technology lessons
6. WHERE the field is Finance THEN the MindForge SHALL fetch content from Yahoo Finance API, convert numeric stock data to readable insights, and combine with internal MindForge finance lessons
7. WHERE the field is Economics THEN the MindForge SHALL fetch content from FRED API, convert economic indicators to simplified explanations, and combine with internal MindForge economics lessons
8. WHERE the field is Culture THEN the MindForge SHALL fetch content from Google Books API, Reddit API, and internal MindForge culture lessons
9. WHERE the field is Influence Skills THEN the MindForge SHALL fetch content from YouTube Data API, extract transcripts or captions, and combine with internal MindForge influence lessons
10. WHERE the field is Global Events THEN the MindForge SHALL fetch content from BBC News API and internal MindForge global events lessons
11. WHEN supplemental context is needed for any field THEN the MindForge SHALL fetch content from Wikipedia API
12. WHEN multiple sources within a field have conflicting information THEN the MindForge SHALL use AI to reconcile differences and present balanced perspectives
13. WHEN video content is retrieved THEN the MindForge SHALL extract transcripts or captions before processing
14. WHEN numeric data is retrieved THEN the MindForge SHALL convert it to human-readable insights before synthesis

### Requirement 2

**User Story:** As a learner, I want AI-generated quizzes after each lesson, so that I can reinforce my understanding of the material.

#### Acceptance Criteria

1. WHEN a lesson is completed THEN the MindForge SHALL generate a quiz with 3 to 5 questions based on the lesson content
2. WHEN a quiz is generated THEN the MindForge SHALL use consistent question format with multiple choice options
3. WHEN a user submits quiz answers THEN the MindForge SHALL calculate the score and provide immediate feedback
4. WHEN quiz feedback is provided THEN the MindForge SHALL include explanations for correct and incorrect answers
5. WHEN a quiz is completed THEN the MindForge SHALL store the results for progress tracking

### Requirement 3

**User Story:** As a learner, I want a gamified dashboard with points and achievements, so that I stay motivated to continue learning.

#### Acceptance Criteria

1. WHEN a user completes a lesson THEN the MindForge SHALL award points based on lesson difficulty and completion time
2. WHEN a user completes activities on consecutive days THEN the MindForge SHALL increment the user streak counter
3. WHEN a user achieves specific milestones THEN the MindForge SHALL unlock and display achievements
4. WHEN a user views the leaderboard THEN the MindForge SHALL display rankings based on total points earned
5. WHEN user points are updated THEN the MindForge SHALL recalculate leaderboard positions in real-time

### Requirement 4

**User Story:** As a learner, I want AI-powered lesson recommendations, so that I can discover relevant content based on my progress and interests.

#### Acceptance Criteria

1. WHEN a user completes a lesson THEN the MindForge SHALL analyze completion history and performance
2. WHEN generating recommendations THEN the MindForge SHALL consider user field preferences and difficulty progression
3. WHEN recommendations are displayed THEN the MindForge SHALL present 3 to 5 suggested next lessons
4. WHEN a user has completed lessons in multiple fields THEN the MindForge SHALL recommend cross-field learning opportunities

### Requirement 5

**User Story:** As a learner developing influence skills, I want daily reflection prompts with AI feedback, so that I can improve my soft skills over time.

#### Acceptance Criteria

1. WHEN a new day begins THEN the MindForge SHALL generate a daily reflection prompt related to influence skills
2. WHEN a user submits a reflection THEN the MindForge SHALL analyze the response using AI
3. WHEN AI analysis is complete THEN the MindForge SHALL provide constructive feedback on the reflection
4. WHEN feedback is provided THEN the MindForge SHALL track reflection quality and progress over time
5. WHEN a user views reflection history THEN the MindForge SHALL display past reflections with feedback and progress trends

### Requirement 6

**User Story:** As a learner, I want learning sessions automatically scheduled into my calendar, so that I maintain consistent learning habits.

#### Acceptance Criteria

1. WHEN a user sets learning preferences THEN the MindForge SHALL create a schedule for lessons, quizzes, and reflections
2. WHEN a session is scheduled THEN the MindForge SHALL add the session to the user calendar with appropriate time blocks
3. WHERE a user enables notifications THEN the MindForge SHALL send reminders before scheduled sessions
4. WHEN a scheduled session time arrives THEN the MindForge SHALL make the session available for immediate access
5. WHEN a user completes a scheduled session THEN the MindForge SHALL mark it as complete and schedule the next session

### Requirement 7

**User Story:** As a learner, I want comprehensive progress analytics, so that I can track my learning performance across all fields.

#### Acceptance Criteria

1. WHEN a user views analytics THEN the MindForge SHALL display completion rates for each field
2. WHEN a user views analytics THEN the MindForge SHALL show quiz scores with trends over time
3. WHEN a user views analytics THEN the MindForge SHALL display current streak and longest streak achieved
4. WHEN a user views analytics THEN the MindForge SHALL show cross-field learning distribution
5. WHEN analytics are calculated THEN the MindForge SHALL update metrics in real-time as activities are completed

### Requirement 8

**User Story:** As a developer, I want the backend to implement AI agent functions that orchestrate multi-source content integration, so that the production system can seamlessly process heterogeneous data and generate unified learning materials.

#### Acceptance Criteria

1. WHEN the backend receives a lesson request THEN the AI Agent SHALL call multiple external APIs in parallel based on the field
2. WHEN content is retrieved from multiple sources THEN the AI Agent SHALL transform different data types (numeric, text, video transcripts) into a common format
3. WHEN content is normalized THEN the AI Agent SHALL call OpenAI or Hugging Face API to synthesize a coherent summary from multiple sources
4. WHEN a quiz is needed THEN the AI Agent SHALL call AI models to generate questions that span content from multiple sources
5. WHEN a reflection is submitted THEN the AI Agent SHALL call AI models to analyze and provide feedback
6. WHEN recommendations are requested THEN the AI Agent SHALL use AI models to analyze user data and suggest next lessons
7. WHEN the leaderboard is updated THEN the AI Agent SHALL recalculate rankings and persist changes to the database
8. WHEN API rate limits are encountered THEN the AI Agent SHALL implement fallback strategies and queue requests appropriately
