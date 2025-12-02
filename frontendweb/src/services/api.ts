import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Lessons
  getLessons: async (fieldId?: string, difficulty?: string) => {
    const params = new URLSearchParams();
    if (fieldId) params.append('field_id', fieldId);
    if (difficulty) params.append('difficulty', difficulty);
    const { data } = await api.get(`/api/lessons?${params}`);
    return data;
  },

  getLesson: async (id: string) => {
    const { data } = await api.get(`/api/lessons/${id}`);
    return data;
  },

  // Quiz
  getQuiz: async (lessonId: string) => {
    const { data } = await api.get(`/api/quiz/${lessonId}`);
    return data;
  },

  submitQuiz: async (submission: any) => {
    const { data } = await api.post('/api/quiz/submit', submission);
    return data;
  },

  // Gamification
  getLeaderboard: async (limit: number = 100) => {
    const { data } = await api.get(`/api/gamification/leaderboard?limit=${limit}`);
    return data;
  },

  getUserStats: async (userId: string) => {
    const { data } = await api.get(`/api/gamification/stats/${userId}`);
    return data;
  },

  // Frankenstein
  generateLesson: async (params: {
    field: string;
    topic: string;
    num_sources?: number;
    generate_quiz?: boolean;
    num_quiz_questions?: number;
  }) => {
    const { data } = await api.post('/api/lessons/generate', params);
    return data;
  },

  // Fields
  getFields: async () => {
    const { data } = await api.get('/api/fields');
    return data;
  },

  // Reflections
  getDailyReflection: async () => {
    const { data } = await api.get('/api/reflections/daily');
    return data;
  },

  submitReflection: async (userId: string, response: string) => {
    const { data } = await api.post('/api/reflections', { user_id: userId, response });
    return data;
  },

  getReflectionHistory: async (userId: string) => {
    const { data } = await api.get(`/api/reflections/history?user_id=${userId}`);
    return data;
  },

  // Scheduling
  setSchedulePreferences: async (userId: string, preferences: any) => {
    const { data } = await api.post('/api/schedule/preferences', { user_id: userId, ...preferences });
    return data;
  },

  getUpcomingSessions: async (userId: string) => {
    const { data } = await api.get(`/api/schedule/upcoming?user_id=${userId}`);
    return data;
  },

  completeSession: async (sessionId: string) => {
    const { data } = await api.post(`/api/schedule/complete/${sessionId}`);
    return data;
  },

  // Recommendations
  getRecommendations: async (userId: string) => {
    const { data } = await api.get(`/api/recommendations/${userId}`);
    return data;
  },

  // Achievements
  getAchievements: async (userId: string) => {
    const { data } = await api.get(`/api/achievements?user_id=${userId}`);
    return data;
  },

  // Progress
  getProgress: async (userId: string) => {
    const { data } = await api.get(`/api/progress/${userId}`);
    return data;
  },
};

export default api;
