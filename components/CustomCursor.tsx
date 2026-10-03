import React, { useEffect, useRef, useState } from 'react';

type CustomCursorProps = {
  src: string;
};

export const CustomCursor: React.FC<CustomCursorProps> = ({ src }) => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const pointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncEnabled = () => {
      setIsEnabled(pointerQuery.matches && !reducedMotionQuery.matches);
    };

    syncEnabled();

    const handlePointerChange = () => syncEnabled();
    const handleMotionChange = () => syncEnabled();

    if (typeof pointerQuery.addEventListener === 'function') {
      pointerQuery.addEventListener('change', handlePointerChange);
      reducedMotionQuery.addEventListener('change', handleMotionChange);
    } else {
      pointerQuery.addListener(handlePointerChange);
      reducedMotionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (typeof pointerQuery.removeEventListener === 'function') {
        pointerQuery.removeEventListener('change', handlePointerChange);
        reducedMotionQuery.removeEventListener('change', handleMotionChange);
      } else {
        pointerQuery.removeListener(handlePointerChange);
        reducedMotionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !isEnabled) {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('invitarte-custom-cursor');
        document.body.classList.remove('invitarte-custom-cursor');
      }
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const cursorNode = cursorRef.current;
    if (!cursorNode) return;

    root.classList.add('invitarte-custom-cursor');
    body.classList.add('invitarte-custom-cursor');

    const updateCursor = () => {
      rafRef.current = null;
      cursorNode.style.transform = `translate3d(${positionRef.current.x - 8}px, ${positionRef.current.y - 7}px, 0) rotate(-14deg)`;
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(updateCursor);
    };

    const handlePointerMove = (event: PointerEvent) => {
      positionRef.current.x = event.clientX;
      positionRef.current.y = event.clientY;
      cursorNode.style.opacity = '1';
      scheduleUpdate();
    };

    const handlePointerLeave = () => {
      cursorNode.style.opacity = '0';
    };

    const handlePointerEnter = () => {
      cursorNode.style.opacity = '1';
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      root.classList.remove('invitarte-custom-cursor');
      body.classList.remove('invitarte-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('pointerenter', handlePointerEnter);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[200] h-9 w-9 opacity-0 transition-opacity duration-150"
      style={{
        backgroundImage: `url("${src}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        willChange: 'transform, opacity',
        filter: 'drop-shadow(0 4px 10px rgba(31, 24, 13, 0.14))',
        transformOrigin: '10px 10px'
      }}
    />
  );
};
