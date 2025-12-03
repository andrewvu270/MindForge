import { useEffect, useRef, type ReactElement } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

// Animation types for CSS fallbacks
type AnimationType = 'celebration' | 'confetti' | 'trophy' | 'success' | 'book' | 'brain' |
  'lightbulb' | 'rocket' | 'loading' | 'checkmark' | 'fire' | 'star' | 'tech' | 'finance' | 'globe' | 'chart';

// CSS-based animated fallbacks (no external dependencies)
const CSSFallback = ({ animation, size }: { animation: AnimationType; size: string }): ReactElement => {
  const fallbacks: Record<AnimationType, ReactElement> = {
    celebration: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-honey/30 rounded-full animate-ping" />
        <span className="text-4xl animate-bounce">🎉</span>
      </div>
    ),
    confetti: (
      <div className={`${size} relative flex items-center justify-center`}>
        <span className="text-4xl animate-bounce">🎊</span>
      </div>
    ),
    trophy: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-honey/20 rounded-full animate-pulse" />
        <span className="text-4xl animate-bounce">🏆</span>
      </div>
    ),
    success: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-sage/30 rounded-full animate-ping" />
        <span className="text-4xl">✅</span>
      </div>
    ),
    book: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-coral/20 rounded-lg animate-pulse" />
        <span className="text-4xl">📚</span>
      </div>
    ),
    brain: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-lavender/30 rounded-full animate-pulse" />
        <span className="text-4xl">🧠</span>
      </div>
    ),
    lightbulb: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-honey/30 rounded-full animate-ping opacity-50" />
        <span className="text-4xl">💡</span>
      </div>
    ),
    rocket: (
      <div className={`${size} relative flex items-center justify-center`}>
        <span className="text-4xl animate-bounce">🚀</span>
      </div>
    ),
    loading: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="w-12 h-12 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
      </div>
    ),
    checkmark: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-sage/20 rounded-full" />
        <span className="text-4xl">✓</span>
      </div>
    ),
    fire: (
      <div className={`${size} relative flex items-center justify-center`}>
        <span className="text-4xl animate-pulse">🔥</span>
      </div>
    ),
    star: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-honey/20 rounded-full animate-ping opacity-50" />
        <span className="text-4xl">⭐</span>
      </div>
    ),
    tech: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-sky/20 rounded-lg animate-pulse" />
        <span className="text-4xl">💻</span>
      </div>
    ),
    finance: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-sage/20 rounded-lg animate-pulse" />
        <span className="text-4xl">📈</span>
      </div>
    ),
    globe: (
      <div className={`${size} relative flex items-center justify-center`}>
        <span className="text-4xl animate-spin-slow">🌍</span>
      </div>
    ),
    chart: (
      <div className={`${size} relative flex items-center justify-center`}>
        <div className="absolute inset-0 bg-honey/20 rounded-lg animate-pulse" />
        <span className="text-4xl">📊</span>
      </div>
    ),
  };

  return fallbacks[animation] || fallbacks.loading;
};

interface LottieEnhancedProps {
  animation: AnimationType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loop?: boolean;
  className?: string;
  onComplete?: () => void;
  animationData?: any; // JSON data for Lottie
}

export default function LottieEnhanced({
  animation,
  size = 'md',
  loop = true,
  className = '',
  onComplete,
  animationData,
}: LottieEnhancedProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  // Trigger onComplete after animation cycle for non-looping animations
  useEffect(() => {
    if (!loop && onComplete && !animationData) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [loop, onComplete, animationData]);

  // If Lottie data is provided, use lottie-react
  if (animationData) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={loop}
          onComplete={onComplete}
          className="w-full h-full"
        />
      </div>
    );
  }

  // Use CSS fallbacks - more reliable than external Lottie CDN if no data provided
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <CSSFallback animation={animation} size="w-full h-full" />
    </div>
  );
}

// Celebration overlay with Lottie
export function LottieCelebration({
  message = 'Great job!',
  onComplete,
}: {
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
        <LottieEnhanced
          animation="trophy"
          size="xl"
          loop={false}
          className="mx-auto mb-6"
        />
        <h2 className="text-3xl font-semibold text-white mb-2">{message}</h2>
      </div>
    </div>
  );
}

// Loading state with Lottie
export function LottieLoader({
  message = 'Loading...',
  animation = 'loading',
  animationData,
}: {
  message?: string;
  animation?: AnimationType;
  animationData?: any;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LottieEnhanced
        animation={animation}
        size="md"
        className="mb-4"
        animationData={animationData}
      />
      <p className="text-muted animate-pulse">{message}</p>
    </div>
  );
}

// Streak fire animation
export function StreakFire({ days }: { days: number }) {
  return (
    <div className="relative inline-flex items-center">
      <LottieEnhanced
        animation="fire"
        size="sm"
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
        {days}
      </span>
    </div>
  );
}

// Success checkmark
export function SuccessCheck({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <LottieEnhanced animation="checkmark" size={size} loop={false} />;
}
