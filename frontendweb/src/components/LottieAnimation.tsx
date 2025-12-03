import Lottie from 'lottie-react';

// Free Lottie animations for different topics
// These are public domain / free to use animations from LottieFiles
const animations: Record<string, string> = {
  // Technology
  'technology': 'https://lottie.host/embed/4db68bbd-31f6-4cd8-84eb-189572c9b4d1/HhSAYRgZlR.json',
  'ai': 'https://lottie.host/embed/d5f89c5e-5c5e-4c5e-8c5e-5c5e5c5e5c5e/robot.json',
  
  // Finance
  'finance': 'https://lottie.host/embed/3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c/money.json',
  'investing': 'https://lottie.host/embed/2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b/chart.json',
  
  // Economics
  'economics': 'https://lottie.host/embed/1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a/globe.json',
  
  // Default
  'default': 'https://lottie.host/embed/0000000-0000-0000-0000-000000000000/learning.json',
};

// Simple animated shapes as fallback (no external dependency)
const AnimatedShape = ({ type, color }: { type: string; color: string }) => {
  const shapes: Record<string, JSX.Element> = {
    circle: (
      <div className={`w-24 h-24 rounded-full bg-${color}/20 animate-pulse flex items-center justify-center`}>
        <div className={`w-16 h-16 rounded-full bg-${color}/40`} />
      </div>
    ),
    square: (
      <div className={`w-24 h-24 rounded-2xl bg-${color}/20 animate-bounce flex items-center justify-center`}>
        <div className={`w-16 h-16 rounded-xl bg-${color}/40`} />
      </div>
    ),
    blob: (
      <div className="relative w-32 h-32">
        <div className={`absolute inset-0 bg-${color}/30 rounded-full animate-blob`} />
        <div className={`absolute inset-2 bg-${color}/20 rounded-full animate-blob animation-delay-2000`} />
        <div className={`absolute inset-4 bg-${color}/10 rounded-full animate-blob animation-delay-4000`} />
      </div>
    ),
  };
  
  return shapes[type] || shapes.circle;
};

interface LottieAnimationProps {
  topic?: string;
  field?: string;
  className?: string;
  fallbackType?: 'circle' | 'square' | 'blob';
  fallbackColor?: string;
}

export default function LottieAnimation({ 
  topic, 
  field, 
  className = '',
  fallbackType = 'blob',
  fallbackColor = 'coral'
}: LottieAnimationProps) {
  // For now, use CSS animations as Lottie URLs need to be actual hosted files
  // In production, you'd host your own Lottie files or use LottieFiles CDN
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <AnimatedShape type={fallbackType} color={fallbackColor} />
    </div>
  );
}

// Animated illustration component using pure CSS
export function AnimatedIllustration({ 
  type = 'learning',
  size = 'md'
}: { 
  type?: 'learning' | 'thinking' | 'success' | 'chart' | 'globe';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const illustrations: Record<string, JSX.Element> = {
    learning: (
      <div className={`${sizeClasses[size]} relative`}>
        {/* Book shape */}
        <div className="absolute inset-0 bg-coral/20 rounded-lg transform rotate-3 animate-pulse" />
        <div className="absolute inset-1 bg-coral/30 rounded-lg transform -rotate-2" />
        <div className="absolute inset-2 bg-coral/40 rounded-lg flex items-center justify-center">
          <div className="w-1/2 h-1 bg-white/50 rounded mb-1" />
        </div>
      </div>
    ),
    thinking: (
      <div className={`${sizeClasses[size]} relative`}>
        {/* Brain/thought bubble */}
        <div className="absolute inset-0 bg-lavender/30 rounded-full animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-lavender/50 rounded-full" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-lavender/40 rounded-full animate-bounce" />
        <div className="absolute -top-4 right-2 w-2 h-2 bg-lavender/30 rounded-full animate-bounce delay-100" />
      </div>
    ),
    success: (
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-sage/20 rounded-full animate-ping" />
        <div className="absolute inset-2 bg-sage/40 rounded-full" />
        <svg className="w-1/2 h-1/2 text-sage relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    chart: (
      <div className={`${sizeClasses[size]} relative flex items-end justify-center gap-1 p-2`}>
        <div className="w-3 bg-honey/60 rounded-t animate-grow-up" style={{ height: '40%', animationDelay: '0s' }} />
        <div className="w-3 bg-honey/70 rounded-t animate-grow-up" style={{ height: '70%', animationDelay: '0.1s' }} />
        <div className="w-3 bg-honey/80 rounded-t animate-grow-up" style={{ height: '50%', animationDelay: '0.2s' }} />
        <div className="w-3 bg-honey rounded-t animate-grow-up" style={{ height: '90%', animationDelay: '0.3s' }} />
      </div>
    ),
    globe: (
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-sky/30 rounded-full animate-spin-slow" />
        <div className="absolute inset-2 bg-sky/20 rounded-full" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-sky/40" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-sky/40" />
      </div>
    ),
  };

  return illustrations[type] || illustrations.learning;
}
