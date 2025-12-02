import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';
import { ClayCard } from '../components/ClayCard';
import { apiService } from '../services/api';
import { Field } from '../types';

const LearnScreen = ({ navigation }: { navigation: any }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // For UI demo purposes, we'll use local data to ensure correct images and colors
    // In a real app, we would merge this with API data
    setLoading(false);
    setFields([
      {
        id: 'tech',
        name: 'Technology',
        description: 'Latest in tech and AI',
        icon: 'hardware-chip-outline',
        color: '#F4E4E4',
        total_lessons: 62,
        image: require('../assets/clay/scene_tech.png'),
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Markets and investing',
        icon: 'trending-up-outline',
        color: '#E0F0F5',
        total_lessons: 45,
        image: require('../assets/clay/scene_finance.png'),
      },
      {
        id: 'economics',
        name: 'Economics',
        description: 'Economic principles',
        icon: 'cash-outline',
        color: '#F9F3D8',
        total_lessons: 38,
        image: require('../assets/clay/scene_finance.png'), // Shared image
      },
      {
        id: 'culture',
        name: 'Culture',
        description: 'Arts and society',
        icon: 'globe-outline',
        color: '#E0F5EB',
        total_lessons: 28,
        image: require('../assets/clay/scene_culture.png'),
      },
      {
        id: 'influence',
        name: 'Influence Skills',
        description: 'Persuasion mastery',
        icon: 'bulb-outline',
        color: '#F5E0E0',
        total_lessons: 33,
        image: require('../assets/clay/scene_culture.png'), // Shared image
      },
      {
        id: 'global',
        name: 'Global Events',
        description: 'World affairs',
        icon: 'earth-outline',
        color: '#E0F5E8',
        total_lessons: 41,
        image: require('../assets/clay/scene_global.png'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Learning Fields</Text>
          <Text style={styles.subtitle}>Choose your area of focus</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading fields...</Text>
        ) : (
          <View style={styles.grid}>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.cardWrapper}>
                <ClayCard
                  title={field.name}
                  subtitle={`${field.total_lessons} LESSONS`}
                  description={field.description}
                  color={field.color}
                  image={field.image}
                  icon={field.icon}
                  onPress={() => navigation.navigate('Learn', { fieldId: field.id })}
                />
              </View>
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%', // 2 columns with gap
    marginBottom: 40, // Extra space for pop-out images
  },
  description: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(0,0,0,0.6)',
    marginTop: theme.spacing.sm,
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
