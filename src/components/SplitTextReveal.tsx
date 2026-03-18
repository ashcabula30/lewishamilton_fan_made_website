import React, { useEffect, useMemo, useRef, useState } from 'react';

type SplitTextRevealProps = {
  text: string;
  as?: React.ElementType;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  threshold?: number;
  animateOnMount?: boolean;
  play?: boolean;
};

const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  text,
  as: Tag = 'div',
  className = '',
  charClassName = '',
  delay = 0,
  stagger = 40,
  duration = 650,
  threshold = 0.55,
  animateOnMount = true,
  play = true,
}) => {
  const containerRef = useRef<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (!play) {
      setIsVisible(false);
      return;
    }

    if (animateOnMount) {
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

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
      { threshold }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [animateOnMount, play, threshold]);

  return React.createElement(
    Tag,
    { ref: containerRef, className },
    <>
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className={charClassName}
          style={{
            display: 'inline-block',
            whiteSpace: character === ' ' ? 'pre' : undefined,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 1.1em, 0)',
            filter: isVisible ? 'blur(0px)' : 'blur(8px)',
            transitionProperty: 'transform, opacity, filter',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${delay + index * stagger}ms`,
          }}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </>
  );
};

export default SplitTextReveal;
