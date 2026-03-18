import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import ferrariModelPath from '../assets/scuderia_ferrari_hp_2026_concept.glb';

const FerrariModel: React.FC = () => {
  const { scene } = useGLTF(ferrariModelPath);
  const meshRef = useRef<THREE.Group>(null);
  const baseRotationX = 0;
  const baseRotationY = -Math.PI / 2.0;
  const baseRotationZ = 0;
  const showcaseSpinSpeed = 0.28;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = baseRotationX;
      meshRef.current.rotation.y = baseRotationY + state.clock.getElapsedTime() * showcaseSpinSpeed;
      meshRef.current.rotation.z = baseRotationZ;
      meshRef.current.position.set(0, -0.4, 0);
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={75.0}
      position={[0, -0.4, 0]}
      rotation={[baseRotationX, baseRotationY, baseRotationZ]}
    />
  );
};

const CinematicCameraRig: React.FC = () => {
  // Subtle background motion slower than portrait
  useFrame((state, dt) => {
    const { camera, pointer } = state;
    const tx = pointer.x * 0.35;
    const ty = pointer.y * 0.18;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2.6, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.2 + ty, 2.6, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const ThreeScene: React.FC = () => {
  return (
    <div
      className="absolute inset-0 z-[-10] pointer-events-none"
      style={{ filter: 'saturate(0.9) brightness(0.96) contrast(0.96)', opacity: 0.9 }}
    >
      <Canvas camera={{ position: [0, 0.2, 13], fov: 52 }}>
        <CinematicCameraRig />
        <ambientLight intensity={2.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={4} />
        <pointLight position={[-10, -10, -10]} intensity={2} />
        <Suspense fallback={null}>
          <FerrariModel />
          <Environment preset="city" />
          <ContactShadows position={[0, -3.2, 0]} opacity={0.4} scale={50} blur={2.5} far={10} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
