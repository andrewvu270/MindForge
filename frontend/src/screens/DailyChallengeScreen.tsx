import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const DailyChallengeScreen = ({ navigation }) => {
  const [challenge] = useState({
    id: 'daily_001',
    title: 'AI & Machine Learning Fundamentals',
    description: 'Complete this comprehensive challenge to master AI basics',
    field: 'Technology',
    difficulty: 'Intermediate',
    estimatedTime: '45 min',
    lessons: [
      {
        id: 'lesson_1',
        title: 'Introduction to Neural Networks',
        duration: '15 min',
        completed: false,
      },
      {
        id: 'lesson_2',
        title: 'Understanding Deep Learning',
        duration: '20 min',
        completed: false,
      },
      {
        id: 'lesson_3',
        title: 'Practical AI Applications',
        duration: '10 min',
        completed: false,
      },
    ],
    quiz: {
      id: 'quiz_ai_basics',
      title: 'AI Fundamentals Quiz',
      questions: 10,
      timeLimit: '15 min',
      completed: false,
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleStartChallenge = () => {
    Alert.alert(
      'Start Daily Challenge',
      'This will begin your AI & Machine Learning challenge. Ready to start?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => startFirstLesson() },
      ]
    );
  };

  const startFirstLesson = () => {
    const firstLesson = challenge.lessons[0];
    navigation.navigate('LessonDetail', { lessonId: firstLesson.id });
  };

  const handleCompleteStep = (stepId) => {
    setCompletedSteps([...completedSteps, stepId]);
  };

  const renderChallengeHeader = () => (
    <View style={styles.challengeHeader}>
      <Text style={styles.challengeTitle}>⚡ Daily Challenge</Text>
      <Text style={styles.challengeSubtitle}>{challenge.title}</Text>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>
      
      <View style={styles.challengeMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🎯</Text>
          <Text style={styles.metaText}>{challenge.difficulty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaText}>{challenge.estimatedTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📚</Text>
          <Text style={styles.metaText}>{challenge.lessons.length} lessons</Text>
        </View>
      </View>
    </View>
  );

  const renderLessonStep = (lesson, index) => {
    const isCompleted = completedSteps.includes(lesson.id);
    const isCurrent = index === currentStep;
    
    return (
      <View key={lesson.id} style={[styles.stepCard, isCompleted && styles.completedStep]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{lesson.title}</Text>
            <Text style={styles.stepDuration}>⏱️ {lesson.duration}</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✅</Text>
            </View>
          )}
        </View>
        
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.stepButton, isCurrent && styles.currentStepButton]}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
          >
            <Text style={styles.stepButtonText}>
              {isCurrent ? 'Continue' : 'Start Lesson'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuizStep = () => {
    const isCompleted = completedSteps.includes(challenge.quiz.id);
    const canStartQuiz = completedSteps.length === challenge.lessons.length;
    
    return (
      <View key={challenge.quiz.id} style={[styles.stepCard, styles.quizCard, isCompleted && styles.completedStep]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>📝</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{challenge.quiz.title}</Text>
            <Text style={styles.stepDuration}>📊 {challenge.quiz.questions} questions • ⏱️ {challenge.quiz.timeLimit}</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✅</Text>
            </View>
          )}
        </View>
        
        {!isCompleted && (
          <TouchableOpacity
            style={[
              styles.stepButton, 
              styles.quizButton,
              !canStartQuiz && styles.disabledButton
            ]}
            onPress={() => canStartQuiz && navigation.navigate('Quiz', { lessonId: challenge.quiz.id })}
            disabled={!canStartQuiz}
          >
            <Text style={styles.stepButtonText}>
              {canStartQuiz ? 'Start Quiz' : 'Complete lessons first'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const progress = (completedSteps.length / (challenge.lessons.length + 1)) * 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderChallengeHeader()}
        
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Challenge Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Challenge Steps</Text>
          {challenge.lessons.map((lesson, index) => renderLessonStep(lesson, index))}
          {renderQuizStep()}
        </View>

        {completedSteps.length === 0 && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartChallenge}>
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        )}
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
    padding: 20,
  },
  challengeHeader: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00FFF0',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 15,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginBottom: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  progressSection: {
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1A1F2E',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFF0',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#00FFF0',
    textAlign: 'center',
    fontWeight: '600',
  },
  stepsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  stepCard: {
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  completedStep: {
    borderColor: '#00FF88',
    backgroundColor: '#1A2522',
  },
  quizCard: {
    borderColor: '#FFD700',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FFF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 3,
  },
  stepDuration: {
    fontSize: 12,
    color: '#999',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
  },
  stepButton: {
    backgroundColor: '#00FFF0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  currentStepButton: {
    backgroundColor: '#FFD700',
  },
  quizButton: {
    backgroundColor: '#FFD700',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  stepButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  startButton: {
    backgroundColor: '#00FFF0',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
});

export default DailyChallengeScreen;
