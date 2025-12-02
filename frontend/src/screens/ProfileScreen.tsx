import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { BentoCard } from '../components/BentoCard';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const achievements = [
    {
      id: 'market_prophet',
      title: 'Market Prophet',
      subtitle: 'Predicted 7/10 market moves',
      icon: 'trending-up',
      color: '#10B981',
      earned: true,
      progress: 100,
    },
    {
      id: 'tech_expert',
      title: 'Tech Expert',
      subtitle: 'Completed 50+ tech lessons',
      icon: 'hardware-chip',
      color: '#3B82F6',
      earned: true,
      progress: 100,
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      subtitle: '7-day learning streak',
      icon: 'flame',
      color: '#F59E0B',
      earned: true,
      progress: 100,
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      subtitle: 'Average score above 85%',
      icon: 'trophy',
      color: '#8B5CF6',
      earned: false,
      progress: 78,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', score: 3200, avatar: '👩‍💻', trend: 'up' },
    { rank: 2, name: 'You', score: 2450, avatar: '🎯', trend: 'up', isCurrentUser: true },
    { rank: 3, name: 'Mike Johnson', score: 2100, avatar: '👨‍🔬', trend: 'down' },
    { rank: 4, name: 'Emma Davis', score: 1950, avatar: '👩‍🎨', trend: 'up' },
  ];

  const stats = [
    { label: 'Level', value: '12', icon: 'star', color: '#F59E0B' },
    { label: 'XP Points', value: '2,450', icon: 'flash', color: '#3B82F6' },
    { label: 'Rank', value: '#2', icon: 'ribbon', color: '#8B5CF6' },
    { label: 'Streak', value: '12', icon: 'flame', color: '#EF4444' },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <LinearGradient
        colors={[theme.colors.primary + '30', theme.colors.secondary + '30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarContainer}
      >
        <View style={styles.avatar}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>AC</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>Alex Chen</Text>
        <Text style={styles.profileTitle}>Level 12 • Knowledge Architect</Text>
        
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsContainer}
      >
        {achievements.map((achievement) => (
          <TouchableOpacity key={achievement.id} style={styles.achievementCard}>
            <LinearGradient
              colors={[achievement.color + '40', achievement.color + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.achievementGradient}
            >
              <View style={styles.achievementContent}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                </View>
                
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementSubtitle}>{achievement.subtitle}</Text>
                
                {!achievement.earned && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${achievement.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{achievement.progress}%</Text>
                  </View>
                )}
                
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <BentoCard
        title="Global Rankings"
        backgroundColor={theme.colors.cardBackground}
        style={styles.leaderboardCard}
      >
        {leaderboard.map((player) => (
          <View key={player.rank} style={[
            styles.leaderboardItem,
            player.isCurrentUser && styles.currentUserItem
          ]}>
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rank,
                player.rank === 1 && styles.rankGold,
                player.rank === 2 && styles.rankSilver,
                player.rank === 3 && styles.rankBronze,
                player.isCurrentUser && styles.rankCurrentUser,
              ]}>
                #{player.rank}
              </Text>
              {player.trend && (
                <Ionicons 
                  name={player.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={player.trend === 'up' ? theme.colors.success : theme.colors.error} 
                />
              )}
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerAvatar}>{player.avatar}</Text>
              <Text style={[
                styles.playerName,
                player.isCurrentUser && styles.currentUserText
              ]}>
                {player.name}
              </Text>
            </View>
            
            <Text style={[
              styles.playerScore,
              player.isCurrentUser && styles.currentUserText
            ]}>
              {player.score.toLocaleString()} pts
            </Text>
          </View>
        ))}
      </BentoCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderAchievements()}
        {renderLeaderboard()}

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
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    position: 'relative',
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  achievementsSection: {
    marginBottom: theme.spacing.xl,
  },
  achievementsContainer: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  achievementCard: {
    width: 160,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  achievementGradient: {
    flex: 1,
    padding: theme.spacing.md,
    position: 'relative',
  },
  achievementContent: {
    flex: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  achievementTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  achievementSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 'auto',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
  },
  earnedBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardSection: {
    marginBottom: theme.spacing.xl,
  },
  leaderboardCard: {
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
  currentUserItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
  },
  rankGold: {
    color: '#F59E0B',
  },
  rankSilver: {
    color: '#6B7280',
  },
  rankBronze: {
    color: '#92400E',
  },
  rankCurrentUser: {
    color: theme.colors.primary,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  playerAvatar: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  playerName: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  currentUserText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
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
