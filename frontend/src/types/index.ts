// Core MindForge Type Definitions - Serious Learning Platform

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  field_id: string;
  difficulty_level: number; // 1-5
  estimated_minutes: number;
  learning_objectives: string[];
  key_concepts: string[];
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizSubmission {
  lesson_id: string;
  answers: Record<string, string>; // question_id -> answer
}

export interface QuizResult {
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: string[];
  incorrect_answers: string[];
  feedback: Record<string, string>; // question_id -> explanation
  completed_at: string;
}

export interface UserProgress {
  user_id: string;
  field_id: string;
  lessons_completed: number;
  total_lessons: number;
  quiz_scores: number[];
  average_score: number;
  streak_days: number;
  last_study_date: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  field_id: string;
  lesson_ids: string[];
  quiz_ids: string[];
  date: string;
  difficulty_level: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  field_id: string;
  source: string;
  published_at: string;
  reading_time_minutes: number;
  relevance_score: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Learn: { fieldId?: string };
  LessonDetail: { lessonId: string };
  Quiz: { lessonId: string };
  DailyChallenge: undefined;
  Profile: undefined;
  Progress: undefined;
  News: { fieldId: string };
};

export type TabParamList = {
  Home: undefined;
  Learn: undefined;
  DailyChallenge: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Component Props Types
export interface LessonCardProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
  onStartQuiz: (lesson: Lesson) => void;
}

export interface QuizQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  userAnswer?: string;
}

export interface ProgressCardProps {
  progress: UserProgress;
  field: Field;
}

// API Service Types
export interface ApiService {
  getFields: () => Promise<Field[]>;
  getLessons: (fieldId?: string, difficulty?: number) => Promise<Lesson[]>;
  getLesson: (id: string) => Promise<Lesson>;
  getQuiz: (lessonId: string) => Promise<QuizQuestion[]>;
  submitQuiz: (submission: QuizSubmission) => Promise<QuizResult>;
  getUserProgress: (userId: string) => Promise<Record<string, UserProgress>>;
  updateProgress: (userId: string, fieldId: string, lessonCompleted: boolean) => Promise<any>;
  getDailyChallenge: () => Promise<DailyChallenge>;
  getFieldNews: (fieldId: string, limit?: number) => Promise<NewsItem[]>;
}
