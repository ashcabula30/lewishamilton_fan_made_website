import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three';

type Props = {
  portraitSrc: string;
  depthSrc: string;
  /** UV displacement strength (premium subtle): 0.005–0.04 */
  displacement?: number;
  /** Optional vertex Z displacement (very subtle): 0.0–0.03 */
  zDisplacement?: number;
  /** Cursor position in pixels */
  mouse?: { x: number; y: number };
  /** Toggle to test both depth directions */
  invertDepth?: boolean;
};

const vertexShader = /* glsl */ `
  uniform sampler2D uDepth;
  uniform vec2 uTexel;
  uniform float uZDisp;
  uniform vec2 uMouseNdc;
  uniform float uInvertDepth;

  varying vec2 vUv;

  float depthFiltered(vec2 uv) {
    // Mild 9-tap blur to avoid jaggy displacement artifacts
    float s = 0.0;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0,  1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0,  1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0,  1.0)).r;
    return s / 9.0;
  }

  void main() {
    vUv = uv;
    vec3 p = position;

    // Subtle vertex depth relief (kept extremely low and smoothed)
    float d = depthFiltered(uv);
    d = mix(d, 1.0 - d, uInvertDepth);
    d = smoothstep(0.10, 0.92, d);
    d = pow(d, 1.12);
    float centered = d - 0.5;

    // Soft cursor gating so geometry doesn't feel "floaty" everywhere
    vec2 mouseUv = uMouseNdc * 0.5 + 0.5;
    float dist = distance(uv, mouseUv);
    float falloff = smoothstep(0.80, 0.18, dist);
    falloff = falloff * falloff;

    p.z += centered * uZDisp * mix(0.35, 1.0, falloff);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uPortrait;
  uniform sampler2D uDepth;
  uniform float uDisp;
  uniform vec2 uMouseNdc;
  uniform vec2 uTexel;
  uniform float uInvertDepth;

  varying vec2 vUv;

  float depthFiltered(vec2 uv) {
    // Mild 9-tap blur to avoid jaggy displacement artifacts
    float s = 0.0;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0, -1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0,  0.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2(-1.0,  1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 0.0,  1.0)).r;
    s += texture2D(uDepth, uv + uTexel * vec2( 1.0,  1.0)).r;
    return s / 9.0;
  }

  float alphaFiltered(vec2 uv) {
    // Slight alpha blur to soften cutout edges / halos
    float s = 0.0;
    s += texture2D(uPortrait, uv + uTexel * vec2(-1.0, -1.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 0.0, -1.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 1.0, -1.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2(-1.0,  0.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 0.0,  0.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 1.0,  0.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2(-1.0,  1.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 0.0,  1.0)).a;
    s += texture2D(uPortrait, uv + uTexel * vec2( 1.0,  1.0)).a;
    return s / 9.0;
  }

  void main() {
    // Cursor -> UV space for a soft displacement bubble (affects displacement only)
    vec2 mouseUv = uMouseNdc * 0.5 + 0.5;
    float dist = distance(vUv, mouseUv);
    float falloff = smoothstep(0.70, 0.12, dist);
    falloff = falloff * falloff;

    // Depth strictly drives UV displacement only
    float d = depthFiltered(vUv);
    d = mix(d, 1.0 - d, uInvertDepth);
    d = smoothstep(0.10, 0.92, d);
    d = pow(d, 1.12);
    float centered = d - 0.5;

    // Foreground moves a touch more than torso/background (depth-weighted)
    float fg = smoothstep(0.55, 0.92, d);
    float depthWeight = mix(0.45, 1.0, fg);

    // Minimal, cinematic parallax (depth only affects displacement)
    vec2 offset = uMouseNdc * (uDisp * falloff) * centered * depthWeight;
    vec2 uv = clamp(vUv + offset, vec2(0.001), vec2(0.999));

    // Final output is ONLY the portrait texture
    vec4 col = texture2D(uPortrait, uv);

    // De-halo at semi-transparent edges by un-matting RGB a bit
    float a0 = max(col.a, 0.001);
    vec3 rgb = mix(col.rgb, clamp(col.rgb / max(a0, 0.06), 0.0, 1.0), step(col.a, 0.98));

    // Feather edges + soft bottom blend (aggressive, editorial)
    float aBlur = alphaFiltered(uv);
    float a = smoothstep(0.10, 0.86, aBlur);
    float bottom = smoothstep(0.0, 0.12, vUv.y);
    a *= bottom;

    // Asymmetric side feather to hide the rough left-side crop without over-softening the right edge
    float leftFeather = smoothstep(0.02, 0.18, uv.x);
    float rightFeather = smoothstep(0.0, 0.07, 1.0 - uv.x);
    a *= leftFeather * rightFeather;

    gl_FragColor = vec4(rgb, a);
  }
`;

export const CinematicDepthPortrait: React.FC<Props> = ({
  portraitSrc,
  depthSrc,
  displacement = 0.018,
  zDisplacement = 0.018,
  mouse,
  invertDepth = false,
}) => {
  const [portraitTex, depthTex] = useTexture([portraitSrc, depthSrc]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  useMemo(() => {
    portraitTex.colorSpace = THREE.SRGBColorSpace;
    portraitTex.wrapS = THREE.ClampToEdgeWrapping;
    portraitTex.wrapT = THREE.ClampToEdgeWrapping;
    portraitTex.minFilter = THREE.LinearFilter;
    portraitTex.magFilter = THREE.LinearFilter;
    portraitTex.generateMipmaps = true;
    portraitTex.needsUpdate = true;

    depthTex.colorSpace = THREE.NoColorSpace;
    depthTex.wrapS = THREE.ClampToEdgeWrapping;
    depthTex.wrapT = THREE.ClampToEdgeWrapping;
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.generateMipmaps = false;
    depthTex.needsUpdate = true;
  }, [portraitTex, depthTex]);

  const imgW = (portraitTex.image as { width: number; height: number } | undefined)?.width ?? 1;
  const imgH = (portraitTex.image as { width: number; height: number } | undefined)?.height ?? 1;

  // Slightly oversized to feel "hero"
  const scale = useAspect(imgW, imgH, Math.min(1.25, viewport.width * 0.9));

  const uniforms = useMemo(
    () => ({
      uPortrait: { value: portraitTex },
      uDepth: { value: depthTex },
      uDisp: { value: displacement },
      uZDisp: { value: zDisplacement },
      uMouseNdc: { value: new THREE.Vector2(0, 0) },
      uTexel: { value: new THREE.Vector2(1 / Math.max(1, imgW), 1 / Math.max(1, imgH)) },
      uInvertDepth: { value: invertDepth ? 1.0 : 0.0 },
    }),
    [portraitTex, depthTex, displacement, zDisplacement, imgW, imgH, invertDepth]
  );

  useFrame((_state, dt) => {
    if (!materialRef.current) return;
    const mx = mouse ? (mouse.x / window.innerWidth) * 2 - 1 : 0;
    const my = mouse ? -((mouse.y / window.innerHeight) * 2 - 1) : 0;

    // Cinematic smoothing (critically damped-ish)
    const cur = materialRef.current.uniforms.uMouseNdc.value as THREE.Vector2;
    cur.x = THREE.MathUtils.damp(cur.x, mx, 6.5, dt);
    cur.y = THREE.MathUtils.damp(cur.y, my, 6.5, dt);
  });

  return (
    <mesh scale={scale} renderOrder={1}>
      <planeGeometry args={[1, 1, 160, 160]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthTest={true}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};
