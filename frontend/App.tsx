import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons, Feather } from '@expo/vector-icons';
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

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainFeedScreen from './src/screens/MainFeedScreen';
import LearnScreen from './src/screens/LearnScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FrankensteinDemoScreen from './src/screens/FrankensteinDemoScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: theme.colors.cardBackground,
        borderTopColor: theme.colors.borderLight,
        borderTopWidth: 1,
        elevation: 0,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textLight,
      headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
      },
      tabBarLabelStyle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 11,
      },
    }}
  >
    <Tab.Screen
      name="Feed"
      component={MainFeedScreen}
      options={{
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
        )
      }}
    />
    <Tab.Screen
      name="Learn"
      component={LearnScreen}
      options={{
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? "library" : "library-outline"} size={size} color={color} />
        )
      }}
    />
    <Tab.Screen
      name="Challenge"
      component={DailyChallengeScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? "flash" : "flash-outline"} size={size} color={color} />
        )
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Feather name="bar-chart-2" size={size} color={color} />
        )
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
        )
      }}
    />
    <Tab.Screen
      name="Demo"
      component={FrankensteinDemoScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? "flask" : "flask-outline"} size={size} color={color} />
        )
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainApp" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
