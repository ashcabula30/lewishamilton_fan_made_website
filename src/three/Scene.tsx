import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import ferrariModelPath from '../assets/scuderia_ferrari_hp_2026_concept.glb';

const FerrariModel: React.FC = () => {
  const { scene } = useGLTF(ferrariModelPath);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive 
        ref={meshRef}
        object={scene} 
        scale={12.0} 
        position={[4, -4, -10]} 
        rotation={[0, -Math.PI / 6, 0]}
      />
    </Float>
  );
};

const ThreeScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={2.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={4} />
        <pointLight position={[-10, -10, -10]} intensity={2} />
        <Suspense fallback={null}>
          <FerrariModel />
          <Environment preset="city" />
          <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={40} blur={2.5} far={4.5} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
