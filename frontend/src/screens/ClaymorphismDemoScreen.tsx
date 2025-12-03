import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { LoginScreen } from '../components/LoginScreen';
import { ClayCard } from '../components/ClayCard';

const { width, height } = Dimensions.get('window');

// Sample data for cards
const sampleCards = [
  {
    id: 1,
    title: 'Global Explorer',
    subtitle: 'Travel',
    description: 'Discover amazing places around the world',
    gradientColors: [theme.colors.clay.blue, theme.colors.clay.mint],
    iconType: 'globe' as const,
    value: '3.1423 ETH',
    actionButtons: [
      { icon: 'share-outline', onPress: () => console.log('Share pressed') },
      { icon: 'send-outline', onPress: () => console.log('Send pressed') },
      { icon: 'cart-outline', onPress: () => console.log('Buy pressed') },
    ],
  },
  {
    id: 2,
    title: 'Music Vibes',
    subtitle: 'Music',
    description: 'Feel the rhythm of life',
    color: theme.colors.clay.pink,
    iconType: 'music' as const,
    icon: 'musical-notes-outline',
  },
  {
    id: 3,
    title: 'Digital Art',
    subtitle: 'NFT',
    description: 'Unique digital collectibles',
    gradientColors: [theme.colors.clay.yellow, theme.colors.clay.pink],
    iconType: 'art' as const,
    value: '2.876 ETH',
  },
  {
    id: 4,
    title: 'Popular Picks',
    subtitle: 'Popular',
    description: 'Trending right now',
    color: theme.colors.clay.mint,
    iconType: 'trending' as const,
    icon: 'flame-outline',
  },
];

export const ClaymorphismDemoScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', email);
    setShowLogin(false);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleCreateAccount = () => {
    console.log('Create account pressed');
  };

  const handleCardPress = (cardId: number) => {
    console.log('Card pressed:', cardId);
  };

  if (showLogin) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <LoginScreen
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          onCreateAccount={handleCreateAccount}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowLogin(false)}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.cardBackground} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      
      <LinearGradient
        colors={[theme.colors.clay.cream, theme.colors.clay.blue]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Claymorphism UI</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowLogin(true)}
          >
            <LinearGradient
              colors={[theme.colors.clay.teal, theme.colors.clay.blue]}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>34.142 ETH</Text>
          <TouchableOpacity style={styles.marketButton}>
            <LinearGradient
              colors={[theme.colors.clay.teal, theme.colors.clay.blue]}
              style={styles.marketButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.marketButtonText}>Market →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.textMuted}
              style={styles.searchIcon}
            />
            <Text style={styles.searchPlaceholder}>Q Search</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {['Popular', 'Music', 'Travel', 'NFT'].map((category, index) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.tab,
                index === 0 && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  index === 0 && styles.activeTabText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          <View style={styles.cardsGrid}>
            {sampleCards.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <ClayCard
                  title={card.title}
                  subtitle={card.subtitle}
                  description={card.description}
                  color={card.color}
                  gradientColors={card.gradientColors}
                  iconType={card.iconType}
                  icon={card.icon}
                  value={card.value}
                  actionButtons={card.actionButtons}
                  onPress={() => handleCardPress(card.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fontFamily.black,
    color: theme.colors.text,
  },
  loginButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  loginButtonGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  loginButtonText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.cardBackground,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...theme.shadows.clay,
  },
  balanceLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  balanceValue: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fontFamily.black,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  marketButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  marketButtonGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  marketButtonText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.cardBackground,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchPlaceholder: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  tabsContainer: {
    marginBottom: theme.spacing.lg,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.clay.teal,
    fontFamily: theme.typography.fontFamily.bold,
  },
  cardsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  cardWrapper: {
    width: (width - theme.spacing.xl * 2 - theme.spacing.lg) / 2,
    marginBottom: theme.spacing.lg,
  },
});
