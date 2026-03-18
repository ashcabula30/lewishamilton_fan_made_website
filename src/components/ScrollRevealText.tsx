import React, { useEffect, useMemo, useRef, useState } from 'react';

type ScrollRevealTextProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  baseOpacity?: number;
  blurStrength?: number;
  yOffset?: number;
  stagger?: number;
  duration?: number;
  threshold?: number;
};

const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className = '',
  wordClassName = '',
  baseOpacity = 0.08,
  blurStrength = 4,
  yOffset = 16,
  stagger = 65,
  duration = 700,
  threshold = 0.28,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={wordClassName}
          style={{
            opacity: isVisible ? 1 : baseOpacity,
            filter: isVisible ? 'blur(0px)' : `blur(${blurStrength}px)`,
            transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${yOffset}px, 0)`,
            transitionProperty: 'opacity, filter, transform',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${index * stagger}ms`,
            willChange: 'opacity, filter, transform',
          }}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </div>
  );
};

export default ScrollRevealText;
