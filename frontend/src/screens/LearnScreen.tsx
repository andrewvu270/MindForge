import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageSourcePropType,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';
import { ClayCard } from '../components/ClayCard';
import LearnCard from '../components/LearnCard';
import { apiService } from '../services/api';
import { Field } from '../types';

const { width } = Dimensions.get('window');

const LearnScreen = ({ navigation }: { navigation: any }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(false);
    setFields([
      {
        id: 'tech',
        name: 'Technology',
        description: 'Latest in tech and AI',
        icon: 'hardware-chip-outline',
        color: '#3B82F6',
        total_lessons: 62,
        image: require('../assets/clay/scene_tech.png'),
        mascot: require('../assets/clay/tech-mascot.png'),
        progress: 73,
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Markets and investing',
        icon: 'trending-up-outline',
        color: '#10B981',
        total_lessons: 45,
        image: require('../assets/clay/scene_finance.png'),
        mascot: require('../assets/clay/finance-mascot.png'),
        progress: 58,
      },
      {
        id: 'economics',
        name: 'Economics',
        description: 'Economic principles',
        icon: 'cash-outline',
        color: '#F59E0B',
        total_lessons: 38,
        image: require('../assets/clay/scene_finance.png'),
        mascot: require('../assets/clay/econ-mascot.png'),
        progress: 42,
      },
      {
        id: 'culture',
        name: 'Culture',
        description: 'Arts and society',
        icon: 'globe-outline',
        color: '#8B5CF6',
        total_lessons: 28,
        image: require('../assets/clay/scene_culture.png'),
        mascot: require('../assets/clay/culture-mascot.png'),
        progress: 85,
      },
      {
        id: 'influence',
        name: 'Influence Skills',
        description: 'Persuasion mastery',
        icon: 'bulb-outline',
        color: '#EF4444',
        total_lessons: 33,
        image: require('../assets/clay/scene_culture.png'),
        mascot: require('../assets/clay/influence-mascot.png'),
        progress: 67,
      },
      {
        id: 'global',
        name: 'Global Events',
        description: 'World affairs',
        icon: 'earth-outline',
        color: '#06B6D4',
        total_lessons: 41,
        image: require('../assets/clay/scene_global.png'),
        mascot: require('../assets/clay/global-mascot.png'),
        progress: 31,
      },
    ]);
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'trending', name: 'Trending', icon: 'flame-outline' },
    { id: 'new', name: 'New', icon: 'add-circle-outline' },
    { id: 'completed', name: 'Completed', icon: 'checkmark-circle-outline' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Learning Fields</Text>
        <Text style={styles.subtitle}>Choose your area of focus</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>247</Text>
          <Text style={styles.statLabel}>Total Lessons</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>62%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
      </View>
    </View>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons
            name={category.icon as any}
            size={16}
            color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.textLight}
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive,
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeaturedCard = () => {
    const featured = fields.find(f => f.progress && f.progress >= 70) || fields[0];
    if (!featured) return null;

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => navigation.navigate('Curriculum', {
          fieldId: featured.id,
          fieldName: featured.name,
          color: featured.color
        })}
      >
        <LinearGradient
          colors={[featured.color + 'DD', featured.color + '99']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredIcon}>
                <Ionicons name={featured.icon as any} size={32} color="#FFFFFF" />
              </View>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            </View>

            <Text style={styles.featuredTitle}>{featured.name}</Text>
            <Text style={styles.featuredDescription}>{featured.description}</Text>

            <View style={styles.featuredFooter}>
              <View style={styles.featuredProgress}>
                <Text style={styles.featuredProgressText}>
                  {featured.total_lessons} lessons
                </Text>
                <View style={styles.featuredProgressBar}>
                  <View
                    style={[
                      styles.featuredProgressFill,
                      { width: `${featured.progress || 0}%` }
                    ]}
                  />
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderCategories()}
        {renderFeaturedCard()}

        <Text style={styles.sectionTitle}>All Fields</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading fields...</Text>
        ) : (
          <View style={styles.grid}>
            {fields.map((field) => (
              <LearnCard
                key={field.id}
                title={field.name}
                subtitle={`${field.total_lessons} lessons`}
                description={field.description}
                lessons={field.total_lessons}
                color={field.color}
                image={field.image}
                icon={field.icon}
                mascot={field.mascot}
                progress={field.progress}
                onPress={() => navigation.navigate('Curriculum', {
                  fieldId: field.id,
                  fieldName: field.name,
                  color: field.color
                })}
              />
            ))}
          </View>
        )}
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
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
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statNumber: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  featuredCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  featuredGradient: {
    padding: theme.spacing.lg,
  },
  featuredContent: {
    flex: 1,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  featuredIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  featuredBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    color: '#FFFFFF',
  },
  featuredTitle: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  featuredDescription: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.lg,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredProgress: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  featuredProgressText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },
  featuredProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  featuredProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default LearnScreen;
