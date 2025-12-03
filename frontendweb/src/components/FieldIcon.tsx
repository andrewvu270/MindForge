import React from 'react';
import AnimatedIcon, { type FieldName, useReducedMotion } from './AnimatedIcon';
import type { AnimatedIconProps } from './AnimatedIcon';

export interface FieldIconProps extends Omit<AnimatedIconProps, 'children'> {
  field: FieldName;
}

// CSS-based animated field icons
const FieldAnimations: Record<FieldName, (reducedMotion: boolean) => React.ReactElement> = {
  'Economics': (reducedMotion) => (
    <div className="relative w-full h-full flex items-end justify-center gap-0.5 p-2">
      {/* Animated bar chart */}
      <div 
        className={`w-2 bg-honey/60 rounded-t ${!reducedMotion ? 'animate-grow-up' : ''}`}
        style={{ height: '40%', animationDelay: '0s' }}
      />
      <div 
        className={`w-2 bg-honey/70 rounded-t ${!reducedMotion ? 'animate-grow-up' : ''}`}
        style={{ height: '70%', animationDelay: '0.1s' }}
      />
      <div 
        className={`w-2 bg-honey/80 rounded-t ${!reducedMotion ? 'animate-grow-up' : ''}`}
        style={{ height: '50%', animationDelay: '0.2s' }}
      />
      <div 
        className={`w-2 bg-honey rounded-t ${!reducedMotion ? 'animate-grow-up' : ''}`}
        style={{ height: '90%', animationDelay: '0.3s' }}
      />
    </div>
  ),
  
  'Culture': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Theater masks */}
      <div className="relative">
        <div className={`absolute inset-0 bg-sky/20 rounded-full ${!reducedMotion ? 'animate-pulse' : ''}`} />
        <svg className="w-full h-full text-sky" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </div>
    </div>
  ),
  
  'Influence': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Target with ripple effect */}
      <div className={`absolute inset-0 bg-lavender/30 rounded-full ${!reducedMotion ? 'animate-ping' : ''}`} />
      <div className="absolute inset-2 bg-lavender/40 rounded-full" />
      <div className="absolute inset-4 bg-lavender/60 rounded-full" />
      <div className="absolute inset-6 bg-lavender rounded-full" />
      <div className="absolute inset-8 bg-white rounded-full" />
    </div>
  ),
  
  'Global Events': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Rotating globe */}
      <div className={`absolute inset-0 bg-rose/30 rounded-full ${!reducedMotion ? 'animate-spin-slow' : ''}`}>
        <div className="absolute inset-2 bg-rose/20 rounded-full" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-rose/40" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-rose/40" />
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-rose/30 rounded-full" />
      </div>
    </div>
  ),
  
  'Technology': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={`absolute inset-0 bg-coral/20 rounded-lg ${!reducedMotion ? 'animate-pulse' : ''}`} />
      <svg className="w-3/4 h-3/4 text-coral" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
      </svg>
    </div>
  ),
  
  'Finance': (reducedMotion) => (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={`absolute inset-0 bg-sage/20 rounded-lg ${!reducedMotion ? 'animate-pulse' : ''}`} />
      <svg className="w-3/4 h-3/4 text-sage" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
      </svg>
    </div>
  ),
};

export default function FieldIcon({ field, size = 'md', state = 'idle', className = '', ...props }: FieldIconProps) {
  const reducedMotion = useReducedMotion();
  const animation = FieldAnimations[field] || FieldAnimations['Technology'];

  return (
    <AnimatedIcon size={size} state={state} className={className} {...props}>
      {animation(reducedMotion)}
    </AnimatedIcon>
  );
}
