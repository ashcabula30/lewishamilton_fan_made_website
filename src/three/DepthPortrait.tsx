import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three';

type Props = {
  depthSrc: string;
  displacement?: number;
  reliefStrength?: number;
  mouse?: { x: number; y: number };
};

const vertexShader = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDisplacement;
  uniform vec2 uMouseNdc;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vDepth = d;

    vec3 p = position;
    p.z += (d - 0.5) * uDisplacement;

    // Subtle "tilt" so depth reads better with mouse movement
    p.xy += uMouseNdc * 0.02 * (d - 0.3) * uDisplacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uReliefStrength;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // Derive a pseudo-normal from depth gradients (cheap relief shading)
    float dC = texture2D(uDepth, vUv).r;
    float dX = texture2D(uDepth, vUv + vec2(0.0015, 0.0)).r - dC;
    float dY = texture2D(uDepth, vUv + vec2(0.0, 0.0015)).r - dC;
    vec3 n = normalize(vec3(-dX * uReliefStrength, -dY * uReliefStrength, 1.0));

    vec3 lightDir = normalize(vec3(-0.35, 0.45, 0.85));
    float diff = clamp(dot(n, lightDir) * 0.9 + 0.1, 0.0, 1.0);

    // Map depth to a classy monochrome ramp
    vec3 base = mix(vec3(0.05), vec3(0.92), smoothstep(0.08, 0.95, vDepth));
    vec3 color = base * diff;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const DepthPortrait: React.FC<Props> = ({
  depthSrc,
  displacement = 0.55,
  reliefStrength = 90.0,
  mouse,
}) => {
  const depthTex = useTexture(depthSrc);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Configure depth texture for sampling
  useMemo(() => {
    depthTex.wrapS = THREE.ClampToEdgeWrapping;
    depthTex.wrapT = THREE.ClampToEdgeWrapping;
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.generateMipmaps = false;
    depthTex.needsUpdate = true;
  }, [depthTex]);

  const scale = useAspect(
    (depthTex.image as { width: number; height: number } | undefined)?.width ?? 1,
    (depthTex.image as { width: number; height: number } | undefined)?.height ?? 1,
    1.15
  );

  useFrame(() => {
    if (!materialRef.current) return;
    const x = mouse ? (mouse.x / window.innerWidth) * 2 - 1 : 0;
    const y = mouse ? -((mouse.y / window.innerHeight) * 2 - 1) : 0;
    materialRef.current.uniforms.uMouseNdc.value.set(x, y);
  });

  const uniforms = useMemo(
    () => ({
      uDepth: { value: depthTex },
      uDisplacement: { value: displacement },
      uReliefStrength: { value: reliefStrength },
      uMouseNdc: { value: new THREE.Vector2(0, 0) },
    }),
    [depthTex, displacement, reliefStrength]
  );

  return (
    <mesh scale={scale}>
      <planeGeometry args={[1, 1, 256, 256]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        depthWrite={false}
      />
    </mesh>
  );
};

