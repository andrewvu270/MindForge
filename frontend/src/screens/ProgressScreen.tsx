import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';
import { ClayStatCard } from '../components/ClayStatCard';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const [userProgress] = useState({
    overallStats: {
      totalLessonsCompleted: 127,
      totalQuizzesCompleted: 89,
      averageQuizScore: 84.5,
      currentStreak: 12,
      longestStreak: 28,
      studyTimeToday: 45, // minutes
      studyTimeWeek: 320, // minutes
    },
    fieldProgress: [
      {
        fieldId: 'tech',
        fieldName: 'Technology',
        icon: 'hardware-chip-outline',
        color: theme.colors.vintage.navy,
        lessonsCompleted: 45,
        totalLessons: 62,
        averageScore: 88,
        recentActivity: '2 hours ago',
      },
      {
        fieldId: 'finance',
        fieldName: 'Finance',
        icon: 'trending-up-outline',
        color: theme.colors.vintage.sage,
        lessonsCompleted: 32,
        totalLessons: 45,
        averageScore: 82,
        recentActivity: '1 day ago',
      },
      {
        fieldId: 'economics',
        fieldName: 'Economics',
        icon: 'cash-outline',
        color: theme.colors.vintage.sand,
        lessonsCompleted: 20,
        totalLessons: 38,
        averageScore: 79,
        recentActivity: '3 days ago',
      },
      {
        fieldId: 'culture',
        fieldName: 'Culture',
        icon: 'globe-outline',
        color: theme.colors.vintage.lavender,
        lessonsCompleted: 15,
        totalLessons: 28,
        averageScore: 91,
        recentActivity: '5 days ago',
      },
      {
        fieldId: 'influence',
        fieldName: 'Influence Skills',
        icon: 'bulb-outline',
        color: theme.colors.vintage.terracotta,
        lessonsCompleted: 18,
        totalLessons: 33,
        averageScore: 85,
        recentActivity: '1 week ago',
      },
      {
        fieldId: 'global',
        fieldName: 'Global Events',
        icon: 'earth-outline',
        color: theme.colors.vintage.slate,
        lessonsCompleted: 25,
        totalLessons: 41,
        averageScore: 77,
        recentActivity: '2 days ago',
      },
    ],
    weeklyActivity: [
      { day: 'Mon', minutes: 45, lessons: 3 },
      { day: 'Tue', minutes: 30, lessons: 2 },
      { day: 'Wed', minutes: 60, lessons: 4 },
      { day: 'Thu', minutes: 25, lessons: 2 },
      { day: 'Fri', minutes: 55, lessons: 3 },
      { day: 'Sat', minutes: 40, lessons: 3 },
      { day: 'Sun', minutes: 65, lessons: 5 },
    ],
    achievements: [
      {
        id: 'streak_week',
        title: 'Week Warrior',
        description: '7-day learning streak',
        icon: 'flame-outline',
        earned: true,
        earnedDate: '2024-01-15',
      },
      {
        id: 'lessons_100',
        title: 'Century Club',
        description: '100 lessons completed',
        icon: 'ribbon-outline',
        earned: true,
        earnedDate: '2024-01-10',
      },
      {
        id: 'quiz_master',
        title: 'Quiz Master',
        description: 'Average score above 85%',
        icon: 'trophy-outline',
        earned: true,
        earnedDate: '2024-01-08',
      },
      {
        id: 'balanced_learner',
        title: 'Balanced Learner',
        description: 'Complete lessons in 5 fields',
        icon: 'scale-outline',
        earned: false,
        progress: 4,
        total: 5,
      },
    ],
  });

  const renderOverallStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Your Progress</Text>

      <View style={styles.statsGrid}>
        <ClayStatCard
          value={userProgress.overallStats.totalLessonsCompleted.toString()}
          label="Lessons"
          color="#F4E4E4" // Soft Pink
          icon={<Ionicons name="book" size={24} color={theme.colors.text} />}
        />
        <ClayStatCard
          value={userProgress.overallStats.totalQuizzesCompleted.toString()}
          label="Quizzes"
          color="#E0F0F5" // Soft Blue
          icon={<Ionicons name="help-circle" size={24} color={theme.colors.text} />}
        />
        <ClayStatCard
          value={`${userProgress.overallStats.averageQuizScore}%`}
          label="Avg Score"
          color="#F9F3D8" // Soft Yellow
          icon={<Ionicons name="trophy" size={24} color={theme.colors.text} />}
        />
        <ClayStatCard
          value={userProgress.overallStats.currentStreak.toString()}
          label="Day Streak"
          color="#E0F5EB" // Soft Teal
          icon={<Ionicons name="flame" size={24} color={theme.colors.text} />}
        />
      </View>
    </View>
  );

  const renderFieldProgress = (field: any) => {
    const progress = (field.lessonsCompleted / field.totalLessons) * 100;

    return (
      <BentoCard
        key={field.fieldId}
        title={field.fieldName}
        subtitle={`${field.lessonsCompleted}/${field.totalLessons} lessons`}
        backgroundColor={theme.colors.cardBackground}
        icon={<Ionicons name={field.icon} size={24} color={theme.colors.text} />}
        style={styles.fieldCard}
      >
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: field.color }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </BentoCard>
    );
  };

  const renderWeeklyActivity = () => (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>Weekly Activity</Text>

      <BentoCard
        title="Activity"
        backgroundColor={theme.colors.cardBackground}
        style={styles.weeklyCard}
      >
        <View style={styles.activityChart}>
          {userProgress.weeklyActivity.map((day, index) => (
            <View key={day.day} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayBar,
                  {
                    height: `${(day.minutes / 65) * 100}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]}
              />
              <Text style={styles.dayLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </BentoCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOverallStats()}

        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Field Progress</Text>
          {userProgress.fieldProgress.map(renderFieldProgress)}
        </View>

        {renderWeeklyActivity()}
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
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },

  fieldsSection: {
    marginBottom: theme.spacing.lg,
  },
  fieldCard: {
    marginBottom: theme.spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  weeklyContainer: {
    marginBottom: theme.spacing.xl,
  },
  weeklyCard: {
    padding: theme.spacing.lg,
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: theme.spacing.lg,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
    opacity: 0.8,
  },
  dayLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
});

export default ProgressScreen;
