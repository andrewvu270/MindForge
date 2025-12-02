import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';

const DailyChallengeScreen = ({ navigation }: { navigation: any }) => {
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
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

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

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps([...completedSteps, stepId]);
  };

  const renderChallengeHeader = () => (
    <BentoCard
      title="Daily Challenge"
      subtitle={challenge.title}
      backgroundColor={theme.colors.accent}
      style={styles.headerCard}
    >
      <Text style={styles.description}>{challenge.description}</Text>
      <View style={styles.metaContainer}>
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
    </BentoCard>
  );

  const renderLessonStep = (lesson: any, index: number) => {
    const isCompleted = completedSteps.includes(lesson.id);
    const isCurrent = index === currentStep;

    return (
      <BentoCard
        key={lesson.id}
        title={lesson.title}
        subtitle={`${lesson.duration}`}
        backgroundColor={isCompleted ? theme.colors.success : theme.colors.cardBackground}
        style={styles.stepCard}
        icon={
          <View style={[styles.stepNumber, isCompleted && styles.completedStepNumber]}>
            <Text style={styles.stepNumberText}>{isCompleted ? '✓' : index + 1}</Text>
          </View>
        }
      >
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.actionButton, isCurrent && styles.primaryButton]}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
          >
            <Text style={[styles.actionButtonText, isCurrent && styles.primaryButtonText]}>
              {isCurrent ? 'Continue' : 'Start Lesson'}
            </Text>
          </TouchableOpacity>
        )}
      </BentoCard>
    );
  };

  const renderQuizStep = () => {
    const isCompleted = completedSteps.includes(challenge.quiz.id);
    const canStartQuiz = completedSteps.length === challenge.lessons.length;

    return (
      <BentoCard
        key={challenge.quiz.id}
        title={challenge.quiz.title}
        subtitle={`${challenge.quiz.questions} questions • ${challenge.quiz.timeLimit}`}
        backgroundColor={isCompleted ? theme.colors.success : theme.colors.warning}
        style={styles.stepCard}
        icon={
          <View style={[styles.stepNumber, isCompleted && styles.completedStepNumber]}>
            <Text style={styles.stepNumberText}>{isCompleted ? '✓' : '📝'}</Text>
          </View>
        }
      >
        {!isCompleted && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.quizButton,
              !canStartQuiz && styles.disabledButton
            ]}
            onPress={() => canStartQuiz && navigation.navigate('Quiz', { lessonId: challenge.quiz.id })}
            disabled={!canStartQuiz}
          >
            <Text style={styles.actionButtonText}>
              {canStartQuiz ? 'Start Quiz' : 'Complete lessons first'}
            </Text>
          </TouchableOpacity>
        )}
      </BentoCard>
    );
  };

  const progress = (completedSteps.length / (challenge.lessons.length + 1)) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderChallengeHeader()}

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Challenge Progress</Text>
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
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  headerCard: {
    marginBottom: theme.spacing.xl,
  },
  description: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    opacity: 0.8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
  },
  progressSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.info,
    borderRadius: 6,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    textAlign: 'right',
  },
  stepsSection: {
    marginBottom: theme.spacing.xl,
  },
  stepCard: {
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStepNumber: {
    backgroundColor: theme.colors.background,
  },
  stepNumberText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.background,
    fontSize: theme.typography.sizes.sm,
  },
  actionButton: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quizButton: {
    backgroundColor: theme.colors.background,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  startButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: '#FFFFFF',
  },
});

export default DailyChallengeScreen;
