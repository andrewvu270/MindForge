import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={theme.colors.text} />
          </View>
          <Text style={styles.profileName}>Alex Chen</Text>
          <Text style={styles.profileTitle}>Level 12 • Knowledge Architect</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <View style={styles.grid}>
          <BentoCard
            title="Market Prophet"
            subtitle="Predicted 7/10 market moves"
            backgroundColor={theme.colors.warning}
            icon={<Ionicons name="flash" size={24} color={theme.colors.text} />}
            size="small"
            style={styles.card}
          />
          <BentoCard
            title="Tech Expert"
            subtitle="Completed 50+ tech lessons"
            backgroundColor={theme.colors.info}
            icon={<Ionicons name="school" size={24} color={theme.colors.text} />}
            size="small"
            style={styles.card}
          />
          <BentoCard
            title="Week Warrior"
            subtitle="7-day learning streak"
            backgroundColor={theme.colors.warning}
            icon={<Ionicons name="flame" size={24} color={theme.colors.text} />}
            size="small"
            style={styles.card}
          />
        </View>

        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <BentoCard
          title="Leaderboard"
          backgroundColor={theme.colors.cardBackground}
          style={styles.leaderboardCard}
        >
          <View style={styles.leaderboardItem}>
            <Text style={[styles.rank, { color: theme.colors.warning }]}>#1</Text>
            <Text style={styles.playerName}>Sarah</Text>
            <Text style={styles.playerScore}>3,200 pts</Text>
          </View>

          <View style={[styles.leaderboardItem, styles.currentUser]}>
            <Text style={[styles.rank, { color: theme.colors.primary }]}>#2</Text>
            <Text style={[styles.playerName, { fontWeight: 'bold' }]}>You</Text>
            <Text style={[styles.playerScore, { fontWeight: 'bold' }]}>2,450 pts</Text>
          </View>

          <View style={styles.leaderboardItem}>
            <Text style={[styles.rank, { color: theme.colors.textLight }]}>#3</Text>
            <Text style={styles.playerName}>Mike</Text>
            <Text style={styles.playerScore}>2,100 pts</Text>
          </View>
        </BentoCard>

        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  avatarText: {
    fontSize: 40,
  },
  profileName: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.serifBold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  grid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: 0,
  },
  leaderboardCard: {
    marginBottom: theme.spacing.xl,
    padding: 0,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  currentUser: {
    backgroundColor: theme.colors.info + '20', // 20% opacity
  },
  rank: {
    width: 40,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
  },
  playerName: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  playerScore: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  settingsButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  settingsButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  },
});

export default ProfileScreen;
