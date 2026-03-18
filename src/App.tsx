import React, { useState, useEffect } from 'react';
import Loader from './components/Loader';
import AnimatedGrid from './components/AnimatedGrid';
import BlobCursor from './components/BlobCursor';
import HyperspeedBackground from './components/HyperspeedBackground';
import ScrollRevealText from './components/ScrollRevealText';
import Hero from './sections/Hero';
import ThreeScene from './three/Scene';
import { useLenis } from './hooks/useLenis';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [playHeroTitleAnimation, setPlayHeroTitleAnimation] = useState(false);
  useLenis();

  useEffect(() => {
    // Simulate loading time for premium feel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setPlayHeroTitleAnimation(false);
      return;
    }

    const timer = setTimeout(() => {
      setPlayHeroTitleAnimation(true);
    }, 900);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="relative min-h-screen isolate overflow-x-hidden">
      <HyperspeedBackground />
      <BlobCursor
        trailCount={4}
        sizes={[240, 200, 152, 104]}
        innerSizes={[88, 64, 42, 28]}
        opacities={[1, 0.8, 0.62, 0.46]}
        fillColor="rgba(212, 175, 55, 0.25)"
        innerColor="#d4cece"
        shadowColor="#ecdeac"
        shadowBlur={18}
        shadowOffsetX={37}
        shadowOffsetY={18}
        filterStdDeviation={42}
        filterColorMatrixValues="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 42 -14"
        slowDuration={0.82}
        fastDuration={0.48}
        fastEase="power2.out"
        slowEase="power1.out"
        zIndex={-20}
      />
      <Loader isLoading={isLoading} />
      
      <main className={`relative z-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
        <AnimatedGrid />
        <ThreeScene />
        <Hero playTitleAnimation={playHeroTitleAnimation} />
        
        {/* Additional content can go here for scrolling */}
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-6 py-24 sm:px-10 lg:px-20 bg-transparent text-[#1a1a1a]">
          <div className="max-w-5xl text-center">
            <p className="mb-6 text-[0.72rem] uppercase tracking-[0.32em] text-[#1a1a1a]/45">
              Legacy
            </p>
            <ScrollRevealText
              text="The Pursuit of Excellence"
              className="mb-8"
              wordClassName="inline-block text-4xl font-bold italic leading-tight sm:text-5xl lg:text-6xl"
              baseOpacity={0.06}
              blurStrength={2}
              yOffset={8}
              stagger={42}
              duration={420}
            />
            <ScrollRevealText
              text="Lewis Hamilton is a British racing driver who is widely considered one of the greatest drivers in the history of the sport. He has won a joint-record seven Formula One World Drivers' Championship titles, and holds the records for the most wins, pole positions, and podium finishes."
              className="mx-auto max-w-4xl"
              wordClassName="inline-block text-lg leading-relaxed text-[#1a1a1a]/72 sm:text-xl lg:text-2xl"
              baseOpacity={0.05}
              blurStrength={1.5}
              yOffset={6}
              stagger={20}
              duration={320}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
