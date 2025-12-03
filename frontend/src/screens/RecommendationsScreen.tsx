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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { ClayCard } from '../components/ClayCard';
import { apiService } from '../services/api';

interface Recommendation {
  lesson_id: string;
  title: string;
  field: string;
  difficulty_level: string;
  estimated_minutes: number;
  reason: string;
  match_score: number;
  tags: string[];
}

const RecommendationsScreen = ({ navigation }: { navigation: any }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldColor = (field: string) => {
    const colorMap: Record<string, string> = {
      'Technology': theme.colors.clay.blue,
      'Finance': theme.colors.clay.mint,
      'Economics': theme.colors.clay.yellow,
      'Culture': theme.colors.clay.pink,
      'Influence Skills': theme.colors.clay.red,
      'Global Events': theme.colors.clay.teal,
    };
    return colorMap[field] || theme.colors.primary;
  };

  const getFieldIcon = (field: string): any => {
    const iconMap: Record<string, any> = {
      'Technology': 'hardware-chip-outline',
      'Finance': 'trending-up-outline',
      'Economics': 'cash-outline',
      'Culture': 'globe-outline',
      'Influence Skills': 'bulb-outline',
      'Global Events': 'earth-outline',
    };
    return iconMap[field] || 'book-outline';
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'beginner') return theme.colors.success;
    if (difficulty === 'intermediate') return theme.colors.warning;
    return theme.colors.error;
  };

  const filteredRecommendations = filter === 'all'
    ? recommendations
    : recommendations.filter(r => r.difficulty_level === filter);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding perfect lessons for you...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.clay.pink, theme.colors.clay.yellow]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Recommended for You</Text>
          <Text style={styles.headerSubtitle}>AI-powered lesson suggestions</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadRecommendations}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              filter === level && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(level)}
          >
            <Text style={[
              styles.filterText,
              filter === level && styles.filterTextActive,
            ]}>
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Why These? Section */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="star" size={24} color={theme.colors.clay.yellow} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Personalized Just for You</Text>
            <Text style={styles.infoText}>
              These recommendations are based on your learning history, performance, and interests.
            </Text>
          </View>
        </Animated.View>

        {/* Recommendations List */}
        {filteredRecommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No recommendations found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters or complete more lessons</Text>
          </View>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <Animated.View
              key={recommendation.lesson_id}
              entering={FadeInDown.delay(index * 100).duration(400)}
            >
              <TouchableOpacity
                style={styles.recommendationCard}
                onPress={() => navigation.navigate('LessonDetail', { lessonId: recommendation.lesson_id })}
              >
                {/* Match Score Badge */}
                <View style={[styles.matchBadge, { backgroundColor: getFieldColor(recommendation.field) }]}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.matchText}>{recommendation.match_score}% Match</Text>
                </View>

                {/* Field Badge */}
                <View style={[styles.fieldBadge, { backgroundColor: getFieldColor(recommendation.field) + '20' }]}>
                  <Ionicons name={getFieldIcon(recommendation.field)} size={16} color={getFieldColor(recommendation.field)} />
                  <Text style={[styles.fieldText, { color: getFieldColor(recommendation.field) }]}>
                    {recommendation.field}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.cardTitle}>{recommendation.title}</Text>

                {/* Reason */}
                <View style={styles.reasonContainer}>
                  <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.reasonText}>{recommendation.reason}</Text>
                </View>

                {/* Meta Info */}
                <View style={styles.metaContainer}>
                  <View style={[styles.metaBadge, { backgroundColor: getDifficultyColor(recommendation.difficulty_level) + '20' }]}>
                    <Text style={[styles.metaText, { color: getDifficultyColor(recommendation.difficulty_level) }]}>
                      {recommendation.difficulty_level}
                    </Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{recommendation.estimated_minutes} min</Text>
                  </View>
                </View>

                {/* Tags */}
                {recommendation.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {recommendation.tags.slice(0, 3).map((tag, tagIndex) => (
                      <View key={tagIndex} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {recommendation.tags.length > 3 && (
                      <Text style={styles.moreTagsText}>+{recommendation.tags.length - 3} more</Text>
                    )}
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => navigation.navigate('LessonDetail', { lessonId: recommendation.lesson_id })}
                >
                  <Text style={styles.startButtonText}>Start Learning</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        {/* Cross-Field Learning Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.crossFieldSection}>
          <View style={styles.crossFieldHeader}>
            <Ionicons name="git-network-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.crossFieldTitle}>Explore Cross-Field Learning</Text>
          </View>
          <Text style={styles.crossFieldText}>
            Combine knowledge from different fields to gain unique insights and perspectives.
          </Text>
          <TouchableOpacity style={styles.crossFieldButton}>
            <Text style={styles.crossFieldButtonText}>Discover Connections</Text>
          </TouchableOpacity>
        </Animated.View>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  filterTextActive: {
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.clay.yellow + '20',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.clay.yellow + '40',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
    position: 'relative',
  },
  matchBadge: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  matchText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    color: '#FFFFFF',
  },
  fieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  fieldText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 28,
    paddingRight: 80,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  reasonText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  moreTagsText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    alignSelf: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  startButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: '#FFFFFF',
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
  },
  crossFieldSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  crossFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  crossFieldTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  crossFieldText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  crossFieldButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  crossFieldButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: '#FFFFFF',
  },
});

export default RecommendationsScreen;
