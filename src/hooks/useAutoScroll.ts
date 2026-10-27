import { useState, useRef, useEffect, useCallback } from 'react';

export type AutoScrollState = 'idle' | 'scrolling' | 'paused';

export function useAutoScroll() {
  const [scrollState, setScrollState] = useState<AutoScrollState>('idle');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0); // 0.5x to 3x

  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const lastTimeRef = useRef<number | null>(null);

  // Keep speedRef updated
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    lastTimeRef.current = null;
    setScrollState('idle');
  }, []);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    lastTimeRef.current = null;
    setScrollState('paused');
  }, []);

  const step = useCallback((time: number) => {
    if (!isRunningRef.current) return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
    }

    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Base speed: 30 pixels per second * speedMultiplier
    const pixelsToScroll = 35 * speedRef.current * delta;

    // Check if reached bottom of page
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 5) {
      stop();
      return;
    }

    window.scrollBy({
      top: pixelsToScroll,
      left: 0,
      behavior: 'auto' // 'auto' ensures continuous frame-by-frame smooth flow without stutter
    });

    animFrameIdRef.current = requestAnimationFrame(step);
  }, [stop]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = null;
    setScrollState('scrolling');
    animFrameIdRef.current = requestAnimationFrame(step);
  }, [step]);

  const resume = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = null;
    setScrollState('scrolling');
    animFrameIdRef.current = requestAnimationFrame(step);
  }, [step]);

  // Clean up completely on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return {
    scrollState,
    speedMultiplier,
    setSpeedMultiplier,
    start,
    pause,
    resume,
    stop
  };
}
