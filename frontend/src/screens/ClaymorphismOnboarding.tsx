import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import ClaymorphismCard from '../components/ClaymorphismCard';
import ClaymorphismButton from '../components/ClaymorphismButton';

const { width, height } = Dimensions.get('window');

const ClaymorphismOnboarding = ({ navigation }: { navigation: any }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    
    const pages = [
        {
            title: "Welcome to MindForge",
            subtitle: "Learn in 3D Style",
            description: "Experience micro-learning with beautiful claymorphism design that makes learning fun and engaging.",
            illustration: 'school',
            color: '#FF6B6B',
            features: ["5-minute lessons", "Beautiful design", "Track progress"],
        },
        {
            title: "Learn Anything",
            subtitle: "6 Learning Fields",
            description: "From technology to culture, master new skills with our carefully crafted micro-lessons.",
            illustration: 'library',
            color: '#4ECDC4',
            features: ["6 fields", "Expert content", "Practical skills"],
        },
        {
            title: "Grow Together",
            subtitle: "Community Learning",
            description: "Join a vibrant community of learners, share insights, and accelerate your growth together.",
            illustration: 'people',
            color: '#45B7D1',
            features: ["Community", "Challenges", "Achievements"],
        },
    ];

    const scrollToPage = (pageIndex: number) => {
        setCurrentPage(pageIndex);
        scrollRef.current?.scrollTo({ x: pageIndex * width, animated: true });
    };

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            scrollToPage(currentPage + 1);
        } else {
            navigation.navigate('ClaymorphismLogin');
        }
    };

    const renderPage = (page: any, index: number) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(50)).current;

        React.useEffect(() => {
            if (currentPage === index) {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }, [currentPage, index]);

        return (
            <View key={index} style={[styles.page, { width }]}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* 3D Claymorphism Illustration */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.mainCircle}>
                            <LinearGradient
                                colors={[page.color + '80', page.color + '40']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.mainCircleGradient}
                            >
                                <Ionicons name={page.illustration as any} size={60} color="#FFFFFF" />
                            </LinearGradient>
                            
                            {/* Floating elements */}
                            <Animated.View
                                style={[
                                    styles.floatingElement,
                                    styles.element1,
                                    {
                                        transform: [
                                            {
                                                rotate: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '360deg'],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <ClaymorphismCard
                                    icon="star"
                                    color="#FFE66D"
                                    size="small"
                                    shadowIntensity="light"
                                />
                            </Animated.View>
                            
                            <Animated.View
                                style={[
                                    styles.floatingElement,
                                    styles.element2,
                                    {
                                        transform: [
                                            {
                                                scale: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.8, 1],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <ClaymorphismCard
                                    icon="heart"
                                    color="#FF6B6B"
                                    size="small"
                                    shadowIntensity="light"
                                />
                            </Animated.View>
                            
                            <Animated.View
                                style={[
                                    styles.floatingElement,
                                    styles.element3,
                                    {
                                        transform: [
                                            {
                                                translateY: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [20, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <ClaymorphismCard
                                    icon="rocket"
                                    color="#4ECDC4"
                                    size="small"
                                    shadowIntensity="light"
                                />
                            </Animated.View>
                        </View>
                    </View>

                    <Text style={styles.title}>{page.title}</Text>
                    <Text style={styles.subtitle}>{page.subtitle}</Text>
                    <Text style={styles.description}>{page.description}</Text>

                    <View style={styles.features}>
                        {page.features.map((feature: string, idx: number) => (
                            <View key={idx} style={styles.feature}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="checkmark-circle" size={16} color={page.color} />
                                </View>
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </View>
        );
    };

    const renderPagination = () => (
        <View style={styles.pagination}>
            {pages.map((_, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.dot,
                        index === currentPage && styles.dotActive,
                    ]}
                    onPress={() => scrollToPage(index)}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Background with gradient */}
            <LinearGradient
                colors={['#FFE5E5', '#E8F4FD', '#E5F5E3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />
            
            {/* Skip button */}
            <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('ClaymorphismLogin')}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Pages */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentPage(pageIndex);
                }}
                style={styles.scrollView}
            >
                {pages.map((page, index) => renderPage(page, index))}
            </ScrollView>

            {/* Bottom controls */}
            <View style={styles.bottomContainer}>
                {renderPagination()}
                <ClaymorphismButton
                    title={currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
                    onPress={handleNext}
                    icon={currentPage === pages.length - 1 ? "checkmark" : "arrow-forward"}
                    color={pages[currentPage].color}
                    size="large"
                />
            </View>
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
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 1,
    },
    skipText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.textLight,
    },
    scrollView: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
    },
    illustrationContainer: {
        marginBottom: height * 0.08,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    mainCircleGradient: {
        flex: 1,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    floatingElement: {
        position: 'absolute',
    },
    element1: {
        top: -20,
        right: -30,
    },
    element2: {
        bottom: -10,
        left: -25,
    },
    element3: {
        top: 20,
        right: -40,
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: 32,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    features: {
        gap: 12,
        width: '100%',
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    featureText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.text,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: height * 0.08,
        left: 0,
        right: 0,
        paddingHorizontal: theme.spacing.xl,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dotActive: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
});

export default ClaymorphismOnboarding;
