import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { apiService } from '../services/api';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  rank: number;
  streak: number;
  lessons_completed: number;
  avatar_url?: string;
}

const LeaderboardScreen = ({ navigation }: { navigation: any }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLeaderboard(timeframe);
      setLeaderboard(data.leaderboard);
      setCurrentUser(data.currentUser);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return theme.colors.clay.yellow;
    if (rank === 2) return theme.colors.textLight;
    if (rank === 3) return theme.colors.clay.red;
    return theme.colors.textMuted;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length === 0) return null;

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

    return (
      <View style={styles.podiumContainer}>
        {podiumOrder.map((entry, index) => {
          const actualRank = entry.rank;
          const podiumHeight = actualRank === 1 ? 140 : actualRank === 2 ? 110 : 90;
          
          return (
            <Animated.View
              key={entry.user_id}
              entering={FadeInDown.delay(index * 100).duration(600)}
              style={[styles.podiumItem, { marginTop: 140 - podiumHeight }]}
            >
              <View style={styles.podiumAvatar}>
                {entry.avatar_url ? (
                  <Image source={{ uri: entry.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: getRankColor(actualRank) + '40' }]}>
                    <Text style={styles.avatarText}>{entry.username.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(actualRank) }]}>
                  <Text style={styles.rankBadgeText}>{getRankIcon(actualRank)}</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{entry.username}</Text>
              <Text style={styles.podiumPoints}>{entry.total_points.toLocaleString()}</Text>
              <View style={[styles.podiumBase, { height: podiumHeight, backgroundColor: getRankColor(actualRank) + '20' }]}>
                <Text style={[styles.podiumRank, { color: getRankColor(actualRank) }]}>#{actualRank}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = currentUser?.user_id === entry.user_id;

    return (
      <Animated.View
        key={entry.user_id}
        entering={FadeInDown.delay((index + 3) * 50).duration(400)}
      >
        <TouchableOpacity
          style={[
            styles.leaderboardItem,
            isCurrentUser && styles.leaderboardItemCurrent,
          ]}
        >
          <View style={styles.itemRank}>
            <Text style={[styles.itemRankText, isCurrentUser && styles.itemRankTextCurrent]}>
              {entry.rank}
            </Text>
          </View>

          <View style={styles.itemAvatar}>
            {entry.avatar_url ? (
              <Image source={{ uri: entry.avatar_url }} style={styles.itemAvatarImage} />
            ) : (
              <View style={styles.itemAvatarPlaceholder}>
                <Text style={styles.itemAvatarText}>{entry.username.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, isCurrentUser && styles.itemNameCurrent]}>
              {entry.username}
              {isCurrentUser && ' (You)'}
            </Text>
            <View style={styles.itemStats}>
              <View style={styles.itemStat}>
                <Ionicons name="flame" size={12} color={theme.colors.error} />
                <Text style={styles.itemStatText}>{entry.streak} day streak</Text>
              </View>
              <View style={styles.itemStat}>
                <Ionicons name="book" size={12} color={theme.colors.primary} />
                <Text style={styles.itemStatText}>{entry.lessons_completed} lessons</Text>
              </View>
            </View>
          </View>

          <View style={styles.itemPoints}>
            <Text style={[styles.itemPointsText, isCurrentUser && styles.itemPointsTextCurrent]}>
              {entry.total_points.toLocaleString()}
            </Text>
            <Text style={styles.itemPointsLabel}>pts</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.clay.teal, theme.colors.clay.blue]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Compete with learners worldwide</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {(['week', 'month', 'all'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeframeButton,
              timeframe === period && styles.timeframeButtonActive,
            ]}
            onPress={() => setTimeframe(period)}
          >
            <Text style={[
              styles.timeframeText,
              timeframe === period && styles.timeframeTextActive,
            ]}>
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 Podium */}
        {renderTopThree()}

        {/* Rest of Leaderboard */}
        <View style={styles.leaderboardList}>
          <Text style={styles.listTitle}>All Rankings</Text>
          {leaderboard.slice(3).map((entry, index) => renderLeaderboardItem(entry, index))}
        </View>

        {/* Current User Position (if not in top) */}
        {currentUser && currentUser.rank > 10 && (
          <View style={styles.currentUserContainer}>
            <Text style={styles.currentUserTitle}>Your Position</Text>
            {renderLeaderboardItem(currentUser, 0)}
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
  headerSpacer: {
    width: 40,
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeframeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  podiumAvatar: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.full,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankBadgeText: {
    fontSize: 14,
  },
  podiumName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  podiumPoints: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
  },
  podiumRank: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.xxl,
  },
  leaderboardList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  listTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  leaderboardItemCurrent: {
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  itemRank: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemRankText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  itemRankTextCurrent: {
    color: theme.colors.primary,
  },
  itemAvatar: {
    marginRight: theme.spacing.md,
  },
  itemAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
  },
  itemAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemAvatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemNameCurrent: {
    color: theme.colors.primary,
  },
  itemStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  itemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemStatText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  itemPoints: {
    alignItems: 'flex-end',
  },
  itemPointsText: {
    fontFamily: theme.typography.fontFamily.black,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  itemPointsTextCurrent: {
    color: theme.colors.primary,
  },
  itemPointsLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
  },
  currentUserContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  currentUserTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});

export default LeaderboardScreen;
