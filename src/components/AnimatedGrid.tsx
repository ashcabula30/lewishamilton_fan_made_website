import React, { useEffect, useRef } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';

const AnimatedGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const drawGrid = () => {
      const w = canvas.width;
      const h = canvas.height;
      const spacing = 60;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.08;

      // React to mouse movement for a dynamic feel
      offset.current.x += (mouse.x * 0.01 - offset.current.x) * 0.05;
      offset.current.y += (mouse.y * 0.01 - offset.current.y) * 0.05;

      const ox = offset.current.x % spacing;
      const oy = offset.current.y % spacing;

      ctx.beginPath();
      for (let x = ox; x < w; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = oy; y < h; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      requestAnimationFrame(drawGrid);
    };

    const animId = requestAnimationFrame(drawGrid);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [mouse]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default AnimatedGrid;
