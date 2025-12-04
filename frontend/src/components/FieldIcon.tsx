import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import AnimatedIcon, { type FieldName, useReducedMotion } from './AnimatedIcon';
import type { AnimatedIconProps } from './AnimatedIcon';
import { theme } from '../theme';

export interface FieldIconProps extends Omit<AnimatedIconProps, 'children'> {
  field: FieldName;
}

// Field colors
const fieldColors: Record<FieldName, string> = {
  'Economics': theme.colors.honey,
  'Culture': theme.colors.sky,
  'Influence': theme.colors.lavender,
  'Global Events': theme.colors.rose,
  'Technology': theme.colors.coral,
  'Finance': theme.colors.sage,
};

// SVG-based animated field icons
const FieldAnimations: Record<FieldName, (reducedMotion: boolean, color: string) => React.ReactElement> = {
  'Economics': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Rect x="4" y="14" width="3" height="6" fill={color} opacity={0.6} />
      <Rect x="8" y="8" width="3" height="12" fill={color} opacity={0.7} />
      <Rect x="12" y="11" width="3" height="9" fill={color} opacity={0.8} />
      <Rect x="16" y="5" width="3" height="15" fill={color} />
    </Svg>
  ),
  
  'Culture': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.2} />
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
        fill={color}
      />
    </Svg>
  ),
  
  'Influence': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.3} />
      <Circle cx="12" cy="12" r="7" fill={color} opacity={0.4} />
      <Circle cx="12" cy="12" r="4" fill={color} opacity={0.6} />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  ),
  
  'Global Events': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.3} />
      <Line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1" opacity={0.4} />
      <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1" opacity={0.4} />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1" fill="none" opacity={0.3} />
    </Svg>
  ),
  
  'Technology': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Rect x="2" y="4" width="20" height="12" rx="2" fill={color} opacity={0.2} />
      <Path
        d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"
        fill={color}
      />
    </Svg>
  ),
  
  'Finance': (reducedMotion, color) => (
    <Svg width="100%" height="100%" viewBox="0 0 24 24">
      <Rect x="2" y="2" width="20" height="20" rx="2" fill={color} opacity={0.2} />
      <Path
        d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
        fill={color}
      />
    </Svg>
  ),
};

export default function FieldIcon({ field, size = 'md', state = 'idle', style, ...props }: FieldIconProps) {
  const reducedMotion = useReducedMotion();
  const color = fieldColors[field] || fieldColors['Technology'];
  const animation = FieldAnimations[field] || FieldAnimations['Technology'];

  return (
    <AnimatedIcon size={size} state={state} style={style} {...props}>
      {animation(reducedMotion, color)}
    </AnimatedIcon>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
