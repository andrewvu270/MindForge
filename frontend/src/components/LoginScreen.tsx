import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onForgotPassword,
  onCreateAccount,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonScale = new Animated.Value(1);

  const handleLogin = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onLogin) {
      onLogin(email, password);
    }
  };

  const RocketIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Rocket */}
      <View style={styles.rocket}>
        <View style={styles.rocketBody}>
          <View style={styles.rocketWindow} />
        </View>
        <View style={styles.rocketFinLeft} />
        <View style={styles.rocketFinRight} />
        <View style={styles.rocketFlame}>
          <View style={[styles.flame, styles.flame1]} />
          <View style={[styles.flame, styles.flame2]} />
          <View style={[styles.flame, styles.flame3]} />
        </View>
      </View>
      
      {/* Clouds */}
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />
      <View style={[styles.cloud, styles.cloud3]} />
      <View style={[styles.cloud, styles.cloud4]} />
      
      {/* Stars */}
      <View style={[styles.star, styles.star1]} />
      <View style={[styles.star, styles.star2]} />
      <View style={[styles.star, styles.star3]} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.clay.blue, theme.colors.clay.mint]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration */}
          <View style={styles.illustrationWrapper}>
            <RocketIllustration />
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.greeting}>Hello, Stranger!</Text>
            <Text style={styles.subtitle}>Let's sign you in</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username or email"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotContainer} onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot the password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={[styles.signInButton, isPressed && styles.signInButtonPressed]}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.clay.teal, theme.colors.clay.blue]}
                  style={styles.signInButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Create Account */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onCreateAccount}>
                <Text style={styles.createAccountLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    minHeight: height,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.xxxl,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  rocket: {
    position: 'absolute',
    top: 50,
    left: 75,
    transform: [{ rotate: '-45deg' }],
  },
  rocketBody: {
    width: 50,
    height: 80,
    backgroundColor: theme.colors.clay.red,
    borderRadius: 25,
    position: 'relative',
  },
  rocketWindow: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.clay.blue,
    borderRadius: 10,
    position: 'absolute',
    top: 15,
    left: 15,
  },
  rocketFinLeft: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderLeftColor: 'transparent',
    borderRightWidth: 0,
    borderRightColor: 'transparent',
    borderTopWidth: 25,
    borderTopColor: theme.colors.clay.red,
    position: 'absolute',
    bottom: 0,
    left: -10,
  },
  rocketFinRight: {
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
    borderRightWidth: 15,
    borderRightColor: 'transparent',
    borderTopWidth: 25,
    borderTopColor: theme.colors.clay.red,
    position: 'absolute',
    bottom: 0,
    right: -10,
  },
  rocketFlame: {
    position: 'absolute',
    bottom: -30,
    left: 10,
  },
  flame: {
    position: 'absolute',
    borderRadius: 10,
  },
  flame1: {
    width: 10,
    height: 25,
    backgroundColor: theme.colors.clay.yellow,
    left: 5,
  },
  flame2: {
    width: 15,
    height: 20,
    backgroundColor: theme.colors.clay.pink,
    left: 0,
    top: 5,
  },
  flame3: {
    width: 12,
    height: 18,
    backgroundColor: theme.colors.vintage.orange,
    left: 8,
    top: 8,
  },
  cloud: {
    width: 40,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    position: 'absolute',
  },
  cloud1: {
    top: 20,
    left: 10,
    width: 30,
    height: 15,
  },
  cloud2: {
    top: 40,
    right: 20,
    width: 35,
    height: 18,
  },
  cloud3: {
    bottom: 30,
    left: 30,
    width: 25,
    height: 12,
  },
  cloud4: {
    bottom: 50,
    right: 10,
    width: 32,
    height: 16,
  },
  star: {
    width: 4,
    height: 4,
    backgroundColor: theme.colors.clay.yellow,
    borderRadius: 2,
    position: 'absolute',
  },
  star1: {
    top: 10,
    right: 30,
  },
  star2: {
    top: 60,
    left: 20,
  },
  star3: {
    bottom: 20,
    right: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...theme.shadows.clay,
  },
  greeting: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.regular,
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.clay.teal,
  },
  signInButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  signInButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  signInButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.cardBackground,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLight,
  },
  createAccountLink: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.clay.teal,
  },
});
