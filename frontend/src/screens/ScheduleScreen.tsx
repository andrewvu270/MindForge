import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { ClayButton } from '../components/ClayButton';
import { apiService } from '../services/api';

interface ScheduledSession {
  id: string;
  type: 'lesson' | 'quiz' | 'reflection';
  title: string;
  scheduled_time: string;
  duration_minutes: number;
  field?: string;
  completed: boolean;
  notification_sent: boolean;
}

interface SchedulePreferences {
  enabled: boolean;
  preferred_times: string[];
  sessions_per_week: number;
  notifications_enabled: boolean;
}

const ScheduleScreen = ({ navigation }: { navigation: any }) => {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [preferences, setPreferences] = useState<SchedulePreferences>({
    enabled: true,
    preferred_times: ['09:00', '18:00'],
    sessions_per_week: 5,
    notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('today');

  useEffect(() => {
    loadSchedule();
    loadPreferences();
  }, [selectedDay]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSchedule(selectedDay);
      setSessions(data);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await apiService.getSchedulePreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreferences = async (newPrefs: Partial<SchedulePreferences>) => {
    try {
      const updated = { ...preferences, ...newPrefs };
      await apiService.updateSchedulePreferences(updated);
      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getSessionIcon = (type: string) => {
    if (type === 'lesson') return 'book-outline';
    if (type === 'quiz') return 'help-circle-outline';
    return 'bulb-outline';
  };

  const getSessionColor = (type: string) => {
    if (type === 'lesson') return theme.colors.clay.blue;
    if (type === 'quiz') return theme.colors.clay.mint;
    return theme.colors.clay.yellow;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const groupSessionsByDate = () => {
    const grouped: Record<string, ScheduledSession[]> = {};
    sessions.forEach(session => {
      const date = new Date(session.scheduled_time).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const renderDaySelector = () => {
    const days = ['today', 'tomorrow', 'week'];
    
    return (
      <View style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              styles.dayText,
              selectedDay === day && styles.dayTextActive,
            ]}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSession = (session: ScheduledSession, index: number) => {
    const isPast = new Date(session.scheduled_time) < new Date();
    
    return (
      <Animated.View
        key={session.id}
        entering={FadeInDown.delay(index * 50).duration(400)}
      >
        <TouchableOpacity
          style={[
            styles.sessionCard,
            session.completed && styles.sessionCardCompleted,
            isPast && !session.completed && styles.sessionCardMissed,
          ]}
          onPress={() => {
            if (session.type === 'lesson') {
              navigation.navigate('LessonDetail', { lessonId: session.id });
            } else if (session.type === 'quiz') {
              navigation.navigate('Quiz', { lessonId: session.id });
            } else {
              navigation.navigate('Reflection');
            }
          }}
        >
          <View style={[styles.sessionIcon, { backgroundColor: getSessionColor(session.type) + '20' }]}>
            <Ionicons name={getSessionIcon(session.type)} size={24} color={getSessionColor(session.type)} />
          </View>

          <View style={styles.sessionInfo}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionType, { color: getSessionColor(session.type) }]}>
                {session.type.toUpperCase()}
              </Text>
              {session.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
              {isPast && !session.completed && (
                <View style={styles.missedBadge}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.error} />
                  <Text style={styles.missedText}>Missed</Text>
                </View>
              )}
            </View>

            <Text style={styles.sessionTitle}>{session.title}</Text>

            <View style={styles.sessionMeta}>
              <View style={styles.sessionMetaItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textLight} />
                <Text style={styles.sessionMetaText}>{formatTime(session.scheduled_time)}</Text>
              </View>
              <View style={styles.sessionMetaItem}>
                <Ionicons name="hourglass-outline" size={14} color={theme.colors.textLight} />
                <Text style={styles.sessionMetaText}>{session.duration_minutes} min</Text>
              </View>
              {session.field && (
                <View style={styles.sessionMetaItem}>
                  <Ionicons name="folder-outline" size={14} color={theme.colors.textLight} />
                  <Text style={styles.sessionMetaText}>{session.field}</Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPreferences = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.preferencesCard}>
      <View style={styles.preferencesHeader}>
        <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.preferencesTitle}>Schedule Preferences</Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Auto-Schedule Sessions</Text>
          <Text style={styles.preferenceDescription}>Automatically schedule learning sessions</Text>
        </View>
        <Switch
          value={preferences.enabled}
          onValueChange={(value) => updatePreferences({ enabled: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
          thumbColor={preferences.enabled ? theme.colors.primary : theme.colors.textMuted}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Notifications</Text>
          <Text style={styles.preferenceDescription}>Get reminders before sessions</Text>
        </View>
        <Switch
          value={preferences.notifications_enabled}
          onValueChange={(value) => updatePreferences({ notifications_enabled: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
          thumbColor={preferences.notifications_enabled ? theme.colors.primary : theme.colors.textMuted}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Sessions Per Week</Text>
          <Text style={styles.preferenceDescription}>Target: {preferences.sessions_per_week} sessions</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Preferred Times</Text>
          <Text style={styles.preferenceDescription}>
            {preferences.preferred_times.join(', ')}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </View>
    );
  }

  const groupedSessions = groupSessionsByDate();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.clay.teal, theme.colors.clay.mint]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>Stay on track with your learning</Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Day Selector */}
      {renderDaySelector()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Summary */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessions.filter(s => !s.completed).length}</Text>
              <Text style={styles.summaryLabel}>Upcoming</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessions.filter(s => s.completed).length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {sessions.reduce((sum, s) => sum + s.duration_minutes, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Total Minutes</Text>
            </View>
          </View>
        </Animated.View>

        {/* Sessions */}
        {Object.keys(groupedSessions).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No sessions scheduled</Text>
            <Text style={styles.emptyText}>Enable auto-scheduling or add sessions manually</Text>
            <ClayButton
              title="Enable Auto-Schedule"
              onPress={() => updatePreferences({ enabled: true })}
              containerStyle={styles.emptyButton}
            />
          </View>
        ) : (
          Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>
                {isToday(dateSessions[0].scheduled_time) ? 'Today' : formatDate(dateSessions[0].scheduled_time)}
              </Text>
              {dateSessions.map((session, index) => renderSession(session, index))}
            </View>
          ))
        )}

        {/* Preferences */}
        {renderPreferences()}
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.soft,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  dateSection: {
    marginBottom: theme.spacing.xl,
  },
  dateHeader: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  sessionCardCompleted: {
    opacity: 0.7,
  },
  sessionCardMissed: {
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sessionType: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.5,
    marginRight: theme.spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success,
  },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missedText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
  },
  sessionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  preferencesCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  preferencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  preferencesTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  preferenceDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  editButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  editButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default ScheduleScreen;
