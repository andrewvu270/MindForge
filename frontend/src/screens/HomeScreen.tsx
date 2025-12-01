import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [dailyChallenge, setDailyChallenge] = useState({
    id: 'daily_001',
    title: 'AI & Machine Learning Basics',
    description: 'Master fundamental concepts in artificial intelligence',
    field: 'Technology',
    lessonsCount: 3,
    estimatedTime: '45 min',
    difficulty: 'Intermediate',
  });

  const [recentLessons, setRecentLessons] = useState([
    {
      id: '1',
      title: 'Understanding Blockchain Technology',
      field: 'Technology',
      difficulty: 'Beginner',
      duration: '15 min',
      objectives: ['Learn distributed ledgers', 'Understand consensus mechanisms'],
      completed: false,
    },
    {
      id: '2',
      title: 'Introduction to Stock Market Analysis',
      field: 'Finance',
      difficulty: 'Intermediate',
      duration: '20 min',
      objectives: ['Technical analysis basics', 'Market indicators'],
      completed: true,
    },
    {
      id: '3',
      title: 'Global Economic Trends 2024',
      field: 'Economics',
      difficulty: 'Advanced',
      duration: '25 min',
      objectives: ['Inflation impacts', 'GDP forecasting'],
      completed: false,
    },
  ]);

  const renderDailyChallengeCard = () => (
    <TouchableOpacity 
      style={[styles.card, styles.dailyChallengeCard]}
      onPress={() => navigation.navigate('DailyChallenge')}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>⚡ Daily Challenge</Text>
        <Text style={styles.challengeSubtitle}>{dailyChallenge.title}</Text>
      </View>
      
      <View style={styles.challengeContent}>
        <Text style={styles.challengeDescription}>{dailyChallenge.description}</Text>
        <View style={styles.challengeMeta}>
          <Text style={styles.metaText}>📚 {dailyChallenge.lessonsCount} lessons</Text>
          <Text style={styles.metaText}>⏱️ {dailyChallenge.estimatedTime}</Text>
          <Text style={styles.metaText}>🎯 {dailyChallenge.difficulty}</Text>
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <Text style={styles.challengeField}>{dailyChallenge.field}</Text>
        <Text style={styles.startButton}>Start Challenge →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLessonCard = (lesson: any) => (
    <View key={lesson.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{lesson.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardField}>{lesson.field}</Text>
          <Text style={styles.cardDifficulty}>{lesson.difficulty}</Text>
          <Text style={styles.cardDuration}>⏱️ {lesson.duration}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.objectivesTitle}>Learning Objectives:</Text>
        {lesson.objectives.map((objective: any, index: number) => (
          <Text key={index} style={styles.objectiveItem}>• {objective}</Text>
        ))}
      </View>

      <View style={styles.cardActions}>
        {lesson.completed ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✅ Completed</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
            >
              <Text style={styles.actionText}>📖 Start Lesson</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('Quiz', { lessonId: lesson.id })}
            >
              <Text style={styles.actionText}>📝 Practice Quiz</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧠 MindForge</Text>
          <Text style={styles.headerSubtitle}>Serious Learning. Real Knowledge.</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
          {renderDailyChallengeCard()}
          
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {recentLessons.map(renderLessonCard)}
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  dailyChallengeCard: {
    borderColor: '#00FFF0',
    borderWidth: 2,
  },
  challengeHeader: {
    marginBottom: 15,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 5,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  challengeContent: {
    marginBottom: 15,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 10,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeField: {
    fontSize: 14,
    color: '#00FFF0',
    fontWeight: '600',
  },
  startButton: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardField: {
    fontSize: 12,
    color: '#00FFF0',
    fontWeight: '600',
  },
  cardDifficulty: {
    fontSize: 12,
    color: '#FFD700',
  },
  cardDuration: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    marginBottom: 15,
  },
  objectivesTitle: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  objectiveItem: {
    fontSize: 13,
    color: '#CCC',
    marginBottom: 3,
    paddingLeft: 5,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  completedBadge: {
    flex: 1,
    backgroundColor: '#00FF88',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
});

export default HomeScreen;
