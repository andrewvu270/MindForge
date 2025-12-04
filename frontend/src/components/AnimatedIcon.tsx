import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';

// Icon types
export type IconType = 'field' | 'achievement' | 'streak' | 'generic';
export type AnimationState = 'idle' | 'hover' | 'active' | 'celebrate' | 'dimmed';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Field names
export type FieldName = 'Economics' | 'Culture' | 'Influence' | 'Global Events' | 'Technology' | 'Finance';

// Achievement types
export type AchievementType = 'trophy' | 'gold' | 'silver' | 'bronze' | 'badge';

// Base props for all animated icons
export interface AnimatedIconProps {
  size?: IconSize;
  style?: any;
  state?: AnimationState;
  loop?: boolean;
  onAnimationComplete?: () => void;
  children?: React.ReactElement;
}

// Size mapping
export const sizeValues: Record<IconSize, number> = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

// Detect reduced motion preference
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  return reducedMotion;
};

// Base AnimatedIcon component
export default function AnimatedIcon({
  children,
  size = 'md',
  style,
  state = 'idle',
  loop = true,
  onAnimationComplete,
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (reducedMotion) return;

    if (state === 'celebrate') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (state === 'active') {
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    if (!loop && onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, loop, onAnimationComplete, reducedMotion]);

  const containerSize = sizeValues[size];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          transform: [{ scale: scaleAnim }],
          opacity: state === 'dimmed' ? 0.5 : 1,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
