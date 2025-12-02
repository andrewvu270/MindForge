import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { Field, Lesson, DailyChallenge } from '../types';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fieldsData, lessonsData, challengeData] = await Promise.all([
        apiService.getFields(),
        apiService.getLessons(),
        apiService.getDailyChallenge()
      ]);

      setFields(fieldsData);
      setRecentLessons(lessonsData.slice(0, 3));
      setDailyChallenge(challengeData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDailyChallengeCard = () => {
    if (!dailyChallenge) return null;

    const field = fields.find(f => f.id === dailyChallenge.field_id);

    return (
      <BentoCard
        title="Daily Challenge"
        subtitle={dailyChallenge.title}
        backgroundColor={theme.colors.accent}
        textColor={theme.colors.text}
        size="large"
        onPress={() => navigation.navigate('DailyChallenge')}
        icon={<Ionicons name="flash" size={32} color={theme.colors.text} />}
      >
        <View style={styles.challengeContent}>
          <Text style={styles.challengeDescription} numberOfLines={2}>
            {dailyChallenge.description}
          </Text>
          <View style={styles.tagContainer}>
            <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
              <Text style={styles.tagText}>📚 {dailyChallenge.lesson_ids.length} lessons</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
              <Text style={styles.tagText}>🎯 {dailyChallenge.difficulty_level}</Text>
            </View>
          </View>
        </View>
      </BentoCard>
    );
  };

  const renderLessonCard = (lesson: Lesson) => {
    const field = fields.find(f => f.id === lesson.field_id);

    return (
      <BentoCard
        key={lesson.id}
        title={lesson.title}
        subtitle={`${field?.name || 'Unknown'} • ${lesson.estimated_minutes} min`}
        backgroundColor={theme.colors.cardBackground}
        onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
        style={{ marginBottom: theme.spacing.md }}
      >
        <View style={styles.lessonFooter}>
          <View style={[styles.tag, { backgroundColor: theme.colors.info }]}>
            <Text style={styles.tagText}>{lesson.difficulty_level}</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
          >
            <Text style={styles.playButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </BentoCard>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MindForge</Text>
          <Text style={styles.headerSubtitle}>Ready to learn?</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <View style={styles.grid}>
            <View style={styles.fullWidthItem}>
              {renderDailyChallengeCard()}
            </View>

            <Text style={styles.sectionTitle}>Explore</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {fields.map((field, index) => (
                <BentoCard
                  key={field.id}
                  title={field.name}
                  subtitle={`${field.total_lessons} lessons`}
                  backgroundColor={[
                    theme.colors.info,
                    theme.colors.success,
                    theme.colors.warning,
                    theme.colors.secondary,
                    theme.colors.warning
                  ][index % 5]}
                  size="small"
                  style={{ width: 160, marginRight: theme.spacing.md }}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <View style={styles.listContainer}>
              {recentLessons.map(renderLessonCard)}
            </View>
          </View>
        )}
      </Animated.ScrollView>
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
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.display,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textLight,
  },
  grid: {
    flex: 1,
  },
  fullWidthItem: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  horizontalScroll: {
    marginBottom: theme.spacing.xl,
    marginHorizontal: -theme.spacing.lg,
  },
  horizontalScrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  challengeContent: {
    marginTop: theme.spacing.sm,
  },
  challengeDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    opacity: 0.8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  playButton: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  playButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.background,
  },
});

export default HomeScreen;
