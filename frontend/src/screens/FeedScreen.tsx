import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { theme } from '../theme';
import Navbar from '../components/Navbar';

// This matches frontendweb/src/pages/Feed.tsx
// Video feed interface (TikTok-style)
export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Feed</Text>
          <Text style={styles.subtitle}>Scroll through bite-sized lessons</Text>
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
