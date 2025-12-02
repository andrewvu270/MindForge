import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    TextInput,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState('');
    
    const emailAnim = useRef(new Animated.Value(0)).current;
    const passwordAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = (field: string) => {
        setIsFocused(field);
        const anim = field === 'email' ? emailAnim : passwordAnim;
        Animated.timing(anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = (field: string) => {
        setIsFocused('');
        const anim = field === 'email' ? emailAnim : passwordAnim;
        Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleLogin = () => {
        // Handle login logic here
        navigation.navigate('MainApp');
    };

    const renderIllustration = () => (
        <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
                <View style={styles.innerCircle}>
                    <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="school-outline" size={50} color="#FFFFFF" />
                    </LinearGradient>
                </View>
                <View style={[styles.floatingDot, styles.dot1]} />
                <View style={[styles.floatingDot, styles.dot2]} />
                <View style={[styles.floatingDot, styles.dot3]} />
            </View>
        </View>
    );

    const renderForm = () => {
        const emailBorderColor = emailAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.colors.border, theme.colors.primary],
        });
        
        const passwordBorderColor = passwordAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.colors.border, theme.colors.primary],
        });

        return (
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Continue your learning journey</Text>
                
                <View style={styles.inputContainer}>
                    <Animated.View style={[styles.inputWrapper, { borderColor: emailBorderColor }]}>
                        <Ionicons 
                            name="mail-outline" 
                            size={20} 
                            color={isFocused === 'email' ? theme.colors.primary : theme.colors.textLight} 
                            style={styles.inputIcon} 
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Email address"
                            placeholderTextColor={theme.colors.textLight}
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Animated.View>
                    
                    <Animated.View style={[styles.inputWrapper, { borderColor: passwordBorderColor }]}>
                        <Ionicons 
                            name="lock-closed-outline" 
                            size={20} 
                            color={isFocused === 'password' ? theme.colors.primary : theme.colors.textLight} 
                            style={styles.inputIcon} 
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Password"
                            placeholderTextColor={theme.colors.textLight}
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => handleFocus('password')}
                            onBlur={() => handleBlur('password')}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons 
                                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                size={20} 
                                color={theme.colors.textLight} 
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <TouchableOpacity style={styles.forgotButton}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginButtonGradient}
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>New to MindForge?</Text>
                    <TouchableOpacity>
                        <Text style={styles.signupLink}> Create account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            
            <LinearGradient
                colors={['#F8FAFC', '#E8F4FD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
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
    backgroundGradient: {
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    iconGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingDot: {
        position: 'absolute',
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    dot1: {
        width: 12,
        height: 12,
        top: -10,
        right: 20,
    },
    dot2: {
        width: 8,
        height: 8,
        bottom: 20,
        left: -5,
    },
    dot3: {
        width: 6,
        height: 6,
        top: 30,
        left: 15,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: height * 0.15,
        justifyContent: 'center',
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: theme.typography.sizes.xxxl,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 2,
        height: 56,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputIcon: {
        marginRight: theme.spacing.sm,
    },
    textInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        height: '100%',
    },
    eyeIcon: {
        marginLeft: theme.spacing.sm,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.xl,
    },
    forgotText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primary,
    },
    loginButton: {
        alignSelf: 'center',
        borderRadius: theme.borderRadius.xl,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: theme.spacing.xl,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xxxl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
        minWidth: width * 0.8,
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    loginButtonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: '#FFFFFF',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
    signupLink: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primary,
    },
});

export default LoginScreen;
