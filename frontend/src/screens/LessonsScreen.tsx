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
import { Lesson, Field } from '../types';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface Props {
  route: {
    params: {
      categoryId: string;
    };
  };
  navigation: any;
}

const LessonsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId } = route.params;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [category, setCategory] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryAndLessons();
  }, [categoryId]);

  const loadCategoryAndLessons = async () => {
    try {
      setLoading(true);
      
      // Get all fields to find the current category
      const fields = await apiService.getFields();
      const currentCategory = fields.find(f => f.id === categoryId);
      setCategory(currentCategory || null);

      // Get lessons for this category
      const lessonsData = await apiService.getLessons(categoryId);
      setLessons(lessonsData);
    } catch (err) {
      setError('Failed to load lessons');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#00FF88';
      case 'intermediate': return '#FFD700';
      case 'advanced': return '#FF6B6B';
      default: return '#999';
    }
  };

  const renderLessonCard = (lesson: Lesson) => (
    <TouchableOpacity
      key={lesson.id}
      style={styles.lessonCard}
      onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
    >
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.lessonMeta}>
          <Text style={[styles.difficultyBadge, { color: getDifficultyColor(lesson.difficulty) }]}>
            {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
          </Text>
          <Text style={styles.pointsBadge}>🏆 {lesson.points} pts</Text>
        </View>
      </View>
      
      <View style={styles.lessonContent}>
        <Text style={styles.lessonDescription} numberOfLines={3}>
          {lesson.content.replace(/[#*`]/g, '').substring(0, 150)}...
        </Text>
        
        <View style={styles.lessonFooter}>
          <View style={styles.tagsContainer}>
            {lesson.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.readingTime}>⏱️ {lesson.reading_time} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFF0" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategoryAndLessons}>
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
        <View style={[styles.header, { borderColor: category?.color || '#00FFF0' }]}>
          <Text style={styles.categoryIcon}>{category?.icon}</Text>
          <View style={styles.headerContent}>
            <Text style={styles.categoryName}>{category?.name}</Text>
            <Text style={styles.categoryDescription}>{category?.description}</Text>
            <Text style={styles.lessonCount}>{lessons.length} lessons available</Text>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          {lessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No lessons available yet</Text>
              <Text style={styles.emptySubtext}>We're adding new content regularly!</Text>
            </View>
          ) : (
            lessons.map(renderLessonCard)
          )}
        </View>
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
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#252B3D',
    borderBottomWidth: 2,
    margin: 20,
    borderRadius: 16,
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  lessonCount: {
    fontSize: 12,
    color: '#00FFF0',
    fontWeight: '600',
  },
  lessonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  lessonCard: {
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginRight: 10,
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
  lessonContent: {
    flex: 1,
  },
  lessonDescription: {
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#1A1F2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#999',
  },
  readingTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default LessonsScreen;
