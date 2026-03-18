import React from 'react';
import Hyperspeed from './reactbits/Hyperspeed';
import { hyperspeedPresets } from './reactbits/HyperSpeedPresets';

const HyperspeedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-20] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-95">
        <Hyperspeed effectOptions={hyperspeedPresets.three} />
      </div>
    </div>
  );
};

export default HyperspeedBackground;
