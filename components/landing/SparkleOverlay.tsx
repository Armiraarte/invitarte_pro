import React, { useEffect, useMemo, useState } from 'react';

type SparkleItem = {
  id: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  shiftX: string;
  shiftY: string;
  opacity: number;
  variant: 'hero' | 'dust';
};

const createSparkleItem = (index: number): SparkleItem => {
  const isHero = Math.random() > 0.42;
  const top = `${Math.round(Math.random() * 108 - 4)}%`;
  const left = `${Math.round(Math.random() * 108 - 4)}%`;
  const size = isHero ? 10 + Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 4);
  const shiftX = `${(14 + Math.random() * 34) * (Math.random() > 0.5 ? 1 : -1)}px`;
  const shiftY = `${-(18 + Math.random() * 34)}px`;
  const duration = `${(isHero ? 7.2 + Math.random() * 2.4 : 4.8 + Math.random() * 2.2).toFixed(2)}s`;
  const delay = `${(Math.random() * 1.2).toFixed(2)}s`;
  const opacity = Number((isHero ? 0.78 + Math.random() * 0.22 : 0.35 + Math.random() * 0.28).toFixed(2));

  return {
    id: `sparkle-${index}`,
    top,
    left,
    size,
    delay,
    duration,
    shiftX,
    shiftY,
    opacity,
    variant: isHero ? 'hero' : 'dust'
  };
};

const createSparkleField = (count: number) => Array.from({ length: count }, (_, index) => createSparkleItem(index));

type SparkleOverlayProps = {
  tone?: 'light' | 'shadow';
};

const SparkleOverlayComponent: React.FC<SparkleOverlayProps> = ({ tone = 'light' }) => {
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(pointer: coarse)').matches
  );
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  const sparkleCount = isCoarsePointer ? 0 : viewportWidth < 1024 ? 8 : 12;

  const sparkleField = useMemo(() => createSparkleField(sparkleCount), [sparkleCount]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    const handlePointerChange = (event: MediaQueryListEvent) => {
      setIsCoarsePointer(event.matches);
    };
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    setPrefersReducedMotion(reducedMotionQuery.matches);
    setIsCoarsePointer(coarsePointerQuery.matches);
    setViewportWidth(window.innerWidth);

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
      coarsePointerQuery.addEventListener('change', handlePointerChange);
      window.addEventListener('resize', handleResize, { passive: true });
      return () => {
        reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange);
        coarsePointerQuery.removeEventListener('change', handlePointerChange);
        window.removeEventListener('resize', handleResize);
      };
    }

    reducedMotionQuery.addListener(handleMotionPreferenceChange);
    coarsePointerQuery.addListener(handlePointerChange);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      reducedMotionQuery.removeListener(handleMotionPreferenceChange);
      coarsePointerQuery.removeListener(handlePointerChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (prefersReducedMotion || !isDocumentVisible || sparkleCount === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-[-6%] z-[1] overflow-hidden">
      {sparkleField.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`sparkle-star absolute ${sparkle.variant === 'dust' ? 'sparkle-star--dust' : 'sparkle-star--hero'}`}
          style={
            {
              top: sparkle.top,
              left: sparkle.left,
              width: sparkle.size,
              height: sparkle.size,
              mixBlendMode: tone === 'shadow' ? 'normal' : 'screen',
              opacity: tone === 'shadow' ? sparkle.opacity * 0.2 : undefined,
              ['--sparkle-duration' as '--sparkle-duration']: sparkle.duration,
              ['--sparkle-delay' as '--sparkle-delay']: sparkle.delay,
              ['--sparkle-shift-x' as '--sparkle-shift-x']: sparkle.shiftX,
              ['--sparkle-shift-y' as '--sparkle-shift-y']: sparkle.shiftY,
              ['--sparkle-opacity' as '--sparkle-opacity']: String(sparkle.opacity)
            } as React.CSSProperties
          }
        >
          {tone === 'light' ? <div className="sparkle-core absolute inset-0" /> : null}
          <svg
            viewBox="0 0 24 24"
            className="relative h-full w-full"
            style={{ color: tone === 'shadow' ? '#151515' : '#fffdf8' }}
            fill="none"
          >
            <path
              d="M12 2.5L13.7 10.3L21.5 12L13.7 13.7L12 21.5L10.3 13.7L2.5 12L10.3 10.3L12 2.5Z"
              fill="currentColor"
              stroke={tone === 'shadow' ? 'rgba(22,22,22,0.85)' : 'rgba(255,255,255,0.92)'}
              strokeWidth="1.2"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export const SparkleOverlay = React.memo(SparkleOverlayComponent);
