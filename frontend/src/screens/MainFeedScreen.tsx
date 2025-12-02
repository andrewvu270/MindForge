import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import { SectionHeader } from '../components/SectionHeader';
import { BentoCard } from '../components/BentoCard';
import { apiService } from '../services/api';
import { Field, Lesson, DailyChallenge } from '../types';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const MainFeedScreen = ({ navigation }: { navigation: any }) => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);

    const scrollY = useSharedValue(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [fieldsData, lessonsData, challengeData] = await Promise.all([
                apiService.getFields(),
                apiService.getLessons(),
                apiService.getDailyChallenge()
            ]);

            setFields(fieldsData);
            setRecentLessons(lessonsData.slice(0, 5));
            setDailyChallenge(challengeData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
            [1, 0.5, 0],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -HEADER_HEIGHT / 2],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    const renderHeroSection = () => (
        <Animated.View style={[styles.heroSection, headerAnimatedStyle]}>
            <LinearGradient
                colors={theme.gradients.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                <View style={styles.heroContent}>
                    <Text style={styles.heroGreeting}>Good morning</Text>
                    <Text style={styles.heroTitle}>Ready to learn?</Text>
                    <Text style={styles.heroSubtitle}>Continue your journey</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    const renderDailyChallenge = () => {
        if (!dailyChallenge || !dailyChallenge.title || !dailyChallenge.description) return null;

        return (
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                <SectionHeader title="Today's Challenge" size="medium" />
                <TouchableOpacity
                    onPress={() => navigation.navigate('DailyChallenge')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#F9FAFB']}
                        style={styles.challengeCard}
                    >
                        <View style={styles.challengeHeader}>
                            <View style={styles.challengeIconContainer}>
                                <Ionicons name="flash" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.challengeInfo}>
                                <Text style={styles.challengeTitle}>{dailyChallenge.title || ''}</Text>
                                <Text style={styles.challengeSubtitle} numberOfLines={2}>
                                    {dailyChallenge.description || ''}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.challengeMeta}>
                            <View style={styles.metaItem}>
                                <Feather name="book-open" size={14} color={theme.colors.textLight} />
                                <Text style={styles.metaText}>{dailyChallenge.lesson_ids?.length || 0} lessons</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Feather name="target" size={14} color={theme.colors.textLight} />
                                <Text style={styles.metaText}>{dailyChallenge.difficulty_level || 'intermediate'}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderFieldsSection = () => {
        if (!fields || fields.length === 0) return null;
        
        return (
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                <SectionHeader title="Explore Fields" size="medium" />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.fieldsScroll}
                >
                    {fields.map((field, index) => (
                        <TouchableOpacity
                            key={field.id}
                            style={styles.fieldCard}
                            onPress={() => navigation.navigate('Learn', { fieldId: field.id })}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={theme.gradients.card}
                                style={styles.fieldGradient}
                            >
                                <View style={styles.fieldIconContainer}>
                                    <Ionicons
                                        name={getFieldIcon(field.name)}
                                        size={32}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <Text style={styles.fieldName}>{field.name || ''}</Text>
                                <Text style={styles.fieldCount}>{field.total_lessons || 0} lessons</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        );
    };

    const renderRecentLessons = () => {
        if (!recentLessons || recentLessons.length === 0) return null;
        
        return (
            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                <SectionHeader title="Continue Learning" size="medium" />
                {recentLessons.map((lesson, index) => (
                    <Animated.View
                        key={lesson.id}
                        entering={FadeInDown.delay(350 + index * 50).duration(600)}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
                            activeOpacity={0.9}
                        >
                            <View style={styles.lessonCard}>
                                <View style={styles.lessonIconContainer}>
                                    <Feather name="book" size={20} color={theme.colors.primary} />
                                </View>
                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonTitle}>{lesson.title || ''}</Text>
                                    <Text style={styles.lessonMeta}>
                                        {lesson.estimated_minutes || 0} min • {lesson.difficulty_level || 'beginner'}
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={theme.colors.textLight} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </Animated.View>
        );
    };

    const renderQuickStats = () => (
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <SectionHeader title="Your Progress" size="medium" />
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Feather name="check-circle" size={24} color={theme.colors.success} />
                    <Text style={styles.statNumber}>127</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Feather name="trending-up" size={24} color={theme.colors.primary} />
                    <Text style={styles.statNumber}>84%</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </View>
                <View style={styles.statCard}>
                    <Feather name="zap" size={24} color={theme.colors.warning} />
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            {renderHeroSection()}
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <View style={styles.content}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : (
                        <>
                            {renderDailyChallenge()}
                            {renderFieldsSection()}
                            {renderRecentLessons()}
                            {renderQuickStats()}
                        </>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
};

const getFieldIcon = (fieldName: string): any => {
    const iconMap: Record<string, any> = {
        'Technology': 'hardware-chip-outline',
        'Finance': 'trending-up-outline',
        'Economics': 'cash-outline',
        'Culture': 'globe-outline',
        'Influence Skills': 'bulb-outline',
        'Global Events': 'earth-outline',
    };
    return iconMap[fieldName] || 'book-outline';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    heroSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        zIndex: 1,
    },
    heroGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.lg,
    },
    heroContent: {
        marginTop: 40,
    },
    heroGreeting: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.lg,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: theme.spacing.xs,
    },
    heroTitle: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: theme.typography.sizes.display,
        color: '#FFFFFF',
        marginBottom: theme.spacing.sm,
        lineHeight: theme.typography.sizes.display * theme.typography.lineHeights.tight,
    },
    heroSubtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.xl,
        color: 'rgba(255,255,255,0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: HEADER_HEIGHT - 40,
    },
    content: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xxl,
        borderTopRightRadius: theme.borderRadius.xxl,
        padding: theme.spacing.lg,
        minHeight: height,
    },
    loadingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: theme.spacing.xl,
    },
    challengeCard: {
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xxl,
        ...theme.shadows.medium,
    },
    challengeHeader: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    challengeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    challengeInfo: {
        flex: 1,
    },
    challengeTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    challengeSubtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.normal,
    },
    challengeMeta: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    metaText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
    fieldsScroll: {
        paddingRight: theme.spacing.lg,
        marginBottom: theme.spacing.xxl,
    },
    fieldCard: {
        marginRight: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.soft,
    },
    fieldGradient: {
        width: 160,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    fieldIconContainer: {
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    fieldName: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    fieldCount: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.soft,
    },
    lessonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        marginBottom: 2,
    },
    lessonMeta: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xxl,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    statNumber: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
});

export default MainFeedScreen;
