import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import HeroHelmet from './HeroHelmet';

type HelmetWireframeLayerProps = {
  mouse: { x: number; y: number };
  revealEnabled?: boolean;
};

const HelmetWireframeLayer: React.FC<HelmetWireframeLayerProps> = ({
  mouse,
  revealEnabled = true,
}) => {
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 1.65], fov: 38 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <Suspense fallback={null}>
          <HeroHelmet
            mouse={mouse}
            showSolid={false}
            showWireframe
            wireframeRevealEnabled={revealEnabled}
          />
          <Environment preset="studio" environmentIntensity={0.2} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HelmetWireframeLayer;
