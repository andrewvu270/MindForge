import { useState, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';

// Mascot images for each field (generated via HuggingFace)
const mascots: Record<string, string> = {
  'Technology': '/mascots/tech-mascot.png',
  'Finance': '/mascots/finance-mascot.png',
  'Economics': '/mascots/econ-mascot.png',
  'Culture': '/mascots/culture-mascot.png',
  'Influence': '/mascots/influence-mascot.png',
  'Global Events': '/mascots/global-mascot.png',
  'User': '', // Force CSS fallback for user avatar
  'default': '/mascots/tech-mascot.png',
};

// Enhanced CSS-based clay character with field-specific accessories
const ClayCharacter = ({ field, className = '' }: { field: string; className?: string }) => {
  const colors: Record<string, string> = {
    'Technology': 'bg-coral',
    'Finance': 'bg-sage',
    'Economics': 'bg-honey',
    'Culture': 'bg-sky',
    'Influence': 'bg-lavender',
    'Global Events': 'bg-rose',
    'User': 'bg-coral',
  };
  
  const color = colors[field] || 'bg-coral';
  
  // Field-specific accessories
  const accessories: Record<string, JSX.Element> = {
    'Technology': (
      <div className="absolute -right-1 top-6 w-4 h-6 bg-charcoal/20 rounded" title="Phone">
        <div className="w-2 h-3 bg-sky/30 rounded-sm m-1" />
      </div>
    ),
    'Finance': (
      <div className="absolute -right-2 top-8 text-xl" title="Coins">💰</div>
    ),
    'Economics': (
      <div className="absolute -left-2 top-4 text-xl" title="Globe">🌍</div>
    ),
    'Culture': (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-sky/40 rounded-full" title="Beret" />
    ),
    'Influence': (
      <div className="absolute -right-2 top-6 text-lg" title="Megaphone">📣</div>
    ),
    'Global Events': (
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-4 bg-honey/40 rounded-t-full" title="Safari Hat" />
    ),
    'User': (
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm">👋</div>
    ),
  };
  
  // Special User avatar - just a face in a circle
  if (field === 'User') {
    return (
      <div className={`relative ${className} flex items-center justify-center`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))' }}>
        {/* Circle background - warm yellow-pink skin tone */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-honey/60 to-rose/40 border-4 border-honey/50 flex items-center justify-center">
          {/* Face */}
          <div className="relative w-3/4 h-3/4">
            {/* Eyes */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-charcoal rounded-full" />
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-charcoal rounded-full" />
            
            {/* Big smile */}
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-4 border-b-[3px] border-charcoal rounded-full" />
            
            {/* Blush - more visible pink */}
            <div className="absolute top-[40%] left-[10%] w-3 h-2 bg-rose/60 rounded-full" />
            <div className="absolute top-[40%] right-[10%] w-3 h-2 bg-rose/60 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className} flex items-center justify-center`} style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))' }}>
      {/* Clay body */}
      <div className="relative w-full h-full flex items-center justify-center opacity-90">
        {/* Body */}
        <div className={`w-14 h-16 ${color}/15 rounded-[40%] relative backdrop-blur-sm`}>
          {/* Head */}
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 ${color}/30 rounded-full`} style={{ filter: 'blur(0.5px)' }}>
            {/* Field accessory */}
            {accessories[field]}
            
            {/* Eyes */}
            <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-charcoal/80 rounded-full" />
            <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-charcoal/80 rounded-full" />
            
            {/* Smile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-1.5 border-b-2 border-charcoal/70 rounded-full" />
            
            {/* Blush */}
            <div className="absolute top-5 left-0.5 w-2 h-1.5 bg-rose/30 rounded-full" />
            <div className="absolute top-5 right-0.5 w-2 h-1.5 bg-rose/30 rounded-full" />
          </div>
          
          {/* Arms */}
          <div className={`absolute top-2 -left-2 w-2 h-6 ${color}/20 rounded-full`} />
          <div className={`absolute top-2 -right-2 w-2 h-6 ${color}/20 rounded-full`} />
          
          {/* Legs */}
          <div className={`absolute -bottom-4 left-2 w-2 h-5 ${color}/20 rounded-full`} />
          <div className={`absolute -bottom-4 right-2 w-2 h-5 ${color}/20 rounded-full`} />
        </div>
      </div>
    </div>
  );
};

interface ClayMascotProps {
  field?: string;
  size?: 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'wave' | 'celebrate' | 'think' | 'jump';
  className?: string;
}

export default function ClayMascot({ 
  field = 'Technology', 
  size = 'md',
  animation = 'idle',
  className = '' 
}: ClayMascotProps) {
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setCurrentAnimation(animation);
  }, [animation]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const animationClasses = {
    idle: 'animate-float',
    wave: 'animate-wave',
    celebrate: 'animate-celebrate',
    think: 'animate-pulse',
    jump: 'animate-bounce',
  };

  const mascotSrc = mascots[field];
  const hasImage = mascotSrc && mascotSrc.length > 0;

  // Try to use actual mascot image, fallback to CSS character
  return (
    <div className={`${sizeClasses[size]} ${animationClasses[currentAnimation]} ${className} relative`}>
      {hasImage && !imageError && (
        <img
          src={mascotSrc}
          alt={`${field} mascot`}
          className={`w-full h-full object-contain drop-shadow-lg transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
            mixBlendMode: 'multiply', // Blend mode to remove white backgrounds
            backgroundColor: 'transparent',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      {/* CSS fallback - show if no image, while loading, or if image fails */}
      {(!hasImage || !imageLoaded || imageError) && (
        <div className="absolute inset-0">
          <ClayCharacter field={field} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

// Celebration overlay component
export function CelebrationMascot({ 
  field = 'Technology',
  message = 'Great job!',
  onComplete 
}: { 
  field?: string; 
  message?: string;
  onComplete?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-scale-in">
        <ClayMascot field={field} size="lg" animation="celebrate" className="mx-auto mb-6" />
        <h2 className="text-3xl font-semibold text-white mb-2">{message}</h2>
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-honey rounded-full animate-ping"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading state with mascot
export function MascotLoader({ field = 'Technology', message = 'Loading...' }: { field?: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ClayMascot field={field} size="md" animation="think" className="mb-4" />
      <p className="text-muted animate-pulse">{message}</p>
    </div>
  );
}
