import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import ClaymorphismCard from '../components/ClaymorphismCard';
import ClaymorphismButton from '../components/ClaymorphismButton';
import ClaymorphismInput from '../components/ClaymorphismInput';

const { width, height } = Dimensions.get('window');

const ClaymorphismLogin = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    
    const illustrationAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(illustrationAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = () => {
        // Handle login logic here
        navigation.navigate('MainApp');
    };

    const renderIllustration = () => (
        <Animated.View
            style={[
                styles.illustrationContainer,
                {
                    opacity: illustrationAnim,
                    transform: [
                        {
                            translateY: illustrationAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        },
                        {
                            scale: illustrationAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.illustrationCircle}>
                <LinearGradient
                    colors={['#FF6B6B80', '#FF6B6B40']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.illustrationGradient}
                >
                    <Ionicons name="school-outline" size={50} color="#FFFFFF" />
                </LinearGradient>
                
                {/* Floating clay elements */}
                <Animated.View
                    style={[
                        styles.floatingCard,
                        styles.card1,
                        {
                            transform: [
                                {
                                    rotate: illustrationAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '15deg'],
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
                        styles.floatingCard,
                        styles.card2,
                        {
                            transform: [
                                {
                                    rotate: illustrationAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '-10deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <ClaymorphismCard
                        icon="heart"
                        color="#4ECDC4"
                        size="small"
                        shadowIntensity="light"
                    />
                </Animated.View>
                
                <Animated.View
                    style={[
                        styles.floatingCard,
                        styles.card3,
                        {
                            transform: [
                                {
                                    translateY: illustrationAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <ClaymorphismCard
                        icon="rocket"
                        color="#45B7D1"
                        size="small"
                        shadowIntensity="light"
                    />
                </Animated.View>
            </View>
        </Animated.View>
    );

    const renderForm = () => (
        <Animated.View
            style={[
                styles.formContainer,
                {
                    opacity: cardAnim,
                    transform: [
                        {
                            translateY: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Continue your learning journey</Text>
            
            <View style={styles.inputsContainer}>
                <ClaymorphismInput
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    color="#4ECDC4"
                />
                
                <ClaymorphismInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock-closed-outline"
                    secureTextEntry={!showPassword}
                    color="#45B7D1"
                />
            </View>

            <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <ClaymorphismButton
                title="Sign In"
                onPress={handleLogin}
                icon="log-in-outline"
                color="#FF6B6B"
                size="large"
                style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>New to MindForge?</Text>
                <TouchableOpacity>
                    <Text style={styles.signupLink}> Create account</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Background gradient */}
            <LinearGradient
                colors={['#FFE5E5', '#E8F4FD', '#E5F5E3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />
            
            {renderIllustration()}
            {renderForm()}
        </KeyboardAvoidingView>
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
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height * 0.1,
    },
    illustrationCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        position: 'relative',
    },
    illustrationGradient: {
        flex: 1,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    floatingCard: {
        position: 'absolute',
    },
    card1: {
        top: -20,
        right: -40,
    },
    card2: {
        bottom: -15,
        left: -35,
    },
    card3: {
        top: 25,
        right: -45,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: height * 0.15,
        justifyContent: 'center',
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: 32,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginBottom: 32,
    },
    inputsContainer: {
        marginBottom: 24,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: '#4ECDC4',
    },
    loginButton: {
        marginBottom: 32,
        alignSelf: 'center',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    signupText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.textLight,
    },
    signupLink: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        color: '#FF6B6B',
    },
});

export default ClaymorphismLogin;
