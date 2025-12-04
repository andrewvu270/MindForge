import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function Navbar({ title, showBack = false, onBackPress }: NavbarProps) {

  return (
    <View style={styles.container}>
      {showBack && onBackPress && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.charcoal} />
        </TouchableOpacity>
      )}
      
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.charcoal} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
    flex: 1,
    textAlign: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
});
