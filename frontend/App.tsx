import React, { useCallback, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

// Screens matching frontendweb pages exactly
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import LearnScreen from './src/screens/LearnScreen';
import LearnReadScreen from './src/screens/LearnReadScreen';
import LearnVideoScreen from './src/screens/LearnVideoScreen';
import QuizScreen from './src/screens/QuizScreen';
import FrankensteinGeneratorScreen from './src/screens/FrankensteinGeneratorScreen';
import ReflectionScreen from './src/screens/ReflectionScreen';
import ReflectionHistoryScreen from './src/screens/ReflectionHistoryScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import FeedScreen from './src/screens/FeedScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import CurriculumScreen from './src/screens/CurriculumScreen';

import { theme } from './src/theme';
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    // Check for existing session
    AsyncStorage.getItem('mindforge_user')
      .then((stored) => {
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            AsyncStorage.removeItem('mindforge_user');
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !loading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return null;
  }

  const handleLogin = (userData: any) => {
    setUser(userData);
    AsyncStorage.setItem('mindforge_user', JSON.stringify(userData));
  };

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.cardBackground,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.secondary,
          },
        }}
      >
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background }
          }}
        >
          {/* Public routes */}
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>

          {/* Protected routes - matching frontendweb exactly */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Lessons" component={LessonsScreen} />
          <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="LearnRead" component={LearnReadScreen} />
          <Stack.Screen name="LearnVideo" component={LearnVideoScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Generate" component={FrankensteinGeneratorScreen} />
          <Stack.Screen name="Reflection" component={ReflectionScreen} />
          <Stack.Screen name="ReflectionHistory" component={ReflectionHistoryScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
          <Stack.Screen name="Feed" component={FeedScreen} />
          <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
          <Stack.Screen name="Curriculum" component={CurriculumScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
