import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme';
import Navbar from '../components/Navbar';
import { ClayButton } from '../components/ClayButton';
import { apiService } from '../services/api';

interface Reflection {
  id: string;
  prompt: string;
  response?: string;
  feedback?: string;
  created_at: string;
  quality_score?: number;
}

const ReflectionScreen = ({ navigation }: { navigation: any }) => {
  const [todayReflection, setTodayReflection] = useState<Reflection | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pastReflections, setPastReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    loadTodayReflection();
    loadPastReflections();
  }, []);

  const loadTodayReflection = async () => {
    try {
      setLoading(true);
      const reflection = await apiService.getTodayReflection();
      setTodayReflection(reflection);
      if (reflection.response) {
        setResponse(reflection.response);
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPastReflections = async () => {
    try {
      const reflections = await apiService.getPastReflections();
      setPastReflections(reflections);
    } catch (error) {
      console.error('Error loading past reflections:', error);
    }
  };

  const handleSubmit = async () => {
    if (!response.trim() || !todayReflection) return;

    try {
      setSubmitting(true);
      const feedback = await apiService.submitReflection(todayReflection.id, response);
      setTodayReflection({ ...todayReflection, response, feedback: feedback.feedback, quality_score: feedback.quality_score });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return theme.colors.textMuted;
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getQualityLabel = (score?: number) => {
    if (!score) return 'Not rated';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading reflection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Daily Reflection</Text>
          <Text style={styles.headerSubtitle}>Influence Skills</Text>
        </View>
        <TouchableOpacity style={styles.historyButton} onPress={() => {}}>
          <Ionicons name="time-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Today's Prompt */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIcon}>
              <Ionicons name="bulb" size={32} color={theme.colors.clay.yellow} />
            </View>
            <View style={styles.promptMeta}>
              <Text style={styles.promptLabel}>Today's Prompt</Text>
              <Text style={styles.promptDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
          <Text style={styles.promptText}>{todayReflection?.prompt}</Text>
        </Animated.View>

        {/* Response Input */}
        {!showFeedback && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.responseCard}>
            <Text style={styles.responseLabel}>Your Reflection</Text>
            <TextInput
              style={styles.responseInput}
              placeholder="Share your thoughts and experiences..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={10}
              value={response}
              onChangeText={setResponse}
              textAlignVertical="top"
            />
            <View style={styles.responseFooter}>
              <Text style={styles.characterCount}>{response.length} characters</Text>
              <ClayButton
                title={submitting ? 'Submitting...' : 'Submit'}
                onPress={handleSubmit}
                disabled={!response.trim() || submitting}
                containerStyle={styles.submitButton}
              />
            </View>
          </Animated.View>
        )}

        {/* AI Feedback */}
        {showFeedback && todayReflection?.feedback && (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackIcon}>
                <Ionicons name="star" size={24} color={theme.colors.clay.teal} />
              </View>
              <Text style={styles.feedbackTitle}>AI Feedback</Text>
            </View>

            {todayReflection.quality_score && (
              <View style={styles.qualityScore}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreNumber, { color: getQualityColor(todayReflection.quality_score) }]}>
                    {todayReflection.quality_score}
                  </Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={[styles.scoreLabel, { color: getQualityColor(todayReflection.quality_score) }]}>
                    {getQualityLabel(todayReflection.quality_score)}
                  </Text>
                  <Text style={styles.scoreDescription}>Quality Score</Text>
                </View>
              </View>
            )}

            <Text style={styles.feedbackText}>{todayReflection.feedback}</Text>

            <View style={styles.feedbackActions}>
              <ClayButton
                title="New Reflection"
                variant="outline"
                onPress={() => {
                  setResponse('');
                  setShowFeedback(false);
                  loadTodayReflection();
                }}
                containerStyle={styles.feedbackButton}
              />
            </View>
          </Animated.View>
        )}

        {/* Your Response (when feedback is shown) */}
        {showFeedback && todayReflection?.response && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.yourResponseCard}>
            <Text style={styles.yourResponseLabel}>Your Response</Text>
            <Text style={styles.yourResponseText}>{todayReflection.response}</Text>
          </Animated.View>
        )}

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.tipsTitle}>Reflection Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>Be specific about situations and outcomes</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>Reflect on what you learned and how you grew</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.tipText}>Consider how you can apply insights in the future</Text>
            </View>
          </View>
        </Animated.View>

        {/* Past Reflections Preview */}
        {pastReflections.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.pastSection}>
            <View style={styles.pastHeader}>
              <Text style={styles.pastTitle}>Recent Reflections</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {pastReflections.slice(0, 3).map((reflection, index) => (
              <TouchableOpacity key={reflection.id} style={styles.pastItem}>
                <View style={styles.pastItemHeader}>
                  <Text style={styles.pastItemDate}>
                    {new Date(reflection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  {reflection.quality_score && (
                    <View style={[styles.pastItemBadge, { backgroundColor: getQualityColor(reflection.quality_score) + '20' }]}>
                      <Text style={[styles.pastItemBadgeText, { color: getQualityColor(reflection.quality_score) }]}>
                        {reflection.quality_score}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pastItemPrompt} numberOfLines={2}>{reflection.prompt}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  promptCard: {
    backgroundColor: theme.colors.clay.yellow + '20',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.clay.yellow + '40',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  promptIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  promptMeta: {
    flex: 1,
  },
  promptLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptDate: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  promptText: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    lineHeight: 32,
  },
  responseCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  responseLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  responseInput: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    minHeight: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  responseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  submitButton: {
    minWidth: 120,
  },
  feedbackCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.clay.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  feedbackTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  qualityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  scoreNumber: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxxl,
  },
  scoreMax: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    marginBottom: theme.spacing.xs,
  },
  scoreDescription: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  feedbackText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  feedbackButton: {
    flex: 1,
  },
  yourResponseCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yourResponseLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yourResponseText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipsTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tipsList: {
    gap: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  pastSection: {
    marginBottom: theme.spacing.xl,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pastTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  viewAllText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  pastItem: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  pastItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  pastItemDate: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  pastItemBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  pastItemBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
  },
  pastItemPrompt: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default ReflectionScreen;
