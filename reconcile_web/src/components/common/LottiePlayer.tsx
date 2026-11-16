import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web/build/player/lottie_light';

export interface LottiePlayerProps {
  /** Directly passed Bodymovin animation JSON object */
  animationData?: any;
  /** URL to fetch Bodymovin animation JSON */
  src?: string;
  /** Whether animation loops automatically (default true) */
  loop?: boolean;
  /** Whether animation plays automatically (default true) */
  autoplay?: boolean;
  /** Playback speed multiplier (default 1) */
  speed?: number;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Fallback node when loading or if rendering fails */
  fallback?: React.ReactNode;
  /** Callback triggered when non-looping animation reaches the end */
  onComplete?: () => void;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Accessible label */
  ariaLabel?: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  src,
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  style,
  fallback,
  onComplete,
  onClick,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy any existing animation instance cleanly
    if (animInstanceRef.current) {
      animInstanceRef.current.destroy();
      animInstanceRef.current = null;
    }

    try {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay,
        animationData: animationData ? JSON.parse(JSON.stringify(animationData)) : undefined,
        path: src,
      });

      anim.setSpeed(speed);

      if (onComplete) {
        anim.addEventListener('complete', onComplete);
      }

      animInstanceRef.current = anim;
    } catch (err) {
      console.warn('Lottie loading notice:', err);
    }

    return () => {
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
        animInstanceRef.current = null;
      }
    };
  }, [animationData, src, loop, autoplay, speed, onComplete]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
      onClick={onClick}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {fallback}
    </div>
  );
};

export default LottiePlayer;
