import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import helmetModelPath from '../assets/f1_helmet.glb';

const HeroHelmet: React.FC = () => {
  const { scene } = useGLTF(helmetModelPath);
  const helmet = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const { center, fitScale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(helmet);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z, 0.001);

    return {
      center,
      fitScale: 1 / maxAxis,
    };
  }, [helmet]);

  useMemo(() => {
    helmet.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.renderOrder = 20;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          material.transparent = true;
          material.depthWrite = false;
          material.depthTest = false;
          material.opacity = 1;
        });
      }
    });
  }, [helmet]);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.renderOrder = 50;
    groupRef.current.visible = true;
    groupRef.current.position.set(-0.03, 0.08, 0.9);
    groupRef.current.scale.setScalar(0.25 * fitScale);
    groupRef.current.rotation.set(0.1, 3.1, 0);
  });

  return (
    <group ref={groupRef} position={[0.02, 0.1, 0.9]} scale={0.25 * fitScale} visible={true}>
      <primitive object={helmet} position={[-center.x, -center.y, -center.z]} />
    </group>
  );
};

useGLTF.preload(helmetModelPath);

export default HeroHelmet;
