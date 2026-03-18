import React, { useState, useEffect } from 'react';
import Loader from './components/Loader';
import AnimatedGrid from './components/AnimatedGrid';
import HyperspeedBackground from './components/HyperspeedBackground';
import Hero from './sections/Hero';
import ThreeScene from './three/Scene';
import { useLenis } from './hooks/useLenis';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  useLenis();

  useEffect(() => {
    // Simulate loading time for premium feel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen isolate overflow-x-hidden">
      <HyperspeedBackground />
      <Loader isLoading={isLoading} />
      
      <main className={`relative z-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
        <AnimatedGrid />
        <ThreeScene />
        <Hero />
        
        {/* Additional content can go here for scrolling */}
        <section className="h-[50vh] flex items-center justify-center p-20 bg-transparent text-[#1a1a1a]">
          <div className="max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-8 italic">The Pursuit of Excellence</h2>
            <p className="text-xl leading-relaxed opacity-70">
              Lewis Hamilton is a British racing driver who is widely considered one of the greatest drivers in the history of the sport. He has won a joint-record seven Formula One World Drivers' Championship titles, and holds the records for the most wins, pole positions, and podium finishes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
