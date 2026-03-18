import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import HeroHelmet from './HeroHelmet';

type HelmetRevealLayerProps = {
  mouse: { x: number; y: number };
};

const HelmetRevealLayer: React.FC<HelmetRevealLayerProps> = ({ mouse }) => {
  const hasMouse = mouse.x !== 0 || mouse.y !== 0;
  const revealX = hasMouse ? `${mouse.x}px` : '-240px';
  const revealY = hasMouse ? `${mouse.y}px` : '-240px';

  const maskStyle = useMemo(
    () =>
      ({
        WebkitMaskImage: `radial-gradient(circle 180px at ${revealX} ${revealY}, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 92px, rgba(0,0,0,0.72) 132px, rgba(0,0,0,0.22) 176px, rgba(0,0,0,0) 230px)`,
        maskImage: `radial-gradient(circle 180px at ${revealX} ${revealY}, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 92px, rgba(0,0,0,0.72) 132px, rgba(0,0,0,0.22) 176px, rgba(0,0,0,0) 230px)`,
      }) satisfies React.CSSProperties,
    [revealX, revealY]
  );

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none" style={maskStyle}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 1.65], fov: 38 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[1.8, 2.5, 3.5]} intensity={1.6} />
        <directionalLight position={[-1.6, 1.1, 1.8]} intensity={0.4} color="#ffd8c4" />
        <Suspense fallback={null}>
          <HeroHelmet mouse={mouse} />
          <Environment preset="studio" environmentIntensity={0.55} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HelmetRevealLayer;
