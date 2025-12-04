import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function LandingScreen({ navigation }: any) {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['smarter', 'sharper', 'informed', 'confident'];
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Nav */}
      <View style={styles.nav}>
        <Text style={styles.logo}>mindforge</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.startButtonText}>Start free</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        {/* Logo Card */}
        <LinearGradient
          colors={[`${theme.colors.coral}20`, `${theme.colors.lavender}20`]}
          style={styles.logoCard}
        >
          <LinearGradient
            colors={[theme.colors.coral, theme.colors.lavender]}
            style={styles.logoIcon}
          >
            <Ionicons name="bulb" size={40} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.logoCardTitle}>mindforge</Text>
            <Text style={styles.logoCardSubtitle}>Learn smarter, not harder</Text>
          </View>
        </LinearGradient>

        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>5 minutes a day</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          Get{' '}
          <Animated.Text style={[styles.headlineHighlight, { opacity: fadeAnim }]}>
            {words[currentWord]}
          </Animated.Text>
          {'\n'}while you scroll
        </Text>

        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Short video lessons on tech, finance, and world events. Swipe through like TikTok.
          Actually remember what you learn.
        </Text>

        {/* CTA Buttons */}
        <View style={styles.ctaButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Start learning free</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="play" size={20} color={theme.colors.charcoal} />
            <Text style={styles.secondaryButtonText}>Watch demo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.noCreditCard}>No credit card required</Text>
      </View>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <Text style={styles.socialProofLabel}>Trusted by professionals at</Text>
        <View style={styles.socialProofCompanies}>
          {['Google', 'McKinsey', 'Goldman Sachs', 'Meta'].map((company) => (
            <Text key={company} style={styles.companyName}>
              {company}
            </Text>
          ))}
        </View>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning that fits your life</Text>
        <Text style={styles.sectionSubtitle}>
          No more hour-long courses you never finish. Just scroll, watch, and get smarter.
        </Text>

        <View style={styles.features}>
          {[
            {
              icon: 'play-circle',
              color: theme.colors.coral,
              title: 'Scroll through videos',
              desc: 'Short, animated lessons you can watch anywhere. Like TikTok, but you actually learn something.',
            },
            {
              icon: 'bulb',
              color: theme.colors.sage,
              title: 'AI synthesizes for you',
              desc: 'We pull from news, research, and expert discussions. You get the insights without the noise.',
            },
            {
              icon: 'checkmark-circle',
              color: theme.colors.lavender,
              title: 'Actually remember it',
              desc: 'Flashcards and quizzes help you retain what you learn. Build real knowledge over time.',
            },
          ].map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={[feature.color, `${feature.color}80`]}
                style={styles.featureIcon}
              >
                <Ionicons name={feature.icon as any} size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Topics */}
      <View style={[styles.section, styles.topicsSection]}>
        <Text style={styles.sectionTitle}>What you'll learn</Text>
        <Text style={styles.sectionSubtitle}>
          The knowledge that helps you navigate work and life
        </Text>

        <View style={styles.topicsGrid}>
          {[
            { name: 'Technology', desc: 'AI, software, digital trends', color: theme.colors.coral },
            { name: 'Finance', desc: 'Markets, investing, money', color: theme.colors.sage },
            { name: 'Economics', desc: 'Policy, trade, macro trends', color: theme.colors.honey },
            { name: 'Culture', desc: 'Society, media, ideas', color: theme.colors.sky },
            { name: 'Influence', desc: 'Persuasion, leadership', color: theme.colors.lavender },
            { name: 'Global Events', desc: 'Geopolitics, world affairs', color: theme.colors.rose },
          ].map((topic) => (
            <View
              key={topic.name}
              style={[styles.topicCard, { backgroundColor: `${topic.color}10` }]}
            >
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicDesc}>{topic.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Differentiator */}
      <View style={styles.darkSection}>
        <Text style={styles.darkSectionTitle}>Not another course platform</Text>
        <View style={styles.checkmarks}>
          {[
            { title: '5 minutes, not 5 hours', desc: 'Bite-sized lessons that respect your time' },
            {
              title: 'Multi-source synthesis',
              desc: 'We combine multiple sources so you get the full picture',
            },
            {
              title: 'Built for retention',
              desc: 'Spaced repetition and quizzes help you actually remember',
            },
          ].map((item, index) => (
            <View key={index} style={styles.checkmarkItem}>
              <View style={styles.checkmarkIcon}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.checkmarkContent}>
                <Text style={styles.checkmarkTitle}>{item.title}</Text>
                <Text style={styles.checkmarkDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>93%</Text>
          <Text style={styles.statsDesc}>
            of users say they feel more informed after 2 weeks
          </Text>
        </View>
      </View>

      {/* Final CTA */}
      <View style={styles.finalCta}>
        <Text style={styles.finalCtaTitle}>Start getting smarter today</Text>
        <Text style={styles.finalCtaSubtitle}>
          Join thousands of professionals who spend 5 minutes a day building real knowledge.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Get started free</Text>
        </TouchableOpacity>
        <Text style={styles.noCreditCard}>Free forever. No credit card needed.</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.logo}>mindforge</Text>
        <Text style={styles.footerText}>Get smarter in 5 minutes a day</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  logo: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  signInText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
  },
  startButton: {
    backgroundColor: theme.colors.coral,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  startButtonText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  hero: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  logoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCardTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  logoCardSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  badge: {
    backgroundColor: `${theme.colors.coral}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.coral,
  },
  headline: {
    fontSize: 40,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    lineHeight: 48,
    marginBottom: theme.spacing.lg,
  },
  headlineHighlight: {
    color: theme.colors.coral,
  },
  subheadline: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.sizes.lg * 1.5,
    marginBottom: theme.spacing.xl,
  },
  ctaButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.coral,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: theme.colors.bgGradientDark,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
  },
  noCreditCard: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  socialProof: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  socialProofLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  socialProofCompanies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  companyName: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  features: {
    gap: theme.spacing.xl,
  },
  featureCard: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.md * 1.5,
  },
  topicsSection: {
    backgroundColor: theme.colors.cardBackgroundAlt,
  },
  topicsGrid: {
    gap: theme.spacing.md,
  },
  topicCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.soft,
  },
  topicName: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.xs,
  },
  topicDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  darkSection: {
    backgroundColor: theme.colors.charcoal,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
  },
  darkSectionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xl,
  },
  checkmarks: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  checkmarkItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  checkmarkIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContent: {
    flex: 1,
  },
  checkmarkTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  checkmarkDesc: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  statsNumber: {
    fontSize: 48,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.coral,
    marginBottom: theme.spacing.sm,
  },
  statsDesc: {
    fontSize: theme.typography.sizes.md,
    color: 'rgba(255,255,255,0.6)',
  },
  finalCta: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  finalCtaSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
});
