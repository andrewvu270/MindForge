import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import ClayMascot from '../components/ClayMascot';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [todaysBriefing, setTodaysBriefing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiService.getUserStats('user_1'),
      apiService.getLessons(''),
      apiService.getDailyChallengeProgress('user_1'),
    ])
      .then(([s, l, d]) => {
        setStats(s);
        setTodaysBriefing(l.slice(0, 3));
        setDailyProgress(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topicsLearned = stats?.lessons_completed || 0;

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Navbar />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.coral} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.greetingText}>Good morning</Text>
      </View>

      {/* Main CTA - Video Feed */}
      <TouchableOpacity
        style={styles.mainCta}
        onPress={() => navigation.navigate('Feed')}
      >
        <View style={styles.ctaContent}>
          <ClayMascot field="User" size="lg" animation="wave" />
          <View style={styles.ctaOverlay}>
            <Text style={styles.ctaLabel}>Today's briefing</Text>
            <Text style={styles.ctaTitle}>Watch and learn</Text>
            <Text style={styles.ctaSubtitle}>Scroll through bite-sized lessons</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Daily Challenge Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DailyChallenge')}
      >
        <View style={styles.challengeContent}>
          <View style={styles.challengeLeft}>
            <View style={styles.challengeIcon}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.honey} />
            </View>
            <View>
              <Text style={styles.challengeTitle}>Daily Challenge</Text>
              <Text style={styles.challengeSubtitle}>
                {dailyProgress?.completed_count || 0}/{dailyProgress?.total_count || 4} completed · ~18 min
              </Text>
            </View>
          </View>
          <View style={styles.challengeRight}>
            <Text style={styles.streakNumber}>{stats?.current_streak || 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{topicsLearned}</Text>
          <Text style={styles.statLabel}>Topics learned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{topicsLearned * 5}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Feed')}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.coral}20` }]}>
            <Ionicons name="play" size={20} color={theme.colors.coral} />
          </View>
          <Text style={styles.actionLabel}>Watch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Flashcards')}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.honey}20` }]}>
            <Ionicons name="layers-outline" size={20} color={theme.colors.honey} />
          </View>
          <Text style={styles.actionLabel}>Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Reflection')}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.sky}20` }]}>
            <Ionicons name="create-outline" size={20} color={theme.colors.sky} />
          </View>
          <Text style={styles.actionLabel}>Reflect</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Topics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's topics</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Lessons')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {todaysBriefing.map((lesson, i) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => navigation.navigate('Learn', { id: lesson.id })}
          >
            <View style={styles.lessonNumber}>
              <Text style={styles.lessonNumberText}>{i + 1}</Text>
            </View>
            <View style={styles.lessonContent}>
              <Text style={styles.lessonMeta}>
                {lesson.field_name} · {lesson.estimated_minutes || 5} min
              </Text>
              <Text style={styles.lessonTitle} numberOfLines={1}>
                {lesson.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Knowledge Progress */}
      {topicsLearned > 0 && (
        <View style={styles.card}>
          <Text style={styles.knowledgeLabel}>Topics you understand</Text>
          <View style={styles.topicsContainer}>
            {['Market dynamics', 'AI basics', 'Economic indicators', 'Negotiation']
              .slice(0, Math.min(4, topicsLearned))
              .map((topic) => (
                <View key={topic} style={styles.topicPill}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.coral,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  greetingText: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  mainCta: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.coral,
    height: 200,
  },
  ctaContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ctaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ctaLabel: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: theme.spacing.xs,
  },
  ctaTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  ctaSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  challengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.honey}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  challengeTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.xs,
  },
  challengeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  challengeRight: {
    alignItems: 'flex-end',
  },
  streakNumber: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  streakLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statNumber: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  seeAllText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.coral,
    fontFamily: theme.typography.fontFamily.medium,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.bgGradientDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  lessonNumberText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textMuted,
  },
  lessonContent: {
    flex: 1,
  },
  lessonMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  lessonTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
  },
  knowledgeLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  topicPill: {
    backgroundColor: `${theme.colors.sage}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  topicText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.sage,
  },
});
