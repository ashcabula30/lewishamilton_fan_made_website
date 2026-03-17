import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const echoContainerRef = useRef<HTMLDivElement>(null);
  const [velocity, setVelocity] = useState(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // Update cursor position with GSAP for smoothness
      gsap.to(cursor, {
        x: clientX,
        y: clientY,
        duration: 0.2,
        ease: 'power2.out',
      });

      // Calculate velocity for echoes
      const now = Date.now();
      const dt = now - lastTime.current;
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const v = dist / (dt || 1);
      
      setVelocity(v);
      lastPos.current = { x: clientX, y: clientY };
      lastTime.current = now;

      // Spawn echo if velocity is high
      if (v > 1.5 && echoContainerRef.current) {
        spawnEcho(clientX, clientY);
      }
    };

    const spawnEcho = (x: number, y: number) => {
      const echo = document.createElement('div');
      echo.className = 'absolute rounded-full border border-black/10 pointer-events-none w-[160px] h-[160px] transform -translate-x-1/2 -translate-y-1/2 animate-echoFade';
      echo.style.left = `${x}px`;
      echo.style.top = `${y}px`;
      
      echoContainerRef.current?.appendChild(echo);
      setTimeout(() => echo.remove(), 800);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-[160px] h-[160px] border border-black/20 rounded-full pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 hidden md:block"
      />
      <div ref={echoContainerRef} className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden" />
      <style>{`
        @keyframes echoFade {
          0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }
        .animate-echoFade {
          animation: echoFade 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
