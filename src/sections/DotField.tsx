import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const COUNT = 2500
const COLS = 50
const ROWS = 50

const vertexShader = `
uniform float uTime;
uniform float uOffset;
uniform float uAmplitude;
uniform float uWaveSpeed;
uniform float uNoiseStrength;

attribute vec3 aPosition;
attribute vec2 aRowCol;
attribute float aPhase;
attribute float aSpeed;
attribute float aScale;
attribute float aColorIndex;

varying vec3 vColor;
varying float vFogDepth;

const vec3 color0 = vec3(0.79, 0.66, 0.49);
const vec3 color1 = vec3(0.29, 0.49, 0.35);
const vec3 color2 = vec3(0.55, 0.45, 0.33);
const vec3 color3 = vec3(0.96, 0.95, 0.93);

vec3 mod289v3(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289v2(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289v3(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
           + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
               dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float t = uTime * uWaveSpeed;
  float rowPhase = aRowCol.x * 0.08 + aPhase * 6.28;
  float colPhase = aRowCol.y * 0.12;
  float wave = sin(t * aSpeed + rowPhase + colPhase) * uAmplitude;
  float noiseVal = fbm(aPosition.xy * 1.5 + t * 0.2);
  vec2 drift = vec2(sin(noiseVal * 3.14159), cos(noiseVal * 3.14159)) * uNoiseStrength;
  vec3 pos = aPosition + vec3(drift.x, wave + drift.y, 0.0);
  float offsetEffect = sin(t * 0.5 + aPhase * 6.28) * 0.3;
  pos.x += uOffset * (1.0 + offsetEffect);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float ps = gl_Position.w + 1.0;
  ps = clamp(1.0 / ps, 0.0, 1.0);
  gl_PointSize = ps * 5.0 * aScale;
  float ci = mod(aColorIndex, 4.0);
  vec3 paletteColor;
  if (ci < 1.0) paletteColor = color0;
  else if (ci < 2.0) paletteColor = color1;
  else if (ci < 3.0) paletteColor = color2;
  else paletteColor = color3;
  vColor = paletteColor;
  vFogDepth = -mvPosition.z;
}
`

const fragmentShader = `
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vColor;
varying float vFogDepth;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float alpha = 1.0 - smoothstep(0.35, 0.5, dist);
  if (alpha < 0.01) discard;
  float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);
  gl_FragColor = vec4(mix(vColor, uFogColor, fogFactor), alpha);
}
`

export default function DotField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, targetOffset: 0, currentOffset: 0 })

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOffset: { value: 0 },
    uAmplitude: { value: 0.55 },
    uWaveSpeed: { value: 0.7 },
    uNoiseStrength: { value: 0.4 },
    uFogColor: { value: new THREE.Vector3(0.05, 0.04, 0.04) },
    uFogNear: { value: 2.0 },
    uFogFar: { value: 8.0 },
  }), [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x0d0b0a, 1)
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0'
    renderer.domElement.style.left = '0'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.zIndex = '0'
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      container.offsetWidth / container.offsetHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 5.2)

    // Create instanced mesh
    const geometry = new THREE.SphereGeometry(0.06, 8, 8)
    const positions = new Float32Array(COUNT * 3)
    const rowCols = new Float32Array(COUNT * 2)
    const phases = new Float32Array(COUNT)
    const speeds = new Float32Array(COUNT)
    const scales = new Float32Array(COUNT)
    const colorIndices = new Float32Array(COUNT)

    const spacing = 0.14
    let idx = 0
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (idx >= COUNT) break
        const x = (col - COLS / 2) * spacing + (Math.random() - 0.5) * 0.08
        const y = (row - ROWS / 2) * spacing + (Math.random() - 0.5) * 0.08
        const z = (Math.random() - 0.5) * 0.02
        positions[idx * 3] = x
        positions[idx * 3 + 1] = y
        positions[idx * 3 + 2] = z
        rowCols[idx * 2] = row
        rowCols[idx * 2 + 1] = col
        phases[idx] = Math.random()
        speeds[idx] = 0.6 + Math.random() * 0.8
        scales[idx] = 0.5 + Math.random()
        colorIndices[idx] = Math.floor(Math.random() * 4)
        idx++
      }
    }

    geometry.setAttribute('aPosition', new THREE.InstancedBufferAttribute(positions, 3))
    geometry.setAttribute('aRowCol', new THREE.InstancedBufferAttribute(rowCols, 2))
    geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1))
    geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1))
    geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1))
    geometry.setAttribute('aColorIndex', new THREE.InstancedBufferAttribute(colorIndices, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const mesh = new THREE.InstancedMesh(geometry, material, COUNT)
    // Set identity matrix for each instance
    const dummy = new THREE.Matrix4()
    for (let i = 0; i < COUNT; i++) {
      mesh.setMatrixAt(i, dummy)
    }
    mesh.instanceMatrix.needsUpdate = true
    scene.add(mesh)

    const clock = new THREE.Clock()

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      if (!container) return
      const w = container.offsetWidth
      const h = container.offsetHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      uniforms.uTime.value = elapsed

      // Lerp offset toward mouse
      mouseRef.current.targetOffset = mouseRef.current.x * 0.003
      mouseRef.current.currentOffset += (mouseRef.current.targetOffset - mouseRef.current.currentOffset) * 0.05
      uniforms.uOffset.value = mouseRef.current.currentOffset

      // Auto-rotate camera
      camera.position.x = Math.sin(elapsed * 0.05) * 0.04
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [uniforms])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
