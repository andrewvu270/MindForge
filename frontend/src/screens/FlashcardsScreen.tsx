import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { theme } from '../theme';
import Navbar from '../components/Navbar';

// This matches frontendweb/src/pages/Flashcards.tsx
// Flashcard review interface
export default function FlashcardsScreen({ route }: any) {
  const { field } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Flashcards</Text>
          <Text style={styles.subtitle}>
            {field ? `Review ${field} flashcards` : 'Review your flashcards'}
          </Text>
        </View>
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
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
  },
});
