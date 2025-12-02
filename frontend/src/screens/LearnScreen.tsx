import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';
import { apiService } from '../services/api';
import { Field } from '../types';

const LearnScreen = ({ navigation }: { navigation: any }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await apiService.getFields();
      setFields(data);
    } catch (error) {
      console.error('Error loading fields:', error);
      // Fallback data if API fails or is empty
      setFields([
        {
          id: 'tech',
          name: 'Technology',
          description: 'Latest in tech and AI',
          icon: 'hardware-chip-outline',
          color: theme.colors.vintage.navy,
          total_lessons: 62,
        },
        {
          id: 'finance',
          name: 'Finance',
          description: 'Markets and investing',
          icon: 'trending-up-outline',
          color: theme.colors.vintage.sage,
          total_lessons: 45,
        },
        {
          id: 'economics',
          name: 'Economics',
          description: 'Economic principles',
          icon: 'cash-outline',
          color: theme.colors.vintage.sand,
          total_lessons: 38,
        },
        {
          id: 'culture',
          name: 'Culture',
          description: 'Arts and society',
          icon: 'globe-outline',
          color: theme.colors.vintage.lavender,
          total_lessons: 28,
        },
      ]);
    } finally {
      setLoading(false);
    }
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
              <BentoCard
                key={field.id}
                title={field.name}
                subtitle={`${field.total_lessons} lessons`}
                variant="vibrant"
                backgroundColor={field.color || theme.colors.primary}
                icon={<Ionicons name={field.icon as any || 'book-outline'} size={32} color="#FFFFFF" />}
                onPress={() => navigation.navigate('Learn', { fieldId: field.id })}
                style={styles.card}
              >
                <Text style={styles.description} numberOfLines={2}>
                  {field.description}
                </Text>
              </BentoCard>
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
    gap: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  description: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: '#FFFFFF',
    opacity: 0.9,
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
