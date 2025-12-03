import AnimatedIcon, { type AchievementType, useReducedMotion } from './AnimatedIcon';
import type { AnimatedIconProps } from './AnimatedIcon';

export interface AchievementIconProps extends Omit<AnimatedIconProps, 'children'> {
  type: AchievementType;
  celebrate?: boolean;
}

// CSS-based animated achievement icons
const AchievementAnimations: Record<AchievementType, (reducedMotion: boolean, celebrate: boolean) => React.ReactElement> = {
  'trophy': (reducedMotion, celebrate) => (
    <div className="relative w-full h-full flex items-center justify-center">
      {celebrate && !reducedMotion && (
        <div className="absolute inset-0 bg-honey/30 rounded-full animate-ping" />
      )}
      <div className={`absolute inset-0 bg-honey/20 rounded-full ${!reducedMotion ? 'animate-pulse' : ''}`} />
      <svg className={`w-3/4 h-3/4 text-honey ${celebrate && !reducedMotion ? 'animate-bounce' : ''}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
      </svg>
    </div>
  ),
  
  'gold': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      {!reducedMotion && (
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping opacity-50" />
      )}
      <div className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">1</span>
      </div>
    </div>
  ),
  
  'silver': () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
        <span className="text-gray-700 font-bold text-lg">2</span>
      </div>
    </div>
  ),
  
  'bronze': () => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">3</span>
      </div>
    </div>
  ),
  
  'badge': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={`absolute inset-0 bg-coral/20 rounded-full ${!reducedMotion ? 'animate-pulse' : ''}`} />
      <svg className="w-3/4 h-3/4 text-coral" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </div>
  ),
};

export default function AchievementIcon({ 
  type, 
  celebrate = false,
  size = 'md', 
  state = 'idle', 
  className = '', 
  ...props 
}: AchievementIconProps) {
  const reducedMotion = useReducedMotion();
  const animation = AchievementAnimations[type] || AchievementAnimations['badge'];

  return (
    <AnimatedIcon 
      size={size} 
      state={celebrate ? 'celebrate' : state} 
      className={className} 
      {...props}
    >
      {animation(reducedMotion, celebrate)}
    </AnimatedIcon>
  );
}
