import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import helmetModelPath from '../assets/f1_helmet.glb';

type HeroHelmetProps = {
  mouse?: { x: number; y: number };
};

const HeroHelmet: React.FC<HeroHelmetProps> = ({ mouse }) => {
  const { scene } = useGLTF(helmetModelPath);
  const helmet = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const { center, fitScale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(helmet);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    return {
      center,
      fitScale: 1 / Math.max(size.x, size.y, size.z, 0.001),
    };
  }, [helmet]);

  useMemo(() => {
    helmet.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = false;
      child.receiveShadow = false;
      child.renderOrder = 20;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = materials.map((material) => {
        const clonedMaterial = material.clone() as THREE.MeshPhysicalMaterial;

        clonedMaterial.transparent = false;
        clonedMaterial.opacity = 1;
        clonedMaterial.depthWrite = true;
        clonedMaterial.depthTest = true;
        clonedMaterial.envMapIntensity = 0.42;
        clonedMaterial.roughness = Math.max(clonedMaterial.roughness, 0.28);
        clonedMaterial.metalness = Math.min(clonedMaterial.metalness, 0.72);
        clonedMaterial.needsUpdate = true;

        return clonedMaterial;
      });

      child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
    });
  }, [helmet]);

  useFrame((_state, dt) => {
    if (!groupRef.current) return;

    const hasMouse = !!mouse && (mouse.x !== 0 || mouse.y !== 0);
    const tx = hasMouse ? (mouse.x / window.innerWidth) * 2 - 1 : 0;
    const ty = hasMouse ? (mouse.y / window.innerHeight) * 2 - 1 : 0;

    groupRef.current.position.set(-0.03, 0.08, 0.9);
    groupRef.current.scale.setScalar(0.25 * fitScale);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0.08 - ty * 0.035, 5, dt);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, 3.1 + tx * 0.08, 5, dt);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, tx * -0.015, 5, dt);
  });

  return (
    <group ref={groupRef} position={[-0.03, 0.08, 0.9]} scale={0.25 * fitScale}>
      <primitive object={helmet} position={[-center.x, -center.y, -center.z]} />
    </group>
  );
};

useGLTF.preload(helmetModelPath);

export default HeroHelmet;
