import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

// Mascot images for each field
// Note: Images should be placed in assets/clay/ directory
// For now, using null to trigger CSS fallback
const mascots: Record<string, any> = {
  'Technology': null, // require('../assets/clay/tech-mascot.png'),
  'Finance': null, // require('../assets/clay/finance-mascot.png'),
  'Economics': null, // require('../assets/clay/econ-mascot.png'),
  'Culture': null, // require('../assets/clay/culture-mascot.png'),
  'Influence': null, // require('../assets/clay/influence-mascot.png'),
  'Global Events': null, // require('../assets/clay/global-mascot.png'),
  'User': null, // Force CSS fallback for user avatar
};

// CSS-based clay character with field-specific accessories
const ClayCharacter = ({ field, size }: { field: string; size: number }) => {
  const colors: Record<string, string> = {
    'Technology': theme.colors.coral,
    'Finance': theme.colors.sage,
    'Economics': theme.colors.honey,
    'Culture': theme.colors.sky,
    'Influence': theme.colors.lavender,
    'Global Events': theme.colors.rose,
    'User': theme.colors.coral,
  };
  
  const color = colors[field] || theme.colors.coral;
  
  // Special User avatar - just a face in a circle
  if (field === 'User') {
    return (
      <View style={[styles.userAvatar, { width: size, height: size }]}>
        <View style={[styles.userFace, { backgroundColor: `${theme.colors.honey}40` }]}>
          {/* Eyes */}
          <View style={[styles.eye, { top: size * 0.25, left: size * 0.25 }]} />
          <View style={[styles.eye, { top: size * 0.25, right: size * 0.25 }]} />
          
          {/* Smile */}
          <View style={[styles.smile, { bottom: size * 0.25, width: size * 0.4 }]} />
          
          {/* Blush */}
          <View style={[styles.blush, { top: size * 0.4, left: size * 0.1 }]} />
          <View style={[styles.blush, { top: size * 0.4, right: size * 0.1 }]} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.clayBody, { width: size, height: size }]}>
      {/* Body */}
      <View style={[styles.body, { backgroundColor: `${color}15` }]}>
        {/* Head */}
        <View style={[styles.head, { backgroundColor: `${color}30` }]}>
          {/* Eyes */}
          <View style={[styles.clayEye, { top: 16, left: 8 }]} />
          <View style={[styles.clayEye, { top: 16, right: 8 }]} />
          
          {/* Smile */}
          <View style={styles.claySmile} />
          
          {/* Blush */}
          <View style={[styles.clayBlush, { top: 20, left: 2 }]} />
          <View style={[styles.clayBlush, { top: 20, right: 2 }]} />
        </View>
        
        {/* Arms */}
        <View style={[styles.arm, styles.leftArm, { backgroundColor: `${color}20` }]} />
        <View style={[styles.arm, styles.rightArm, { backgroundColor: `${color}20` }]} />
        
        {/* Legs */}
        <View style={[styles.leg, styles.leftLeg, { backgroundColor: `${color}20` }]} />
        <View style={[styles.leg, styles.rightLeg, { backgroundColor: `${color}20` }]} />
      </View>
    </View>
  );
};

interface ClayMascotProps {
  field?: string;
  size?: 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'wave' | 'celebrate' | 'think' | 'jump';
  style?: any;
}

export default function ClayMascot({ 
  field = 'Technology', 
  size = 'md',
  animation = 'idle',
  style 
}: ClayMascotProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animValue = new Animated.Value(0);

  const sizeValues = {
    sm: 64,
    md: 96,
    lg: 128,
  };

  const containerSize = sizeValues[size];

  useEffect(() => {
    if (animation === 'celebrate' || animation === 'jump') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (animation === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animation]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, animation === 'jump' ? -20 : -5],
  });

  const mascotSrc = mascots[field];
  const hasImage = mascotSrc != null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {hasImage && !imageError && (
        <Image
          source={mascotSrc}
          style={[
            styles.image,
            {
              opacity: imageLoaded ? 1 : 0,
            },
          ]}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      )}
      {/* Fallback - show if no image, while loading, or if image fails */}
      {(!hasImage || !imageLoaded || imageError) && (
        <ClayCharacter field={field} size={containerSize} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  userAvatar: {
    borderRadius: 1000,
    backgroundColor: `${theme.colors.honey}60`,
    borderWidth: 4,
    borderColor: `${theme.colors.honey}50`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userFace: {
    width: '75%',
    height: '75%',
    position: 'relative',
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.charcoal,
    position: 'absolute',
  },
  smile: {
    height: 16,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.charcoal,
    borderRadius: 100,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -20 }],
  },
  blush: {
    width: 12,
    height: 8,
    borderRadius: 100,
    backgroundColor: `${theme.colors.rose}60`,
    position: 'absolute',
  },
  clayBody: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    width: 56,
    height: 64,
    borderRadius: 28,
    position: 'relative',
  },
  head: {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: [{ translateX: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clayEye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${theme.colors.charcoal}80`,
    position: 'absolute',
  },
  claySmile: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 16,
    height: 6,
    borderBottomWidth: 2,
    borderBottomColor: `${theme.colors.charcoal}70`,
    borderRadius: 100,
  },
  clayBlush: {
    width: 8,
    height: 6,
    borderRadius: 100,
    backgroundColor: `${theme.colors.rose}30`,
    position: 'absolute',
  },
  arm: {
    width: 8,
    height: 24,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
  },
  leftArm: {
    left: -8,
  },
  rightArm: {
    right: -8,
  },
  leg: {
    width: 8,
    height: 20,
    borderRadius: 4,
    position: 'absolute',
    bottom: -16,
  },
  leftLeg: {
    left: 8,
  },
  rightLeg: {
    right: 8,
  },
});
