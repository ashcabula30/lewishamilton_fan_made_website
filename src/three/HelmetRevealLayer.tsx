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
    () => {
      const blobMask = [
        `radial-gradient(ellipse 220px 190px at ${revealX} ${revealY}, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 42%, rgba(0,0,0,0.84) 58%, rgba(0,0,0,0.34) 76%, rgba(0,0,0,0) 100%)`,
        `radial-gradient(circle 150px at calc(${revealX} - 92px) calc(${revealY} + 38px), rgba(0,0,0,0.98) 0px, rgba(0,0,0,0.98) 48%, rgba(0,0,0,0.38) 74%, rgba(0,0,0,0) 100%)`,
        `radial-gradient(circle 122px at calc(${revealX} + 104px) calc(${revealY} - 24px), rgba(0,0,0,0.95) 0px, rgba(0,0,0,0.95) 44%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0) 100%)`,
        `radial-gradient(circle 88px at calc(${revealX} - 128px) calc(${revealY} - 52px), rgba(0,0,0,0.78) 0px, rgba(0,0,0,0.78) 44%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)`,
      ].join(', ');

      return {
        WebkitMaskImage: blobMask,
        maskImage: blobMask,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      } satisfies React.CSSProperties;
    },
    [revealX, revealY]
  );

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none" style={maskStyle}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 1.65], fov: 38 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.72} />
        <directionalLight position={[1.8, 2.5, 3.5]} intensity={0.95} color="#f5efe2" />
        <directionalLight position={[-1.6, 1.1, 1.8]} intensity={0.28} color="#ffd8c4" />
        <Suspense fallback={null}>
          <HeroHelmet mouse={mouse} />
          <Environment preset="studio" environmentIntensity={0.32} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HelmetRevealLayer;
