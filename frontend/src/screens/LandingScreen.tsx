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

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }: { navigation: any }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    
    const pages = [
        {
            title: "Learn Anything",
            subtitle: "Micro-lessons designed for busy minds",
            description: "Master new skills in just 5 minutes a day with bite-sized lessons that fit your schedule.",
            features: ["5-minute lessons", "Personalized learning", "Track progress"],
            gradient: theme.gradients.primary,
        },
        {
            title: "Grow Together",
            subtitle: "Join a community of learners",
            description: "Connect with peers, share insights, and accelerate your learning journey together.",
            features: ["Community challenges", "Peer learning", "Expert mentors"],
            gradient: theme.gradients.secondary,
        },
        {
            title: "Achieve More",
            subtitle: "Reach your full potential",
            description: "Build lasting knowledge with our proven micro-learning methodology.",
            features: ["Certified courses", "Real-world projects", "Career advancement"],
            gradient: theme.gradients.banner,
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
            navigation.navigate('Login');
        }
    };

    const handleSkip = () => {
        navigation.navigate('Login');
    };

    const renderPage = (page: any, index: number) => (
        <View key={index} style={[styles.page, { width }]}>
            <View style={styles.content}>
                <View style={styles.illustration}>
                    <View style={styles.circle}>
                        <View style={styles.innerCircle}>
                            <Ionicons name="school-outline" size={60} color="#FFFFFF" />
                        </View>
                        <View style={[styles.orbit, styles.orbit1]} />
                        <View style={[styles.orbit, styles.orbit2]} />
                    </View>
                </View>

                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.subtitle}>{page.subtitle}</Text>
                <Text style={styles.description}>{page.description}</Text>

                <View style={styles.features}>
                    {page.features.map((feature: string, idx: number) => (
                        <View key={idx} style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

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
            
            <LinearGradient
                colors={pages[currentPage].gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

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

            <View style={styles.bottomContainer}>
                {renderPagination()}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={styles.nextText}>
                            {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons 
                            name={currentPage === pages.length - 1 ? "checkmark" : "arrow-forward"} 
                            size={20} 
                            color="#FFFFFF" 
                        />
                    </LinearGradient>
                </TouchableOpacity>
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
        color: 'rgba(255,255,255,0.8)',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
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
    illustration: {
        marginBottom: height * 0.08,
    },
    circle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbit: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 100,
    },
    orbit1: {
        width: 180,
        height: 180,
        top: -15,
        left: -15,
    },
    orbit2: {
        width: 200,
        height: 200,
        top: -25,
        left: -25,
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: theme.typography.sizes.xxxl,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    description: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    features: {
        gap: theme.spacing.sm,
        width: '100%',
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    featureText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(255,255,255,0.9)',
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
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
        width: 24,
    },
    nextButton: {
        alignSelf: 'center',
        borderRadius: theme.borderRadius.full,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xxl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        gap: theme.spacing.sm,
    },
    nextText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: '#FFFFFF',
    },
});

export default LandingScreen;
