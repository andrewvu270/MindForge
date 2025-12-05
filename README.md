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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.