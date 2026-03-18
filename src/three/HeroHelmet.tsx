import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import helmetModelPath from '../assets/f1_helmet.glb';

type WireframeShader = {
  uniforms: Record<string, { value: unknown }>;
};

const WIREFRAME_REVEAL_SPEED = 0.72;
const WIREFRAME_FADE_DELAY = 0.35;
const WIREFRAME_FADE_DURATION = 1.15;
const WIREFRAME_LOOP_GAP = 0.25;
const WIREFRAME_LOOP_DURATION =
  1 / WIREFRAME_REVEAL_SPEED + WIREFRAME_FADE_DELAY + WIREFRAME_FADE_DURATION + WIREFRAME_LOOP_GAP;

type HeroHelmetProps = {
  mouse?: { x: number; y: number };
  showSolid?: boolean;
  showWireframe?: boolean;
  wireframeRevealEnabled?: boolean;
};

const HeroHelmet: React.FC<HeroHelmetProps> = ({
  mouse,
  showSolid = true,
  showWireframe = true,
  wireframeRevealEnabled = true,
}) => {
  const { scene } = useGLTF(helmetModelPath);
  const helmet = useMemo(() => scene.clone(true), [scene]);
  const wireframeHelmet = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const wireframeShadersRef = useRef<WireframeShader[]>([]);
  const wireframeRevealStartTimeRef = useRef<number | null>(null);
  const { center, fitScale, minY, maxY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(helmet);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    return {
      center,
      fitScale: 1 / Math.max(size.x, size.y, size.z, 0.001),
      minY: box.min.y,
      maxY: box.max.y,
    };
  }, [helmet]);

  useEffect(() => {
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

  useEffect(() => {
    wireframeShadersRef.current = [];
    wireframeHelmet.updateMatrixWorld(true);

    wireframeHelmet.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = false;
      child.receiveShadow = false;
      child.renderOrder = 40;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const wireframeMaterials = materials.map((material) => {
        const wireframeMaterial = material.clone() as THREE.MeshPhysicalMaterial;

        wireframeMaterial.color = new THREE.Color('#d6c7a1');
        wireframeMaterial.wireframe = true;
        wireframeMaterial.transparent = true;
        wireframeMaterial.opacity = 0.009;
        wireframeMaterial.depthWrite = false;
        wireframeMaterial.depthTest = true;
        wireframeMaterial.blending = THREE.AdditiveBlending;
        wireframeMaterial.toneMapped = true;
        wireframeMaterial.roughness = 0.5;
        wireframeMaterial.metalness = 0;
        wireframeMaterial.onBeforeCompile = (shader) => {
          const meshToHelmetMatrix = child.matrixWorld.clone();
          const revealSpan = maxY - minY;

          shader.uniforms.uRevealTime = { value: 0 };
          shader.uniforms.uRevealMinY = { value: minY };
          shader.uniforms.uRevealMaxY = { value: maxY };
          shader.uniforms.uRevealBand = { value: Math.max(revealSpan * 0.16, 0.06) };
          shader.uniforms.uRevealTail = { value: Math.max(revealSpan * 0.22, 0.09) };
          shader.uniforms.uRevealFeather = { value: Math.max(revealSpan * 0.24, 0.08) };
          shader.uniforms.uRevealColor = { value: new THREE.Color('#f8edc4') };
          shader.uniforms.uHelmetMatrix = { value: meshToHelmetMatrix };

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
uniform mat4 uHelmetMatrix;
varying vec3 vHelmetPosition;`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
vHelmetPosition = (uHelmetMatrix * vec4(position, 1.0)).xyz;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
uniform float uRevealTime;
uniform float uRevealMinY;
uniform float uRevealMaxY;
uniform float uRevealBand;
uniform float uRevealTail;
uniform float uRevealFeather;
uniform vec3 uRevealColor;
varying vec3 vHelmetPosition;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `float revealSpeed = ${WIREFRAME_REVEAL_SPEED.toFixed(2)};
float revealProgress = clamp(uRevealTime * revealSpeed, 0.0, 1.0);
float fadeDelay = ${WIREFRAME_FADE_DELAY.toFixed(2)};
float fadeDuration = ${WIREFRAME_FADE_DURATION.toFixed(2)};
float fadeProgress = clamp((uRevealTime - (1.0 / revealSpeed + fadeDelay)) / fadeDuration, 0.0, 1.0);
float introEase = smoothstep(0.0, 1.0, revealProgress);
float exitEase = smoothstep(0.0, 1.0, fadeProgress);
float dissolveNoise = hash13(vec3(
  vHelmetPosition.xy * 8.5 + vHelmetPosition.z * 1.9,
  floor(uRevealTime * 18.0) * 0.041 + vHelmetPosition.y * 0.23
));
float secondaryNoise = hash13(vec3(
  vHelmetPosition.zy * 11.0 + vHelmetPosition.x * 2.1,
  floor((uRevealTime + 1.7) * 14.0) * 0.037
));
float combinedNoise = mix(dissolveNoise, secondaryNoise, 0.34);
float introThreshold = mix(1.08, -0.14, introEase);
float exitThreshold = mix(-0.14, 1.08, exitEase);
float dissolveInMask = smoothstep(introThreshold - 0.16, introThreshold + 0.12, combinedNoise);
float dissolveOutMask = smoothstep(exitThreshold - 0.12, exitThreshold + 0.16, combinedNoise);
float visibleMask = dissolveInMask * dissolveOutMask;
float introRim = (1.0 - smoothstep(0.0, 0.11, abs(combinedNoise - introThreshold))) * introEase * (1.0 - fadeProgress);
float exitRim = (1.0 - smoothstep(0.0, 0.11, abs(combinedNoise - exitThreshold))) * fadeProgress;
float animatedSignal = 0.94 + 0.06 * sin(vHelmetPosition.y * 148.0 - uRevealTime * 10.5 + combinedNoise * 6.2831);
float signal = mix(0.88, 1.12, dissolveNoise) * animatedSignal;
float baseWireAlpha = 0.56 * visibleMask;
float energy = 1.0 - fadeProgress * 0.24;
diffuseColor.a *= (baseWireAlpha + introRim * 0.34 + exitRim * 0.3) * signal * energy;
if (diffuseColor.a <= 0.00008) discard;
outgoingLight += uRevealColor * ((visibleMask * 0.2 + introRim * 0.78 + exitRim * 0.68) * energy) * signal;
outgoingLight *= 1.0 + (visibleMask * 0.08 + introRim * 0.18 + exitRim * 0.16) * energy;
#include <dithering_fragment>`
          );

          wireframeShadersRef.current.push(shader as WireframeShader);
        };
        wireframeMaterial.needsUpdate = true;

        return wireframeMaterial;
      });

      child.material = Array.isArray(child.material) ? wireframeMaterials : wireframeMaterials[0];
    });
  }, [maxY, minY, wireframeHelmet]);

  useFrame((state, dt) => {
    if (!groupRef.current) return;

    const hasMouse = !!mouse && (mouse.x !== 0 || mouse.y !== 0);
    const tx = hasMouse ? (mouse.x / window.innerWidth) * 2 - 1 : 0;
    const ty = hasMouse ? (mouse.y / window.innerHeight) * 2 - 1 : 0;

    groupRef.current.position.set(-0.03, 0.08, 0.9);
    groupRef.current.scale.setScalar(0.25 * fitScale);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0.08 - ty * 0.035, 5, dt);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, 3.1 + tx * 0.08, 5, dt);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, tx * -0.015, 5, dt);

    if (!wireframeRevealEnabled) {
      wireframeRevealStartTimeRef.current = null;
    } else if (wireframeRevealStartTimeRef.current === null) {
      wireframeRevealStartTimeRef.current = state.clock.getElapsedTime();
    }

    const revealTime = wireframeRevealEnabled && wireframeRevealStartTimeRef.current !== null
      ? (state.clock.getElapsedTime() - wireframeRevealStartTimeRef.current) % WIREFRAME_LOOP_DURATION
      : 0;

    for (const shader of wireframeShadersRef.current) {
      // eslint-disable-next-line react-hooks/immutability
      shader.uniforms.uRevealTime.value = revealTime;
    }
  });

  return (
    <group ref={groupRef} position={[-0.03, 0.08, 0.9]} scale={0.25 * fitScale}>
      {showSolid ? (
        <primitive object={helmet} position={[-center.x, -center.y, -center.z]} />
      ) : null}
      {showWireframe ? (
        <primitive object={wireframeHelmet} position={[-center.x, -center.y, -center.z]} />
      ) : null}
    </group>
  );
};

useGLTF.preload(helmetModelPath);

export default HeroHelmet;
