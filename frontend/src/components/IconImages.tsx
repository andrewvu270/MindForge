import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface IconImageProps {
  size?: number;
  color?: string;
}

export const GlobeIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.blue }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🌍</Text>
  </View>
);

export const MusicIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.pink }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🎵</Text>
  </View>
);

export const ArtIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.yellow }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🎨</Text>
  </View>
);

export const TrendingIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.red }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🔥</Text>
  </View>
);

export const VRIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.teal }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🥽</Text>
  </View>
);

export const RocketIcon: React.FC<IconImageProps> = ({ size = 80, color = theme.colors.clay.red }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.6, color }]}>🚀</Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    textAlign: 'center',
  },
});
