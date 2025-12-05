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

export default function LessonsScreen() {
  const navigation = useNavigation();
  const [lessons, setLessons] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getLessons(selectedField || ''),
      apiService.getFields(),
    ])
      .then(([l, f]) => {
        setLessons(l);
        setFields(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedField]);

  const fieldData = [
    { name: 'Technology', color: 'coral', description: 'AI, software, digital trends', icon: '💻' },
    { name: 'Finance', color: 'sage', description: 'Markets, investing, money', icon: '💰' },
    { name: 'Economics', color: 'honey', description: 'Policy, trade, macro trends', icon: '📊' },
    { name: 'Culture', color: 'sky', description: 'Society, media, ideas', icon: '🎭' },
    { name: 'Influence', color: 'lavender', description: 'Persuasion, leadership', icon: '🎯' },
    { name: 'Global Events', color: 'rose', description: 'Geopolitics, world affairs', icon: '🌍' },
  ];

  const getFieldData = (fieldName: string) => {
    return fieldData.find((f) => f.name === fieldName) || fieldData[0];
  };

  const selectedFieldData = selectedField
    ? (() => {
        const field = fields.find((f) => f.id === selectedField);
        return getFieldData(field?.name || 'Technology');
      })()
    : null;

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
      {!selectedField ? (
        /* STEP 1: Field Selection */
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Your Field</Text>
            <Text style={styles.headerSubtitle}>
              Select a field to explore curated lessons. Each field has its own mascot guide to help you learn.
            </Text>
          </View>

          {/* Field Cards */}
          <View style={styles.fieldsContainer}>
            {fieldData.map((field) => {
              const fieldObj = fields.find((f) => f.name === field.name);
              const fieldLessons = fieldObj ? lessons.filter((l) => l.field_id === fieldObj.id) : [];
              const lessonCount = fieldLessons.length;

              return (
                <TouchableOpacity
                  key={field.name}
                  style={[
                    styles.fieldCard,
                    { backgroundColor: `${theme.colors[field.color as keyof typeof theme.colors]}10` },
                  ]}
                  onPress={() => {
                    if (fieldObj) {
                      setSelectedField(fieldObj.id);
                      setLoading(true);
                    }
                  }}
                >
                  {/* Mascot */}
                  <View style={styles.mascotContainer}>
                    <ClayMascot field={field.name} size="lg" animation="idle" />
                  </View>

                  {/* Field name */}
                  <Text style={styles.fieldName}>{field.name}</Text>

                  {/* Description */}
                  <Text style={styles.fieldDescription}>{field.description}</Text>

                  {/* Stats footer */}
                  <View style={styles.fieldFooter}>
                    <View style={styles.lessonCount}>
                      <Text style={styles.lessonCountNumber}>{lessonCount}</Text>
                      <Text style={styles.lessonCountLabel}>lessons</Text>
                    </View>

                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.charcoal} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom CTA */}
          <View style={styles.bottomCta}>
            <Text style={styles.ctaEmoji}>✨</Text>
            <Text style={styles.ctaTitle}>Can't find what you're looking for?</Text>
            <Text style={styles.ctaSubtitle}>Generate a custom lesson on any topic using AI</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Generate')}
            >
              <Text style={styles.ctaButtonText}>Generate Custom Lesson</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* STEP 2: Lesson List for Selected Field */
        <>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedField(null);
              setLessons([]);
            }}
          >
            <Ionicons name="chevron-back" size={16} color={theme.colors.textMuted} />
            <Text style={styles.backButtonText}>Back to all fields</Text>
          </TouchableOpacity>

          {/* Field Header Card */}
          {selectedFieldData && (
            <View
              style={[
                styles.fieldHeader,
                { backgroundColor: `${theme.colors[selectedFieldData.color as keyof typeof theme.colors]}10` },
              ]}
            >
              <ClayMascot field={selectedFieldData.name} size="lg" animation="wave" />
              <View style={styles.fieldHeaderContent}>
                <Text style={styles.fieldHeaderTitle}>{selectedFieldData.name}</Text>
                <Text style={styles.fieldHeaderDescription}>{selectedFieldData.description}</Text>
                <View style={styles.fieldHeaderStats}>
                  <Text style={styles.fieldHeaderStatsNumber}>{lessons.length}</Text>
                  <Text style={styles.fieldHeaderStatsLabel}>lessons available</Text>
                  <Text style={styles.fieldHeaderStatsSeparator}>·</Text>
                  <Text style={styles.fieldHeaderStatsLabel}>
                    {lessons.reduce((acc, l) => acc + (l.estimated_minutes || 5), 0)} min total
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No lessons yet</Text>
              <Text style={styles.emptySubtitle}>
                We're working on adding content to this field. Check back soon!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Generate')}
              >
                <Text style={styles.emptyButtonText}>Generate a Custom Lesson</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsContainer}>
              {lessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() =>
                    navigation.navigate('Learn', { id: lesson.id })
                  }
                >
                  {/* Lesson number badge */}
                  <View style={styles.lessonBadge}>
                    <Text style={styles.lessonBadgeText}>{index + 1}</Text>
                  </View>

                  {/* Lesson content */}
                  <View style={styles.lessonCardContent}>
                    <View style={styles.lessonMeta}>
                      <View style={styles.difficultyPill}>
                        <Text style={styles.difficultyText}>{lesson.difficulty_level || 'Beginner'}</Text>
                      </View>
                      <Text style={styles.lessonMetaText}>
                        {lesson.estimated_minutes || 5} min
                      </Text>
                      {lesson.sources?.length > 0 && (
                        <>
                          <Text style={styles.lessonMetaSeparator}>·</Text>
                          <Text style={styles.lessonMetaText}>{lesson.sources.length} sources</Text>
                        </>
                      )}
                    </View>
                    <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
                    {lesson.description && (
                      <Text style={styles.lessonCardDescription} numberOfLines={1}>
                        {lesson.description}
                      </Text>
                    )}
                  </View>

                  {/* Arrow */}
                  <View style={styles.lessonArrow}>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
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
    paddingBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.md * 1.5,
  },
  fieldsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  fieldCard: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  fieldName: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  fieldDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.charcoal}10`,
  },
  lessonCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lessonCountNumber: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  lessonCountLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.charcoal}05`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCta: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  ctaEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  ctaTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: theme.colors.coral,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  ctaButtonText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  fieldHeader: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  fieldHeaderContent: {
    flex: 1,
  },
  fieldHeaderTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  fieldHeaderDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  fieldHeaderStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fieldHeaderStatsNumber: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  fieldHeaderStatsLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  fieldHeaderStatsSeparator: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  emptyState: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: theme.colors.bgGradientDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  emptyButtonText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
  },
  lessonsContainer: {
    paddingHorizontal: theme.spacing.lg,
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
  lessonBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  lessonBadgeText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  lessonCardContent: {
    flex: 1,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  difficultyPill: {
    backgroundColor: `${theme.colors.coral}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  difficultyText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.coral,
  },
  lessonMetaText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  lessonMetaSeparator: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  lessonCardTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.xs,
  },
  lessonCardDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  lessonArrow: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.bgGradientDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
