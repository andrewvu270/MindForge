import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import ClaymorphismCard from '../components/ClaymorphismCard';
import ClaymorphismButton from '../components/ClaymorphismButton';

const { width, height } = Dimensions.get('window');

const ClaymorphismDashboard = ({ navigation }: { navigation: any }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const scrollY = useRef(new Animated.Value(0)).current;

    const categories = [
        { id: 'all', name: 'All', icon: 'grid-outline' },
        { id: 'trending', name: 'Trending', icon: 'flame-outline' },
        { id: 'new', name: 'New', icon: 'add-circle-outline' },
    ];

    const learningFields = [
        {
            id: 'tech',
            name: 'Technology',
            description: 'Latest in tech and AI',
            icon: 'hardware-chip-outline',
            color: '#FF6B6B',
            lessons: 62,
            progress: 73,
        },
        {
            id: 'finance',
            name: 'Finance',
            description: 'Markets and investing',
            icon: 'trending-up-outline',
            color: '#4ECDC4',
            lessons: 45,
            progress: 58,
        },
        {
            id: 'economics',
            name: 'Economics',
            description: 'Economic principles',
            icon: 'cash-outline',
            color: '#FFE66D',
            lessons: 38,
            progress: 42,
        },
        {
            id: 'culture',
            name: 'Culture',
            description: 'Arts and society',
            icon: 'globe-outline',
            color: '#45B7D1',
            lessons: 28,
            progress: 85,
        },
        {
            id: 'influence',
            name: 'Influence',
            description: 'Persuasion skills',
            icon: 'bulb-outline',
            color: '#95E1D3',
            lessons: 33,
            progress: 67,
        },
        {
            id: 'global',
            name: 'Global Events',
            description: 'World affairs',
            icon: 'earth-outline',
            color: '#F38181',
            lessons: 41,
            progress: 31,
        },
    ];

    const stats = [
        { label: 'Total Lessons', value: '247', icon: 'book-outline', color: '#FF6B6B' },
        { label: 'Completed', value: '62%', icon: 'checkmark-circle-outline', color: '#4ECDC4' },
        { label: 'Streak', value: '12', icon: 'flame-outline', color: '#FFE66D' },
        { label: 'Rank', value: '#2', icon: 'ribbon-outline', color: '#45B7D1' },
    ];

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    const renderHeader = () => (
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerContent}>
                <Text style={styles.title}>Learning Fields</Text>
                <Text style={styles.subtitle}>Choose your area of focus</Text>
            </View>
            
            {/* Floating clay elements */}
            <View style={styles.floatingElements}>
                <ClaymorphismCard
                    icon="star"
                    color="#FFE66D"
                    size="small"
                    shadowIntensity="light"
                    style={styles.floatingCard}
                />
                <ClaymorphismCard
                    icon="heart"
                    color="#FF6B6B"
                    size="small"
                    shadowIntensity="light"
                    style={styles.floatingCard}
                />
                <ClaymorphismCard
                    icon="rocket"
                    color="#4ECDC4"
                    size="small"
                    shadowIntensity="light"
                    style={styles.floatingCard}
                />
            </View>
        </Animated.View>
    );

    const renderCategories = () => (
        <View style={styles.categoriesContainer}>
            {categories.map((category) => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.categoryChip,
                        selectedCategory === category.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                >
                    <View style={styles.categoryIcon}>
                        <Ionicons 
                            name={category.icon as any} 
                            size={16} 
                            color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.textLight} 
                        />
                    </View>
                    <Text style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.categoryTextActive,
                    ]}>
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <ClaymorphismCard
                        key={stat.label}
                        title={stat.value}
                        subtitle={stat.label}
                        icon={stat.icon}
                        color={stat.color}
                        size="small"
                        shadowIntensity="medium"
                        style={styles.statCard}
                    />
                ))}
            </View>
        </View>
    );

    const renderLearningField = (field: any) => (
        <ClaymorphismCard
            key={field.id}
            title={field.name}
            subtitle={`${field.lessons} lessons • ${field.progress}% complete`}
            icon={field.icon}
            color={field.color}
            size="large"
            shadowIntensity="medium"
            style={styles.fieldCard}
            onPress={() => navigation.navigate('Lessons', { fieldId: field.id })}
        />
    );

    const renderFeaturedSection = () => {
        const featured = learningFields.find(f => f.progress >= 70) || learningFields[0];
        
        return (
            <View style={styles.featuredContainer}>
                <Text style={styles.sectionTitle}>Featured Field</Text>
                <ClaymorphismCard
                    title={featured.name}
                    subtitle={featured.description}
                    icon={featured.icon}
                    color={featured.color}
                    size="large"
                    shadowIntensity="heavy"
                    style={styles.featuredCard}
                    onPress={() => navigation.navigate('Lessons', { fieldId: featured.id })}
                >
                    <View style={styles.featuredProgress}>
                        <Text style={styles.featuredProgressText}>{featured.progress}% Complete</Text>
                        <View style={styles.featuredProgressBar}>
                            <View 
                                style={[
                                    styles.featuredProgressFill,
                                    { width: `${featured.progress}%`, backgroundColor: featured.color }
                                ]} 
                            />
                        </View>
                    </View>
                </ClaymorphismCard>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Background gradient */}
            <LinearGradient
                colors={['#FFE5E5', '#E8F4FD', '#E5F5E3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />
            
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {renderHeader()}
                {renderCategories()}
                {renderStats()}
                {renderFeaturedSection()}

                <Text style={styles.sectionTitle}>All Fields</Text>
                <View style={styles.fieldsGrid}>
                    {learningFields.map(renderLearningField)}
                </View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingTop: 80,
    },
    header: {
        marginBottom: 24,
    },
    headerContent: {
        marginBottom: 20,
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: 32,
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.textLight,
    },
    floatingElements: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
    },
    floatingCard: {
        transform: [{ rotate: '5deg' }],
    },
    categoriesContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    categoryChipActive: {
        backgroundColor: '#4ECDC440',
        borderColor: '#4ECDC4',
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.textLight,
    },
    categoryTextActive: {
        color: '#4ECDC4',
    },
    statsContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: 24,
        color: theme.colors.text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    statCard: {
        marginBottom: 0,
    },
    featuredContainer: {
        marginBottom: 32,
    },
    featuredCard: {
        marginBottom: 0,
    },
    featuredProgress: {
        marginTop: 12,
    },
    featuredProgressText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        color: theme.colors.textLight,
        marginBottom: 4,
    },
    featuredProgressBar: {
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    featuredProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    fieldsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    fieldCard: {
        marginBottom: 0,
    },
});

export default ClaymorphismDashboard;
