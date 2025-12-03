import AnimatedIcon, { useReducedMotion } from './AnimatedIcon';
import type { AnimatedIconProps } from './AnimatedIcon';

export interface StreakIconProps extends Omit<AnimatedIconProps, 'children'> {
  days: number;
  showCount?: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'max' | 'inactive';
}

// Calculate intensity based on streak days
const calculateIntensity = (days: number): 'low' | 'medium' | 'high' | 'max' | 'inactive' => {
  if (days === 0) return 'inactive';
  if (days < 7) return 'low';
  if (days < 14) return 'medium';
  if (days < 30) return 'high';
  return 'max';
};

// Fire animation with different intensities
const FireAnimation = ({ 
  intensity, 
  reducedMotion 
}: { 
  intensity: 'low' | 'medium' | 'high' | 'max' | 'inactive';
  reducedMotion: boolean;
}) => {
  if (intensity === 'inactive') {
    return (
      <div className="relative w-full h-full flex items-center justify-center opacity-30 grayscale">
        <svg className="w-3/4 h-3/4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
      </div>
    );
  }

  const animations = {
    low: !reducedMotion ? 'animate-pulse' : '',
    medium: !reducedMotion ? 'animate-pulse' : '',
    high: !reducedMotion ? 'animate-bounce' : '',
    max: !reducedMotion ? 'animate-bounce' : '',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow effect for high intensity */}
      {(intensity === 'high' || intensity === 'max') && !reducedMotion && (
        <>
          <div className="absolute inset-0 bg-orange-500/30 rounded-full animate-ping" />
          {intensity === 'max' && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping animation-delay-500" />
          )}
        </>
      )}
      
      {/* Fire icon */}
      <svg 
        className={`w-3/4 h-3/4 ${animations[intensity]}`} 
        viewBox="0 0 24 24" 
        fill="url(#fireGradient)"
      >
        <defs>
          <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className={`text-orange-400`} stopColor="currentColor" />
            <stop offset="100%" className={`text-red-600`} stopColor="currentColor" />
          </linearGradient>
        </defs>
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
      </svg>
      
      {/* Sparkles for max intensity */}
      {intensity === 'max' && !reducedMotion && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-300" />
        </>
      )}
    </div>
  );
};

export default function StreakIcon({ 
  days, 
  showCount = false,
  intensity,
  size = 'md', 
  state = 'idle', 
  className = '', 
  ...props 
}: StreakIconProps) {
  const reducedMotion = useReducedMotion();
  const calculatedIntensity = intensity || calculateIntensity(days);

  return (
    <div className="relative inline-flex items-center">
      <AnimatedIcon 
        size={size} 
        state={calculatedIntensity === 'inactive' ? 'dimmed' : state} 
        className={className} 
        {...props}
      >
        <FireAnimation intensity={calculatedIntensity} reducedMotion={reducedMotion} />
      </AnimatedIcon>
      
      {showCount && days > 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs drop-shadow-lg">
          {days}
        </span>
      )}
    </div>
  );
}
