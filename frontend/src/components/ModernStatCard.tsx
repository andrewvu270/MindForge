import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ModernStatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  variant?: 'primary' | 'gradient' | 'glass';
  style?: ViewStyle;
}

const ModernStatCard: React.FC<ModernStatCardProps> = ({
  value,
  label,
  icon,
  trend,
  variant = 'primary',
  style,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'gradient':
        return styles.gradientCard;
      case 'glass':
        return styles.glassCard;
      default:
        return styles.primaryCard;
    }
  };

  const getValueStyle = () => {
    switch (variant) {
      case 'gradient':
        return styles.gradientValue;
      case 'glass':
        return styles.glassValue;
      default:
        return styles.primaryValue;
    }
  };

  const getLabelStyle = () => {
    switch (variant) {
      case 'gradient':
        return styles.gradientLabel;
      case 'glass':
        return styles.glassLabel;
      default:
        return styles.primaryLabel;
    }
  };

  const renderContent = () => (
    <View style={[styles.card, getCardStyle(), style]}>
      {variant === 'gradient' && (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />
      )}
      
      {variant === 'glass' && (
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassOverlay}
        />
      )}

      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.value, getValueStyle()]}>{value}</Text>
        <Text style={[styles.label, getLabelStyle()]}>{label}</Text>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={[
              styles.trendText,
              { color: trend.isUp ? theme.colors.success : theme.colors.error }
            ]}>
              {trend.isUp ? '↑' : '↓'} {trend.value}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  primaryCard: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradientCard: {
    backgroundColor: theme.colors.cardBackground,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  value: {
    fontFamily: theme.typography.fontFamily.black,
    marginBottom: theme.spacing.xs,
  },
  primaryValue: {
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
  },
  gradientValue: {
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
  },
  glassValue: {
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  primaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  gradientLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  glassLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  trendContainer: {
    marginTop: theme.spacing.sm,
  },
  trendText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
  },
});

export default ModernStatCard;
