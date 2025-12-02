import { 
  Field, 
  Lesson, 
  QuizQuestion, 
  QuizSubmission, 
  QuizResult, 
  UserProgress, 
  DailyChallenge, 
  NewsItem 
} from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Fields
  async getFields(): Promise<Field[]> {
    return this.request<Field[]>('/api/fields');
  }

  // Lessons
  async getLessons(fieldId?: string, difficulty?: string): Promise<Lesson[]> {
    const params = new URLSearchParams();
    if (fieldId) params.append('field_id', fieldId);
    if (difficulty) params.append('difficulty', difficulty);
    
    const queryString = params.toString();
    return this.request<Lesson[]>(`/api/lessons${queryString ? `?${queryString}` : ''}`);
  }

  async getLesson(id: string): Promise<Lesson> {
    return this.request<Lesson>(`/api/lessons/${id}`);
  }

  // Quizzes
  async getQuiz(lessonId: string): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/quiz/${lessonId}`);
  }

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    return this.request<QuizResult>('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  // User Progress
  async getUserProgress(userId: string): Promise<Record<string, UserProgress>> {
    return this.request<Record<string, UserProgress>>(`/api/progress/${userId}`);
  }

  async updateProgress(userId: string, fieldId: string, lessonCompleted: boolean): Promise<any> {
    return this.request<any>(`/api/progress/${userId}/${fieldId}`, {
      method: 'POST',
      body: JSON.stringify({ lesson_completed: lessonCompleted }),
    });
  }

  // Daily Challenges
  async getDailyChallenge(): Promise<DailyChallenge> {
    return this.request<DailyChallenge>('/api/daily-challenge');
  }

  // News
  async getFieldNews(fieldId: string, limit: number = 10): Promise<NewsItem[]> {
    return this.request<NewsItem[]>(`/api/news/${fieldId}?limit=${limit}`);
  }

  // Frankenstein Lesson Generation
  async generateLesson(params: {
    field: string;
    topic: string;
    num_sources?: number;
    generate_quiz?: boolean;
    num_quiz_questions?: number;
  }): Promise<any> {
    return this.request<any>('/api/lessons/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Gamification
  async awardPoints(params: {
    user_id: string;
    activity_type: string;
    difficulty?: string;
    quiz_score?: number;
    completion_time_minutes?: number;
  }): Promise<any> {
    return this.request<any>('/api/gamification/award-points', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUserStats(userId: string): Promise<any> {
    return this.request<any>(`/api/gamification/stats/${userId}`);
  }

  async getLeaderboard(limit: number = 100): Promise<any[]> {
    return this.request<any[]>(`/api/gamification/leaderboard?limit=${limit}`);
  }

  async getAchievements(): Promise<any> {
    return this.request<any>('/api/gamification/achievements');
  }

  async getUserAchievements(userId: string): Promise<any> {
    return this.request<any>(`/api/gamification/achievements/${userId}`);
  }
}

export const apiService = new ApiService();
export default apiService;
