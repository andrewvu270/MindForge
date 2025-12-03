import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

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
  className?: string;
  state?: AnimationState;
  loop?: boolean;
  onAnimationComplete?: () => void;
  children?: ReactElement;
}

// Size mapping
export const sizeClasses: Record<IconSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

// Detect reduced motion preference
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

// Base AnimatedIcon component
export default function AnimatedIcon({
  children,
  size = 'md',
  className = '',
  state = 'idle',
  loop = true,
  onAnimationComplete,
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!loop && onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [loop, onAnimationComplete]);

  const stateClasses = {
    idle: '',
    hover: 'scale-110 transition-transform duration-300',
    active: 'scale-105',
    celebrate: 'animate-bounce',
    dimmed: 'opacity-50 grayscale',
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${stateClasses[state]} ${className} flex items-center justify-center`}
      aria-hidden={reducedMotion ? 'false' : 'true'}
    >
      {children}
    </div>
  );
}
