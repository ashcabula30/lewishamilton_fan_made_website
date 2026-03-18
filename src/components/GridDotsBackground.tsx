import React, { useEffect, useMemo, useRef, useState } from 'react';

type Dimensions = {
  width: number;
  height: number;
};

type DotSeed = {
  baseX: number;
  baseY: number;
  amplitudeX: number;
  amplitudeY: number;
  speed: number;
  phase: number;
  hue: string;
  radius: number;
};

const GRID_GAP = 56;
const SEGMENT_GAP = 28;
const POINTER_STRENGTH = 26;

const createLinePoints = (length: number) => {
  const points: number[] = [];

  for (let value = 0; value <= length + SEGMENT_GAP; value += SEGMENT_GAP) {
    points.push(value);
  }

  return points;
};

const linePath = (
  axis: 'horizontal' | 'vertical',
  fixed: number,
  points: number[],
  pointer: { x: number; y: number },
  time: number,
) => {
  let path = '';

  points.forEach((point, index) => {
    const px = axis === 'horizontal' ? point : fixed;
    const py = axis === 'horizontal' ? fixed : point;
    const dx = px - pointer.x;
    const dy = py - pointer.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.exp(-(distance * distance) / 42000);
    const phase = time * 0.0013 + fixed * 0.015 + point * 0.018 + index * 0.35;
    const ripple = Math.sin(phase) * 2.2 + Math.cos(phase * 0.7) * 1.3;
    const bend = influence * POINTER_STRENGTH + ripple;
    const x = axis === 'horizontal' ? px : px + (dx === 0 ? bend : (-dx / (distance || 1)) * bend);
    const y = axis === 'horizontal' ? py + (dy === 0 ? bend : (-dy / (distance || 1)) * bend) : py;

    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  });

  return path.trim();
};

const buildDots = (): DotSeed[] =>
  Array.from({ length: 16 }, (_, index) => ({
    baseX: 0.12 + ((index * 0.23) % 0.76),
    baseY: 0.1 + ((index * 0.17) % 0.8),
    amplitudeX: 28 + (index % 5) * 10,
    amplitudeY: 18 + (index % 4) * 12,
    speed: 0.4 + (index % 6) * 0.09,
    phase: index * 0.75,
    hue: index % 3 === 0 ? '#e10600' : index % 2 === 0 ? '#111111' : '#d4af37',
    radius: index % 4 === 0 ? 2.8 : 1.9,
  }));

const GridDotsBackground: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const horizontalRefs = useRef<SVGPathElement[]>([]);
  const verticalRefs = useRef<SVGPathElement[]>([]);
  const dotRefs = useRef<SVGCircleElement[]>([]);
  const animationRef = useRef<number | null>(null);
  const pointer = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
  });

  const dots = useMemo(() => buildDots(), []);

  const verticalLines = useMemo(() => {
    if (!dimensions.width) return [];
    return Array.from(
      { length: Math.ceil(dimensions.width / GRID_GAP) + 2 },
      (_, index) => index * GRID_GAP,
    );
  }, [dimensions.width]);

  const horizontalLines = useMemo(() => {
    if (!dimensions.height) return [];
    return Array.from(
      { length: Math.ceil(dimensions.height / GRID_GAP) + 2 },
      (_, index) => index * GRID_GAP,
    );
  }, [dimensions.height]);

  const xPoints = useMemo(() => createLinePoints(dimensions.width), [dimensions.width]);
  const yPoints = useMemo(() => createLinePoints(dimensions.height), [dimensions.height]);

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      pointer.current.x = window.innerWidth / 2;
      pointer.current.y = window.innerHeight / 2;
      pointer.current.targetX = window.innerWidth / 2;
      pointer.current.targetY = window.innerHeight / 2;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      pointer.current.targetX = event.clientX;
      pointer.current.targetY = event.clientY;
      pointer.current.active = true;
    };

    const handleLeave = () => {
      pointer.current.targetX = window.innerWidth / 2;
      pointer.current.targetY = window.innerHeight / 2;
      pointer.current.active = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerleave', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const animate = (time: number) => {
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.08;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.08;

      horizontalRefs.current.forEach((path, index) => {
        if (!path) return;
        path.setAttribute(
          'd',
          linePath('horizontal', horizontalLines[index], xPoints, pointer.current, time),
        );
      });

      verticalRefs.current.forEach((path, index) => {
        if (!path) return;
        path.setAttribute(
          'd',
          linePath('vertical', verticalLines[index], yPoints, pointer.current, time),
        );
      });

      dotRefs.current.forEach((circle, index) => {
        const seed = dots[index];
        if (!circle || !seed) return;

        const pulse = seed.phase + time * 0.001 * seed.speed;
        const x = dimensions.width * seed.baseX + Math.sin(pulse) * seed.amplitudeX;
        const y = dimensions.height * seed.baseY + Math.cos(pulse * 1.35) * seed.amplitudeY;
        const distance = Math.hypot(x - pointer.current.x, y - pointer.current.y);
        const boost = Math.max(0, 1 - distance / 260);

        circle.setAttribute('cx', x.toFixed(2));
        circle.setAttribute('cy', y.toFixed(2));
        circle.setAttribute('opacity', (0.35 + boost * 0.45).toFixed(2));
        circle.setAttribute('r', (seed.radius + boost * 1.2).toFixed(2));
      });

      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, dots, horizontalLines, verticalLines, xPoints, yPoints]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-30] overflow-hidden bg-[#f8f7f5]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,247,245,0.94)_48%,rgba(241,237,231,0.98))]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_center,rgba(17,17,17,0.95)_1px,transparent_1px)] [background-size:24px_24px]" />

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(dimensions.width, 1)} ${Math.max(dimensions.height, 1)}`}
        className="absolute inset-0 h-full w-full opacity-80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="grid-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g stroke="rgba(17,17,17,0.12)" strokeWidth="1" fill="none">
          {horizontalLines.map((line, index) => (
            <path
              key={`h-${line}`}
              ref={(node) => {
                if (node) horizontalRefs.current[index] = node;
              }}
            />
          ))}
          {verticalLines.map((line, index) => (
            <path
              key={`v-${line}`}
              ref={(node) => {
                if (node) verticalRefs.current[index] = node;
              }}
            />
          ))}
        </g>

        <g fill="rgba(17,17,17,0.16)">
          {verticalLines.flatMap((x, xIndex) =>
            horizontalLines
              .filter((_, yIndex) => (xIndex + yIndex) % 2 === 0)
              .map((y) => <circle key={`grid-dot-${x}-${y}`} cx={x} cy={y} r="1.15" />),
          )}
        </g>

        <g filter="url(#grid-dot-glow)">
          {dots.map((dot, index) => (
            <circle
              key={`orbit-dot-${index}`}
              ref={(node) => {
                if (node) dotRefs.current[index] = node;
              }}
              cx={dimensions.width * dot.baseX}
              cy={dimensions.height * dot.baseY}
              r={dot.radius}
              fill={dot.hue}
              opacity="0.45"
            />
          ))}
        </g>
      </svg>

      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(248,247,245,0.9),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(248,247,245,0.92),transparent)]" />
    </div>
  );
};

export default GridDotsBackground;
