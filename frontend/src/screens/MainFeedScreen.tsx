import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    TextInput,
    Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import { SectionHeader } from '../components/SectionHeader';
import { BentoCard } from '../components/BentoCard';
import { apiService } from '../services/api';
import { Field, Lesson, DailyChallenge } from '../types';

const { width } = Dimensions.get('window');

const MainFeedScreen = ({ navigation }: { navigation: any }) => {
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);

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

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="mail" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="bell" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={24} color={theme.colors.text} />
                    </View>
                </View>
            </View>

            <Text style={styles.greeting}>Hello, Jason</Text>
            <Text style={styles.subGreeting}>help you reach your full potential</Text>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search your course...."
                    placeholderTextColor={theme.colors.textLight}
                />
            </View>
        </View>
    );

    const renderBanner = () => (
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.bannerContainer}>
            <LinearGradient
                colors={theme.gradients.banner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTag}>ONLINE COURSE</Text>
                    <Text style={styles.bannerTitle}>Sharpen Your Skills with Professional Online Courses</Text>

                    <TouchableOpacity style={styles.joinButton}>
                        <Text style={styles.joinButtonText}>Join Now</Text>
                        <Feather name="arrow-right" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                {/* Decorative shapes could go here */}
            </LinearGradient>
        </Animated.View>
    );

    const renderContinueWatching = () => {
        if (!recentLessons || recentLessons.length === 0) return null;

        return (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Continue Watching</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {recentLessons.map((lesson, index) => (
                        <BentoCard
                            key={lesson.id}
                            title={lesson.title}
                            subtitle={`${lesson.difficulty_level} • ${lesson.estimated_minutes} min`}
                            variant="course"
                            size="medium"
                            style={styles.courseCard}
                            imageGradient={index % 2 === 0 ? theme.gradients.primary : theme.gradients.secondary}
                            progress={Math.random() * 100} // Simulated progress
                            tag={lesson.difficulty_level}
                            icon={<Feather name="play" size={24} color="#FFFFFF" />}
                            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
                        />
                    ))}
                </ScrollView>
            </Animated.View>
        );
    };

    const renderStatistic = () => (
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Statistic</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statsHeader}>
                    <View style={styles.statsAvatarContainer}>
                        <Ionicons name="person" size={40} color={theme.colors.text} />
                        <View style={styles.statsBadge}>
                            <Text style={styles.statsBadgeText}>32%</Text>
                        </View>
                    </View>
                    <Text style={styles.statsGreeting}>Good Morning Jason 🔥</Text>
                    <Text style={styles.statsSubtext}>Continue your learning to achieve your target!</Text>
                </View>

                <View style={styles.chartContainer}>
                    {/* Simplified Bar Chart Representation */}
                    {[40, 65, 30, 85, 25].map((height, index) => (
                        <View key={index} style={styles.chartBarContainer}>
                            <View style={[styles.chartBar, { height: `${height}%`, backgroundColor: index === 3 ? theme.colors.primary : theme.colors.primary + '40' }]} />
                            <Text style={styles.chartLabel}>Day {index + 1}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );

    const getVibrantColor = (index: number) => {
        const colors = [
            theme.colors.vintage.navy,
            theme.colors.vintage.sage,
            theme.colors.vintage.terracotta,
            theme.colors.vintage.sand,
            theme.colors.vintage.lavender,
            theme.colors.vintage.slate,
        ];
        return colors[index % colors.length];
    };

    const renderVibrantFields = () => {
        if (!fields || fields.length === 0) return null;

        return (
            <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Explore Fields</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {fields.map((field, index) => (
                        <BentoCard
                            key={field.id}
                            title={field.name}
                            subtitle={`${field.total_lessons} lessons`}
                            variant="vibrant"
                            size="small"
                            style={[styles.vibrantCard, { backgroundColor: getVibrantColor(index) }]}
                            icon={<Ionicons name={getFieldIcon(field.name)} size={24} color="#FFFFFF" />}
                            onPress={() => navigation.navigate('Learn', { fieldId: field.id })}
                        />
                    ))}
                </ScrollView>
            </Animated.View>
        );
    };

    const renderDailyChallenge = () => {
        if (!dailyChallenge) return null;

        return (
            <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.section}>
                <BentoCard
                    title="Daily Challenge"
                    subtitle={dailyChallenge.title}
                    variant="vibrant"
                    size="medium"
                    style={[styles.dailyChallengeCard, { backgroundColor: theme.colors.vintage.terracotta }]}
                    icon={<Ionicons name="flash" size={32} color="#FFFFFF" />}
                    onPress={() => navigation.navigate('DailyChallenge')}
                >
                    <View style={styles.challengeBadge}>
                        <Text style={styles.challengeBadgeText}>4 Unread</Text>
                    </View>
                </BentoCard>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderHeader()}
                {renderBanner()}
                {renderVibrantFields()}
                {renderDailyChallenge()}

                {/* Quick Access Pills */}
                <View style={styles.pillsContainer}>
                    <TouchableOpacity style={styles.pill}>
                        <Text style={styles.pillText}>UI/UX Design</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pill}>
                        <Text style={styles.pillText}>Branding</Text>
                    </TouchableOpacity>
                </View>

                {renderContinueWatching()}
                {renderStatistic()}
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greeting: {
        fontFamily: theme.typography.fontFamily.serifBold,
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subGreeting: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        marginBottom: theme.spacing.lg,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.searchBackground,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing.md,
        height: 50,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
    },
    bannerContainer: {
        marginBottom: theme.spacing.xl,
    },
    banner: {
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        minHeight: 180,
        justifyContent: 'center',
    },
    bannerContent: {
        maxWidth: '70%',
    },
    bannerTag: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: theme.spacing.xs,
        letterSpacing: 1,
    },
    bannerTitle: {
        fontFamily: theme.typography.fontFamily.serifBold,
        fontSize: theme.typography.sizes.xl,
        color: '#FFFFFF',
        marginBottom: theme.spacing.lg,
        lineHeight: 28,
    },
    joinButton: {
        backgroundColor: '#000000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
        gap: 8,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
    },
    pillsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    pill: {
        backgroundColor: theme.colors.cardBackground,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.soft,
    },
    pillText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
    },
    seeAllText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primary,
    },
    horizontalScroll: {
        paddingRight: theme.spacing.lg,
    },
    courseCard: {
        width: 240,
        marginRight: theme.spacing.md,
    },
    statsCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        ...theme.shadows.soft,
    },
    statsHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    statsAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        position: 'relative',
    },
    statsBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: theme.typography.fontFamily.bold,
    },
    statsGreeting: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    statsSubtext: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        paddingTop: theme.spacing.lg,
    },
    chartBarContainer: {
        alignItems: 'center',
        gap: theme.spacing.xs,
        flex: 1,
    },
    chartBar: {
        width: 30,
        borderRadius: theme.borderRadius.sm,
    },
    chartLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 10,
        color: theme.colors.textLight,
    },
    vibrantCard: {
        width: 140,
        height: 140,
        marginRight: theme.spacing.md,
        justifyContent: 'space-between',
    },
    dailyChallengeCard: {
        marginBottom: theme.spacing.md,
    },
    challengeBadge: {
        position: 'absolute',
        bottom: theme.spacing.lg,
        left: theme.spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    challengeBadgeText: {
        color: '#FFFFFF',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 12,
    },
});

export default MainFeedScreen;
