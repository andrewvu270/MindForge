import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

// Free Lottie animations from public CDN
// These are actual working Lottie files
const animations = {
  // Celebrations
  celebration: 'https://lottie.host/4db68bbd-31f6-4cd8-84eb-189572c9b4d1/HhSAYRgZlR.json',
  confetti: 'https://assets2.lottiefiles.com/packages/lf20_touohxv0.json',
  trophy: 'https://assets9.lottiefiles.com/packages/lf20_atipemkz.json',
  success: 'https://assets4.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  
  // Learning
  book: 'https://assets10.lottiefiles.com/packages/lf20_1a8dx7zj.json',
  brain: 'https://assets1.lottiefiles.com/packages/lf20_vnikrcia.json',
  lightbulb: 'https://assets5.lottiefiles.com/packages/lf20_uu0x8lqv.json',
  rocket: 'https://assets4.lottiefiles.com/packages/lf20_fclga8fl.json',
  
  // Progress
  loading: 'https://assets9.lottiefiles.com/packages/lf20_a2chheio.json',
  checkmark: 'https://assets3.lottiefiles.com/packages/lf20_jk6c1n2n.json',
  fire: 'https://assets2.lottiefiles.com/packages/lf20_yd3oqjqm.json',
  star: 'https://assets1.lottiefiles.com/packages/lf20_zyquagfl.json',
  
  // Fields
  tech: 'https://assets7.lottiefiles.com/packages/lf20_qmfs6c3i.json',
  finance: 'https://assets8.lottiefiles.com/packages/lf20_myejiggj.json',
  globe: 'https://assets6.lottiefiles.com/packages/lf20_kcsr6fcp.json',
  chart: 'https://assets5.lottiefiles.com/packages/lf20_qmzocmgg.json',
};

interface LottieEnhancedProps {
  animation: keyof typeof animations;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function LottieEnhanced({
  animation,
  size = 'md',
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  onComplete,
}: LottieEnhancedProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const url = animations[animation];
        const response = await fetch(url);
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error('Failed to load animation:', err);
        setError(true);
      }
    };

    loadAnimation();
  }, [animation]);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (error || !animationData) {
    // Fallback to simple CSS animation
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <div className="w-full h-full rounded-full bg-coral/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
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
}: {
  message?: string;
  animation?: keyof typeof animations;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LottieEnhanced animation={animation} size="md" className="mb-4" />
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
        speed={days >= 30 ? 1.5 : days >= 7 ? 1.2 : 1}
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

