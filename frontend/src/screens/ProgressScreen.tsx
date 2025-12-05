import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import Navbar from '../components/Navbar';
import { BentoCard } from '../components/BentoCard';
import { ClayStatCard } from '../components/ClayStatCard';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const periods = [
    { id: 'day', name: 'Day' },
    { id: 'week', name: 'Week' },
    { id: 'month', name: 'Month' },
    { id: 'year', name: 'Year' },
  ];

  const [userProgress] = useState({
    overallStats: {
      totalLessonsCompleted: 127,
      totalQuizzesCompleted: 89,
      averageQuizScore: 84.5,
      currentStreak: 12,
      longestStreak: 28,
      studyTimeToday: 45, // minutes
      studyTimeWeek: 320, // minutes
      studyTimeMonth: 1240, // minutes
    },
    fieldProgress: [
      {
        fieldId: 'tech',
        fieldName: 'Technology',
        icon: 'hardware-chip-outline',
        color: '#3B82F6',
        lessonsCompleted: 45,
        totalLessons: 62,
        averageScore: 88,
        recentActivity: '2 hours ago',
      },
      {
        fieldId: 'finance',
        fieldName: 'Finance',
        icon: 'trending-up-outline',
        color: '#10B981',
        lessonsCompleted: 32,
        totalLessons: 45,
        averageScore: 82,
        recentActivity: '1 day ago',
      },
      {
        fieldId: 'economics',
        fieldName: 'Economics',
        icon: 'cash-outline',
        color: '#F59E0B',
        lessonsCompleted: 20,
        totalLessons: 38,
        averageScore: 79,
        recentActivity: '3 days ago',
      },
      {
        fieldId: 'culture',
        fieldName: 'Culture',
        icon: 'globe-outline',
        color: '#8B5CF6',
        lessonsCompleted: 15,
        totalLessons: 28,
        averageScore: 91,
        recentActivity: '5 days ago',
      },
      {
        fieldId: 'influence',
        fieldName: 'Influence Skills',
        icon: 'bulb-outline',
        color: '#EF4444',
        lessonsCompleted: 18,
        totalLessons: 33,
        averageScore: 85,
        recentActivity: '1 week ago',
      },
      {
        fieldId: 'global',
        fieldName: 'Global Events',
        icon: 'earth-outline',
        color: '#06B6D4',
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Track your learning journey</Text>
      
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodChip,
              selectedPeriod === period.id && styles.periodChipActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.id && styles.periodTextActive,
            ]}>
              {period.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverallStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.statsGrid}>
        <StatCard
          value={userProgress.overallStats.totalLessonsCompleted.toString()}
          label="Lessons"
          icon={<Ionicons name="book" size={24} color={theme.colors.primary} />}
          color={theme.colors.primary}
          trend={{ value: '+12%', isPositive: true }}
        />
        <StatCard
          value={userProgress.overallStats.totalQuizzesCompleted.toString()}
          label="Quizzes"
          icon={<Ionicons name="help-circle" size={24} color={theme.colors.secondary} />}
          color={theme.colors.secondary}
          trend={{ value: '+8%', isPositive: true }}
        />
        <StatCard
          value={`${userProgress.overallStats.averageQuizScore}%`}
          label="Avg Score"
          icon={<Ionicons name="trophy" size={24} color={theme.colors.warning} />}
          color={theme.colors.warning}
          trend={{ value: '+3%', isPositive: true }}
        />
        <StatCard
          value={userProgress.overallStats.currentStreak.toString()}
          label="Day Streak"
          icon={<Ionicons name="flame" size={24} color={theme.colors.error} />}
          color={theme.colors.error}
          trend={{ value: '+2', isPositive: true }}
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
        icon={<Ionicons name={field.icon} size={24} color={field.color} />}
        style={styles.fieldCard}
      >
        <View style={styles.fieldContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[field.color, field.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          
          <View style={styles.fieldStats}>
            <View style={styles.fieldStat}>
              <Text style={styles.fieldStatValue}>{field.averageScore}%</Text>
              <Text style={styles.fieldStatLabel}>Avg Score</Text>
            </View>
            <View style={styles.fieldStat}>
              <Text style={styles.fieldStatValue}>{field.recentActivity}</Text>
              <Text style={styles.fieldStatLabel}>Last Active</Text>
            </View>
          </View>
        </View>
      </BentoCard>
    );
  };

  const renderWeeklyActivity = () => (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>Weekly Activity</Text>

      <BentoCard
        title="Study Time"
        subtitle={`${userProgress.overallStats.studyTimeWeek} minutes this week`}
        backgroundColor={theme.colors.cardBackground}
        style={styles.weeklyCard}
      >
        <ProgressChart data={userProgress.weeklyActivity} />
        
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>320</Text>
            <Text style={styles.weeklyStatLabel}>Total Minutes</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>22</Text>
            <Text style={styles.weeklyStatLabel}>Lessons</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>45</Text>
            <Text style={styles.weeklyStatLabel}>Daily Avg</Text>
          </View>
        </View>
      </BentoCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderOverallStats()}

        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Field Progress</Text>
          {userProgress.fieldProgress.map(renderFieldProgress)}
        </View>

        {renderWeeklyActivity()}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  periodChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  periodChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.black,
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
  fieldContent: {
    marginTop: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  fieldStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  fieldStat: {
    flex: 1,
  },
  fieldStatValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  fieldStatLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  weeklyContainer: {
    marginBottom: theme.spacing.xl,
  },
  weeklyCard: {
    padding: 0,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  weeklyStatLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
});

export default ProgressScreen;
