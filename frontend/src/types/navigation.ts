// Navigation types matching frontendweb routes exactly

export type RootStackParamList = {
  // Public routes
  Landing: undefined;
  Login: undefined;

  // Protected routes
  Dashboard: undefined;
  Lessons: undefined;
  LessonDetail: { id: string };
  Learn: { id: string };
  LearnRead: { id: string };
  LearnVideo: { id: string };
  Quiz: { lessonId: string };
  Generate: undefined;
  Reflection: undefined;
  ReflectionHistory: undefined;
  Achievements: undefined;
  Progress: undefined;
  Flashcards: { field?: string };
  Feed: undefined;
  DailyChallenge: undefined;
  Curriculum: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
