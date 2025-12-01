import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0A0E27" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#1A1F2E',
              borderTopColor: '#252B3D',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#00FFF0',
            tabBarInactiveTintColor: '#666',
            headerStyle: {
              backgroundColor: '#0A0E27',
            },
            headerTintColor: '#00FFF0',
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: '🏠' }} />
          <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarIcon: '📚' }} />
          <Tab.Screen name="DailyChallenge" component={DailyChallengeScreen} options={{ tabBarIcon: '⚡' }} />
          <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarIcon: '📊' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: '👤' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
