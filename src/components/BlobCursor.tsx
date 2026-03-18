import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface BlobCursorProps {
  blobType?: 'circle' | 'square';
  fillColor?: string;
  trailCount?: number;
  sizes?: number[];
  innerSizes?: number[];
  innerColor?: string;
  opacities?: number[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  filterId?: string;
  filterStdDeviation?: number;
  filterColorMatrixValues?: string;
  useFilter?: boolean;
  fastDuration?: number;
  slowDuration?: number;
  fastEase?: string;
  slowEase?: string;
  zIndex?: number;
}

export default function BlobCursor({
  blobType = 'circle',
  fillColor = '#5227FF',
  trailCount = 3,
  sizes = [60, 125, 75],
  innerSizes = [20, 35, 25],
  innerColor = 'rgba(255,255,255,0.8)',
  opacities = [0.6, 0.6, 0.6],
  shadowColor = 'rgba(0,0,0,0.75)',
  shadowBlur = 5,
  shadowOffsetX = 10,
  shadowOffsetY = 10,
  filterId = 'blob',
  filterStdDeviation = 30,
  filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
  useFilter = true,
  fastDuration = 0.1,
  slowDuration = 0.5,
  fastEase = 'power3.out',
  slowEase = 'power1.out',
  zIndex = 100,
}: BlobCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lastBroadcastRef = useRef({ x: 0, y: 0 });

  const getContainerOffset = useCallback(() => {
    if (!containerRef.current) {
      return { left: 0, top: 0 };
    }

    const rect = containerRef.current.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }, []);

  const handlePointerMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { left, top } = getContainerOffset();
      const clientX = 'clientX' in event ? event.clientX : event.touches[0]?.clientX ?? 0;
      const clientY = 'clientY' in event ? event.clientY : event.touches[0]?.clientY ?? 0;

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;

        const isLeadBlob = index === 0;
        const duration = isLeadBlob
          ? fastDuration
          : slowDuration + index * 0.12;
        gsap.to(blob, {
          x: clientX - left,
          y: clientY - top,
          duration,
          ease: isLeadBlob ? fastEase : slowEase,
          overwrite: 'auto',
          onUpdate: isLeadBlob
            ? () => {
                const x = Number(gsap.getProperty(blob, 'x')) || 0;
                const y = Number(gsap.getProperty(blob, 'y')) || 0;
                const next = { x: x + left, y: y + top };
                const prev = lastBroadcastRef.current;

                if (Math.abs(next.x - prev.x) < 0.5 && Math.abs(next.y - prev.y) < 0.5) {
                  return;
                }

                lastBroadcastRef.current = next;
                window.dispatchEvent(new CustomEvent('blobcursor:move', { detail: next }));
              }
            : undefined,
        });
      });
    },
    [fastDuration, slowDuration, fastEase, slowEase, getContainerOffset],
  );

  useEffect(() => {
    const handleResize = () => {
      getContainerOffset();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [getContainerOffset, handlePointerMove]);

  return (
    <>
      <style>{`
        .blob-cursor-container {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .blob-cursor-main {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: transparent;
          user-select: none;
          pointer-events: none;
        }

        .blob-cursor-item {
          position: absolute;
          will-change: transform;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .blob-cursor-inner {
          position: absolute;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="blob-cursor-container"
        style={{ zIndex }}
      >
        {useFilter && (
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
              <feColorMatrix in="blur" values={filterColorMatrixValues} />
            </filter>
          </svg>
        )}

        <div
          className="blob-cursor-main"
          style={{ filter: useFilter ? `url(#${filterId})` : undefined }}
        >
          {Array.from({ length: trailCount }).map((_, index) => {
            const size = sizes[index] ?? sizes[sizes.length - 1] ?? 60;
            const innerSize = innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 20;
            const opacity = opacities[index] ?? opacities[opacities.length - 1] ?? 0.6;
            const radius = blobType === 'circle' ? '50%' : '0%';

            return (
              <div
                key={index}
                ref={(element) => {
                  blobRefs.current[index] = element;
                }}
                className="blob-cursor-item"
                style={{
                  width: size,
                  height: size,
                  borderRadius: radius,
                  backgroundColor: fillColor,
                  opacity,
                  boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
                }}
              >
                <div
                  className="blob-cursor-inner"
                  style={{
                    width: innerSize,
                    height: innerSize,
                    top: (size - innerSize) / 2,
                    left: (size - innerSize) / 2,
                    backgroundColor: innerColor,
                    borderRadius: radius,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
