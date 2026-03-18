import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const setPos = (el: HTMLDivElement, x: number, y: number, duration: number) => {
      gsap.to(el, { x, y, duration, ease: 'power3.out', overwrite: true });
    };

    const onMove = (e: MouseEvent) => {
      setPos(dot, e.clientX, e.clientY, 0.08);
      setPos(ring, e.clientX, e.clientY, 0.18);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      {/* Subtle visible cursor (no rings/echoes) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full border border-black/15 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-black/70 pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
    </>
  );
};

export default CustomCursor;
