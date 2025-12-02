import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Lesson } from '@/types';

interface LessonCardProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
  onQuiz: (lesson: Lesson) => void;
}

const { width } = Dimensions.get('window');

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPress, onQuiz }) => {
  const getCategoryColor = (categoryId: string): string => {
    const colors: Record<string, string> = {
      'tech': '#00FFF0',
      'finance': '#FF6B35',
      'culture': '#00FF88',
      'influence': '#9B59B6',
      'events': '#E74C3C',
    };
    return colors[categoryId] || '#00FFF0';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      'beginner': '#00FF88',
      'intermediate': '#FFD700',
      'advanced': '#FF6B35',
    };
    return colors[difficulty] || '#00FF88';
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{lesson.title}</Text>
        <Text style={styles.cardPoints}>+{lesson.points} pts</Text>
      </View>
      
      <View style={styles.cardMeta}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(lesson.categoryId) }]}>
          <Text style={styles.categoryText}>{lesson.categoryId}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
          <Text style={styles.difficultyText}>{lesson.difficulty}</Text>
        </View>
        {lesson.readingTime && (
          <Text style={styles.readingTime}>📖 {lesson.readingTime} min</Text>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.contentText} numberOfLines={3}>
          {lesson.content}
        </Text>
      </View>

      {lesson.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {lesson.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {lesson.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{lesson.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => onPress(lesson)}
        >
          <Text style={styles.actionText}>📚 Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => onQuiz(lesson)}
        >
          <Text style={styles.actionText}>🎯 Quiz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginRight: 10,
  },
  cardPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  readingTime: {
    fontSize: 10,
    color: '#666',
  },
  cardContent: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#1A1F2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#00FFF0',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#00FFF0',
  },
  secondaryAction: {
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#00FFF0',
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  primaryAction: {
    backgroundColor: '#00FFF0',
  },
  primaryAction: {
    backgroundColor: '#00FFF0',
  },
});

export default LessonCard;
