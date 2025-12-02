import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Lesson, QuizQuestion } from '../types';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

interface Props {
  route: {
    params: {
      lessonId: string;
    };
  };
  navigation: any;
}

const LessonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessonAndQuiz();
  }, [lessonId]);

  const loadLessonAndQuiz = async () => {
    try {
      setLoading(true);
      
      // Get lesson details
      const lessonData = await apiService.getLesson(lessonId);
      setLesson(lessonData);

      // Get quiz questions for this lesson
      const quizData = await apiService.getQuiz(lessonId);
      setQuizzes(quizData);
    } catch (err) {
      setError('Failed to load lesson');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    navigation.navigate('Quiz', { lessonId });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#00FF88';
      case 'intermediate': return '#FFD700';
      case 'advanced': return '#FF6B6B';
      default: return '#999';
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown-like parsing
    return content
      .replace(/### (.*)/g, '\n\n$1\n')
      .replace(/## (.*)/g, '\n\n$1\n')
      .replace(/# (.*)/g, '\n\n$1\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFF0" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLessonAndQuiz}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderColor: lesson.category?.color || '#00FFF0' }]}>
          <View style={styles.headerTop}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{lesson.category?.icon}</Text>
              <Text style={styles.categoryName}>{lesson.category?.name}</Text>
            </View>
            <View style={styles.lessonMeta}>
              <Text style={[styles.difficultyBadge, { color: getDifficultyColor(lesson.difficulty) }]}>
                {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
              </Text>
              <Text style={styles.pointsBadge}>🏆 {lesson.points} pts</Text>
            </View>
          </View>
          
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          
          <View style={styles.lessonStats}>
            <Text style={styles.readingTime}>⏱️ {lesson.reading_time} minutes</Text>
            <Text style={styles.quizCount}>📝 {quizzes.length} questions</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {formatContent(lesson.content)}
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>Topics:</Text>
          <View style={styles.tagsList}>
            {lesson.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quiz Preview */}
        {quizzes.length > 0 && (
          <View style={styles.quizPreview}>
            <Text style={styles.quizTitle}>📝 Practice Quiz</Text>
            <Text style={styles.quizDescription}>
              Test your knowledge with {quizzes.length} questions
            </Text>
            <TouchableOpacity style={styles.startQuizButton} onPress={startQuiz}>
              <Text style={styles.startQuizText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#CCC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00FFF0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#0A0E27',
    fontWeight: 'bold',
  },
  header: {
    margin: 20,
    padding: 20,
    backgroundColor: '#252B3D',
    borderRadius: 16,
    borderBottomWidth: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#00FFF0',
    fontWeight: '600',
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointsBadge: {
    fontSize: 11,
    color: '#FFD700',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    lineHeight: 28,
  },
  lessonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readingTime: {
    fontSize: 13,
    color: '#CCC',
  },
  quizCount: {
    fontSize: 13,
    color: '#CCC',
  },
  contentContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#252B3D',
    borderRadius: 16,
  },
  contentText: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 24,
  },
  tagsContainer: {
    margin: 20,
    marginTop: 10,
  },
  tagsTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#1A1F2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#999',
  },
  quizPreview: {
    margin: 20,
    padding: 20,
    backgroundColor: '#252B3D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00FFF0',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 15,
  },
  startQuizButton: {
    backgroundColor: '#00FFF0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startQuizText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default LessonDetailScreen;
