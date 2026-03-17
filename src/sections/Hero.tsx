import React, { useRef, useEffect } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import portraitImg from '../assets/hamilton-ferrari-portrait.png';
import helmetImg from '../assets/hamilton-ferrari-helmet.png';
import gsap from 'gsap';

const Hero: React.FC = () => {
  const mouse = useMousePosition();
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<HTMLDivElement>(null);
  const uiLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!revealLayerRef.current) return;

    // Use GSAP to animate the mask for smooth following
    gsap.to({}, {
      duration: 0.1,
      repeat: -1,
      onUpdate: () => {
        if (revealLayerRef.current) {
          const { x, y } = mouse;
          // Apply mask with GSAP values would be better if we had a gsap-controlled hover
          // but direct style update is often faster for frame-by-frame mouse tracking
          revealLayerRef.current.style.maskImage = `radial-gradient(circle 80px at ${x}px ${y}px, black 0%, black 75%, transparent 100%)`;
          revealLayerRef.current.style.webkitMaskImage = `radial-gradient(circle 80px at ${x}px ${y}px, black 0%, black 75%, transparent 100%)`;
        }
      }
    });

    // Parallax effect
    const handleParallax = () => {
      const cx = (mouse.x / window.innerWidth - 0.5) * 2;
      const cy = (mouse.y / window.innerHeight - 0.5) * 2;

      gsap.to(baseLayerRef.current, { x: -cx * 15, y: -cy * 15, duration: 0.6, ease: 'power2.out' });
      gsap.to(revealLayerRef.current, { x: -cx * 20, y: -cy * 20, duration: 0.6, ease: 'power2.out' });
      gsap.to(uiLayerRef.current, { x: -cx * 6, y: -cy * 6, duration: 0.6, ease: 'power2.out' });
    };

    handleParallax();
  }, [mouse]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent">
      {/* Base Layer */}
      <div 
        ref={baseLayerRef}
        className="absolute inset-0 z-1 flex justify-center items-start pt-[10vh] pointer-events-none will-change-transform"
      >
        <img 
          src={portraitImg} 
          alt="Lewis Hamilton Portrait" 
          className="h-[130vh] w-auto object-contain select-none"
        />
      </div>

      {/* Reveal Layer (Helmet) */}
      <div 
        ref={revealLayerRef}
        className="absolute inset-0 z-2 flex justify-center items-start pt-[11.5vh] pointer-events-none will-change-transform"
        style={{
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: 'radial-gradient(circle 80px at 0px 0px, black 0%, black 75%, transparent 100%)', // Initial
          WebkitMaskImage: 'radial-gradient(circle 80px at 0px 0px, black 0%, black 75%, transparent 100%)'
        }}
      >
        <img 
          src={helmetImg} 
          alt="Lewis Hamilton Helmet" 
          className="h-[50vh] w-auto object-contain select-none"
        />
      </div>

      {/* UI Elements Layer */}
      <div ref={uiLayerRef} className="absolute inset-0 z-10 pointer-events-none p-14 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="group cursor-pointer">
            <h1 className="text-[3.2rem] font-normal tracking-wider leading-none transition-colors duration-300 group-hover:text-[var(--accent-red)]">
              Lewis
            </h1>
            <h1 className="text-[3.2rem] font-bold tracking-[0.08em] leading-[1.05] transition-colors duration-300 group-hover:text-[var(--accent-red)]">
              HAMILTON
            </h1>
          </div>
          <a 
            href="https://www.formula1.com/en/drivers/lewis-hamilton" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[1.1rem] italic tracking-wide transition-colors duration-300 hover:text-[var(--accent-red)] relative after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-[1px] after:bg-current after:transition-[width] after:duration-400 hover:after:w-full"
          >
            F1 Records
          </a>
        </div>

        <div className="flex justify-between items-end pointer-events-auto">
          <p className="text-[0.85rem] italic text-[#999] tracking-widest uppercase">
            Seven-time World Champion
          </p>
          <div className="flex gap-5 items-center">
            <SocialIcon 
              href="https://www.instagram.com/lewishamilton/" 
              ariaLabel="Instagram"
              path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
            />
            <SocialIcon 
              href="https://x.com/LewisHamilton" 
              ariaLabel="X (Twitter)"
              path="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(248,247,245,0.6)_100%)]" />
    </div>
  );
};

const SocialIcon: React.FC<{ href: string; ariaLabel: string; path: string }> = ({ href, ariaLabel, path }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label={ariaLabel}
    className="w-10 h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110 group"
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1a1a1a] transition-colors duration-300 group-hover:fill-[var(--accent-red)]">
      <path d={path} />
    </svg>
  </a>
);

export default Hero;
