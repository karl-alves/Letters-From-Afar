import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { RefObject } from 'react'
import type { PointerState } from '../hooks/usePointer'
import { starFragmentShader, starVertexShader } from './starShader'

type StarfieldProps = {
  pointer: RefObject<PointerState>
  reducedMotion: boolean
}

function starCountForViewport(width: number) {
  if (width < 640) return 1398
  if (width < 1024) return 2098
  return 2797
}

function createStarGeometry(count: number, aspect: number) {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const depths = new Float32Array(count)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)
  const tints = new Float32Array(count * 3)

  const tintPalette: [number, number, number][] = [
    [1.0, 1.0, 1.0],
    [0.82, 0.9, 1.0],
    [0.78, 0.86, 1.0],
    [1.0, 0.96, 0.88],
    [0.95, 0.97, 1.0],
  ]

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // Spread slightly beyond frustum so lens edges stay populated
    positions[i3] = (Math.random() * 2 - 1) * aspect * 1.15
    positions[i3 + 1] = (Math.random() * 2 - 1) * 1.15
    positions[i3 + 2] = -1 - Math.random() * 4

    // Weighted sizes: most tiny, few bright
    const r = Math.random()
    sizes[i] = r < 0.75 ? 0.15 + Math.random() * 0.25 : 0.4 + Math.random() * 0.75

    depths[i] = Math.random()
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.4 + Math.random() * 1.8

    const tint = tintPalette[Math.floor(Math.random() * tintPalette.length)]!
    tints[i3] = tint[0]
    tints[i3 + 1] = tint[1]
    tints[i3 + 2] = tint[2]
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aDepth', new THREE.BufferAttribute(depths, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 3))
  return geometry
}

export function Starfield({ pointer, reducedMotion }: StarfieldProps) {
  const { size, gl } = useThree()
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const smoothedMouse = useRef(new THREE.Vector2(0, 0))
  const lensStrength = useRef(0)

  const aspect = Math.max(size.width / Math.max(size.height, 1), 0.5)
  const count = starCountForViewport(size.width)

  const aspectBucket = Math.round(aspect * 10)

  const geometry = useMemo(
    () => createStarGeometry(count, aspectBucket / 10),
    [count, aspectBucket],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uLensRadius: { value: 0.48 },
      uLensStrength: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uReducedMotion: { value: reducedMotion ? 1 : 0 },
    }),
    [gl, reducedMotion],
  )

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (!mat) return

    if (!reducedMotion) {
      mat.uniforms.uTime!.value += delta
    }

    const target = pointer.current
    const desiredStrength = target?.active && !reducedMotion ? 0.63 : 0
    lensStrength.current = THREE.MathUtils.damp(
      lensStrength.current,
      desiredStrength,
      4,
      delta,
    )

    if (target) {
      smoothedMouse.current.x = THREE.MathUtils.damp(
        smoothedMouse.current.x,
        target.x,
        8,
        delta,
      )
      smoothedMouse.current.y = THREE.MathUtils.damp(
        smoothedMouse.current.y,
        target.y,
        8,
        delta,
      )
    }

    mat.uniforms.uMouse!.value.copy(smoothedMouse.current)
    mat.uniforms.uLensStrength!.value = lensStrength.current
    mat.uniforms.uPixelRatio!.value = Math.min(gl.getPixelRatio(), 2)
    mat.uniforms.uReducedMotion!.value = reducedMotion ? 1 : 0
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
