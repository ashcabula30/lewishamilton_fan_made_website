import React, { Suspense } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import depthMap from '../assets/new-hamilton-portrait-depth.png';
import portraitImg from '../assets/new-hamilton-portrait.png';
import { CinematicDepthPortrait } from '../three/CinematicDepthPortrait';
import HelmetRevealLayer from '../three/HelmetRevealLayer';

const Hero: React.FC = () => {
  const mouse = useMousePosition();

  return (
    <div className="relative w-screen h-[100svh] overflow-hidden bg-transparent">
      {/* Base Layer */}
      <div className="absolute inset-0 z-[1] flex justify-center items-center pointer-events-none">
        {/* Subtle separation behind the subject (no obvious glow) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%] w-[min(62vh,78vw)] h-[min(82vh,92vw)] pointer-events-none">
          <div className="absolute inset-0 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.06)_35%,rgba(0,0,0,0.0)_70%)] blur-[34px] opacity-70" />
          <div className="absolute inset-0 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.0)_60%)] blur-[46px] opacity-45" />
        </div>

        <div className="h-[104svh] w-[min(70vh,90vw)] -translate-y-[0.5vh] select-none pointer-events-auto">
          <Canvas
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 1.65], fov: 38 }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1.7} />
            <directionalLight position={[1.5, 2, 3]} intensity={2.3} />
            <directionalLight position={[-2, 1, 1.5]} intensity={0.7} color="#ffe6d0" />
            <Suspense fallback={null}>
              <group position={[-0.06, 0.02, 0]}>
                <CinematicDepthPortrait
                  portraitSrc={portraitImg}
                  depthSrc={depthMap}
                  displacement={0.028}
                  zDisplacement={0.03}
                  invertDepth={false}
                  mouse={mouse}
                />
              </group>
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </div>
      </div>
      <HelmetRevealLayer mouse={mouse} />

      {/* UI Elements Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none px-8 sm:px-12 lg:px-16 py-10 sm:py-12 flex flex-col justify-between h-full text-[#0c0c0c]">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="group cursor-pointer">
            <p className="text-[0.75rem] tracking-[0.28em] uppercase opacity-60">Scuderia Era</p>
            <h1 className="mt-3 text-[2.4rem] sm:text-[3.0rem] font-normal tracking-wider leading-none transition-colors duration-300 group-hover:text-[var(--accent-red)]">
              Lewis
            </h1>
            <h1 className="text-[2.55rem] sm:text-[3.15rem] font-bold tracking-[0.10em] leading-[1.02] transition-colors duration-300 group-hover:text-[var(--accent-red)]">
              HAMILTON
            </h1>
          </div>
          <a 
            href="https://www.formula1.com/en/drivers/lewis-hamilton" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[0.95rem] italic tracking-wide opacity-80 transition-all duration-300 hover:opacity-100 hover:text-[var(--accent-red)] relative after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-[1px] after:bg-current after:transition-[width] after:duration-400 hover:after:w-full"
          >
            View records
          </a>
        </div>

        <div className="grid grid-cols-12 gap-6 items-end pointer-events-auto">
          <div className="col-span-12 lg:col-span-5">
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#0c0c0c] text-[#f8f7f5] px-5 py-2.5 text-[0.9rem] tracking-wide transition-transform duration-300 hover:scale-[1.02]"
              >
                Explore
              </a>
              <p className="text-[0.75rem] tracking-[0.28em] uppercase opacity-50">Move your cursor</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 flex justify-between items-end">
            <p className="text-[0.8rem] italic text-[#111] opacity-55 tracking-widest uppercase">
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
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(248,247,245,0.0)_20%,rgba(248,247,245,0.55)_100%)]" />
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[linear-gradient(to_bottom,rgba(248,247,245,0.72)_0%,rgba(248,247,245,0.05)_28%,rgba(248,247,245,0.24)_100%)]" />
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
