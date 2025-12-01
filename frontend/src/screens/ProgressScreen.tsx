import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

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
        icon: '🤖',
        color: '#00FFF0',
        lessonsCompleted: 45,
        totalLessons: 62,
        averageScore: 88,
        recentActivity: '2 hours ago',
      },
      {
        fieldId: 'finance',
        fieldName: 'Finance',
        icon: '📈',
        color: '#FF6B35',
        lessonsCompleted: 32,
        totalLessons: 45,
        averageScore: 82,
        recentActivity: '1 day ago',
      },
      {
        fieldId: 'economics',
        fieldName: 'Economics',
        icon: '💰',
        color: '#00FF88',
        lessonsCompleted: 20,
        totalLessons: 38,
        averageScore: 79,
        recentActivity: '3 days ago',
      },
      {
        fieldId: 'culture',
        fieldName: 'Culture',
        icon: '🌍',
        color: '#FF00FF',
        lessonsCompleted: 15,
        totalLessons: 28,
        averageScore: 91,
        recentActivity: '5 days ago',
      },
      {
        fieldId: 'influence',
        fieldName: 'Influence Skills',
        icon: '💡',
        color: '#FFD700',
        lessonsCompleted: 18,
        totalLessons: 33,
        averageScore: 85,
        recentActivity: '1 week ago',
      },
      {
        fieldId: 'global',
        fieldName: 'Global Events',
        icon: '🌐',
        color: '#00BFFF',
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
        icon: '🔥',
        earned: true,
        earnedDate: '2024-01-15',
      },
      {
        id: 'lessons_100',
        title: 'Century Club',
        description: '100 lessons completed',
        icon: '💯',
        earned: true,
        earnedDate: '2024-01-10',
      },
      {
        id: 'quiz_master',
        title: 'Quiz Master',
        description: 'Average score above 85%',
        icon: '🏆',
        earned: true,
        earnedDate: '2024-01-08',
      },
      {
        id: 'balanced_learner',
        title: 'Balanced Learner',
        description: 'Complete lessons in 5 fields',
        icon: '⚖️',
        earned: false,
        progress: 4,
        total: 5,
      },
    ],
  });

  const renderOverallStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>📊 Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.overallStats.totalLessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lessons Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.overallStats.totalQuizzesCompleted}</Text>
          <Text style={styles.statLabel}>Quizzes Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.overallStats.averageQuizScore}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.overallStats.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak 🔥</Text>
        </View>
      </View>
      
      <View style={styles.studyTimeContainer}>
        <View style={styles.studyTimeCard}>
          <Text style={styles.studyTimeNumber}>{userProgress.overallStats.studyTimeToday}</Text>
          <Text style={styles.studyTimeLabel}>Minutes Today</Text>
        </View>
        <View style={styles.studyTimeCard}>
          <Text style={styles.studyTimeNumber}>{userProgress.overallStats.studyTimeWeek}</Text>
          <Text style={styles.studyTimeLabel}>Minutes This Week</Text>
        </View>
      </View>
    </View>
  );

  const renderFieldProgress = (field: any) => {
    const progress = (field.lessonsCompleted / field.totalLessons) * 100;
    
    return (
      <View key={field.fieldId} style={styles.fieldProgressCard}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldIcon}>{field.icon}</Text>
          <View style={styles.fieldInfo}>
            <Text style={styles.fieldName}>{field.fieldName}</Text>
            <Text style={styles.fieldStats}>
              {field.lessonsCompleted}/{field.totalLessons} lessons • {field.averageScore}% avg
            </Text>
          </View>
          <Text style={styles.fieldActivity}>{field.recentActivity}</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%`, backgroundColor: field.color }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>
    );
  };

  const renderWeeklyActivity = () => (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>📈 Weekly Activity</Text>
      
      <View style={styles.activityChart}>
        {userProgress.weeklyActivity.map((day, index) => (
          <View key={day.day} style={styles.dayColumn}>
            <Text style={styles.dayMinutes}>{day.minutes}m</Text>
            <View 
              style={[
                styles.dayBar, 
                { height: `${(day.minutes / 65) * 100}%` }
              ]} 
            />
            <Text style={styles.dayLabel}>{day.day}</Text>
            <Text style={styles.dayLessons}>{day.lessons} lessons</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.weeklySummary}>
        <Text style={styles.summaryText}>
          Total: {userProgress.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} minutes • 
          {userProgress.weeklyActivity.reduce((sum, day) => sum + day.lessons, 0)} lessons
        </Text>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>🏆 Achievements</Text>
      
      <View style={styles.achievementsGrid}>
        {userProgress.achievements.map((achievement) => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementCard,
              !achievement.earned && styles.lockedAchievement
            ]}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            
            {achievement.earned ? (
              <Text style={styles.earnedDate}>Earned {achievement.earnedDate}</Text>
            ) : (
              <View style={styles.progressContainer}>
                <Text style={styles.achievementProgressText}>
                  {achievement.progress || 0}/{achievement.total || 1}
                </Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill,
                      { width: `${((achievement.progress || 0) / (achievement.total || 1)) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOverallStats()}
        
        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>📚 Field Progress</Text>
          {userProgress.fieldProgress.map(renderFieldProgress)}
        </View>
        
        {renderWeeklyActivity()}
        {renderAchievements()}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  statsContainer: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1F2E',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  studyTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studyTimeCard: {
    width: '48%',
    backgroundColor: '#1A1F2E',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  studyTimeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  studyTimeLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  fieldsSection: {
    marginBottom: 20,
  },
  fieldProgressCard: {
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 3,
  },
  fieldStats: {
    fontSize: 12,
    color: '#999',
  },
  fieldActivity: {
    fontSize: 11,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1A1F2E',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#00FFF0',
    textAlign: 'right',
  },
  weeklyContainer: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 15,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayMinutes: {
    fontSize: 10,
    color: '#00FFF0',
    marginBottom: 5,
  },
  dayBar: {
    width: 20,
    backgroundColor: '#00FFF0',
    borderRadius: 10,
    marginBottom: 5,
  },
  dayLabel: {
    fontSize: 11,
    color: '#FFF',
    marginBottom: 3,
  },
  dayLessons: {
    fontSize: 9,
    color: '#999',
  },
  weeklySummary: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#CCC',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00FFF0',
  },
  lockedAchievement: {
    borderColor: '#666',
    opacity: 0.7,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedDate: {
    fontSize: 10,
    color: '#00FF88',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#FFD700',
    marginBottom: 5,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1A1F2E',
    borderRadius: 2,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
});

export default ProgressScreen;
