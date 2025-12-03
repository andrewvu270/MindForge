import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme';
import { ClayButton } from '../components/ClayButton';
import { apiService } from '../services/api';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Props {
  route: {
    params: {
      lessonId: string;
    };
  };
  navigation: any;
}

const QuizScreen: React.FC<Props> = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await apiService.getQuiz(lessonId);
      setQuestions(quizData);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <Animated.View entering={FadeInUp.duration(600)} style={styles.resultsCard}>
            <View style={[styles.resultsBadge, { backgroundColor: passed ? theme.colors.success : theme.colors.error }]}>
              <Ionicons name={passed ? 'checkmark-circle' : 'close-circle'} size={64} color="#FFFFFF" />
            </View>

            <Text style={styles.resultsTitle}>
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </Text>
            <Text style={styles.resultsSubtitle}>
              {passed ? 'You passed the quiz!' : 'You can do better next time'}
            </Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}/{questions.length}</Text>
              <Text style={styles.scoreLabel}>Correct Answers</Text>
            </View>

            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: passed ? theme.colors.success : theme.colors.error }]} />
              </View>
            </View>

            <View style={styles.resultsActions}>
              <ClayButton
                title="Review Answers"
                variant="outline"
                onPress={() => setShowResults(false)}
                containerStyle={styles.actionButton}
              />
              <ClayButton
                title="Finish"
                onPress={handleFinish}
                containerStyle={styles.actionButton}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.answersReview}>
            <Text style={styles.reviewTitle}>Answer Review</Text>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <View key={question.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                    <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? theme.colors.success : theme.colors.error }]}>
                      <Ionicons name={isCorrect ? 'checkmark' : 'close'} size={16} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.reviewQuestion}>{question.question}</Text>
                  <Text style={styles.reviewAnswer}>
                    Your answer: <Text style={[styles.reviewAnswerText, { color: isCorrect ? theme.colors.success : theme.colors.error }]}>
                      {userAnswer || 'Not answered'}
                    </Text>
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.reviewCorrect}>
                      Correct answer: <Text style={styles.reviewCorrectText}>{question.correct_answer}</Text>
                    </Text>
                  )}
                  <Text style={styles.reviewExplanation}>{question.explanation}</Text>
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Quiz</Text>
          <Text style={styles.headerSubtitle}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarOuter}>
          <Animated.View 
            style={[styles.progressBarInner, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === option;
            
            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100).duration(400)}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectAnswer(option)}
                >
                  <View style={[
                    styles.optionRadio,
                    isSelected && styles.optionRadioSelected,
                  ]}>
                    {isSelected && <View style={styles.optionRadioInner} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentQuestionIndex === 0 ? theme.colors.textMuted : theme.colors.text} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <ClayButton
          title={currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
          onPress={handleNext}
          disabled={!selectedAnswers[currentQuestionIndex]}
          containerStyle={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  progressBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  questionCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.soft,
  },
  questionText: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: theme.colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  navButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  nextButton: {
    minWidth: 120,
  },
  resultsContainer: {
    padding: theme.spacing.lg,
    paddingTop: 80,
  },
  resultsCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  resultsBadge: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  resultsTitle: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  resultsSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scoreText: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.hero,
    color: theme.colors.text,
  },
  scoreLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  percentageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  percentageText: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  answersReview: {
    gap: theme.spacing.md,
  },
  reviewTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  reviewItem: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reviewQuestionNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  reviewBadge: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewQuestion: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reviewAnswer: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  reviewAnswerText: {
    fontFamily: theme.typography.fontFamily.bold,
  },
  reviewCorrect: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  reviewCorrectText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.success,
  },
  reviewExplanation: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default QuizScreen;
