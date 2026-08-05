import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const TRAIL_POINTS = 16
const MAX_METEORS = 2

type Meteor = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  trailLen: number
}

function createIdleMeteor(): Meteor {
  return {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1,
    trailLen: 0.2,
  }
}

function spawnMeteor(aspect: number): Meteor {
  const corners: [number, number][] = [
    [-aspect * 1.05, 1.05],
    [aspect * 1.05, 1.05],
    [-aspect * 1.05, -1.05],
    [aspect * 1.05, -1.05],
  ]
  const [x, y] = corners[Math.floor(Math.random() * corners.length)]!

  // Aim inward across the sky, with a bit of angle variation
  const towardX = -x * (0.55 + Math.random() * 0.35)
  const towardY = -y * (0.55 + Math.random() * 0.35)
  const angle =
    Math.atan2(towardY - y, towardX - x) + (Math.random() - 0.5) * 0.45

  const speed = 1.05 + Math.random() * 0.45
  return {
    active: true,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 1.4 + Math.random() * 0.7,
    trailLen: 0.22 + Math.random() * 0.12,
  }
}

function createTrailLine() {
  const positions = new Float32Array(TRAIL_POINTS * 3)
  const colors = new Float32Array(TRAIL_POINTS * 4)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4))

  const mat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

  const line = new THREE.Line(geo, mat)
  line.frustumCulled = false
  line.visible = false
  return line
}

function createHeadPoint() {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3),
  )
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 8,
    sizeAttenuation: false,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    opacity: 0,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  points.visible = false
  return points
}

type ShootingStarsProps = {
  reducedMotion: boolean
}

export function ShootingStars({ reducedMotion }: ShootingStarsProps) {
  const { size } = useThree()
  const aspect = Math.max(size.width / Math.max(size.height, 1), 0.5)

  const meteors = useRef<Meteor[]>(
    Array.from({ length: MAX_METEORS }, () => createIdleMeteor()),
  )
  const cooldown = useRef(7)

  const trails = useMemo(
    () => Array.from({ length: MAX_METEORS }, () => createTrailLine()),
    [],
  )
  const heads = useMemo(
    () => Array.from({ length: MAX_METEORS }, () => createHeadPoint()),
    [],
  )

  useFrame((_, delta) => {
    if (reducedMotion) {
      for (let i = 0; i < MAX_METEORS; i++) {
        meteors.current[i]!.active = false
        trails[i]!.visible = false
        heads[i]!.visible = false
      }
      return
    }

    cooldown.current -= delta
    if (cooldown.current <= 0) {
      const slot = meteors.current.findIndex((m) => !m.active)
      if (slot !== -1) {
        meteors.current[slot] = spawnMeteor(aspect)
      }
      cooldown.current = 7 // every 7 seconds
    }

    const margin = 1.35
    for (let i = 0; i < MAX_METEORS; i++) {
      const m = meteors.current[i]!
      const line = trails[i]!
      const head = heads[i]!
      const geo = line.geometry
      const headMat = head.material as THREE.PointsMaterial

      if (!m.active) {
        line.visible = false
        head.visible = false
        continue
      }

      m.life += delta
      m.x += m.vx * delta
      m.y += m.vy * delta

      const offScreen =
        Math.abs(m.x) > aspect * margin || Math.abs(m.y) > margin
      if (m.life >= m.maxLife || offScreen) {
        m.active = false
        line.visible = false
        head.visible = false
        continue
      }

      const fadeIn = Math.min(1, m.life / 0.1)
      const fadeOut = Math.min(1, (m.maxLife - m.life) / 0.28)
      const alpha = Math.min(1, fadeIn * fadeOut * 1.25)

      const dirLen = Math.hypot(m.vx, m.vy) || 1
      const dx = m.vx / dirLen
      const dy = m.vy / dirLen

      const positions = geo.attributes.position!.array as Float32Array
      const colors = geo.attributes.color!.array as Float32Array

      for (let t = 0; t < TRAIL_POINTS; t++) {
        const u = t / (TRAIL_POINTS - 1)
        const i3 = t * 3
        const i4 = t * 4
        positions[i3] = m.x - dx * m.trailLen * u
        positions[i3 + 1] = m.y - dy * m.trailLen * u
        positions[i3 + 2] = -0.5

        const trailFade = 1 - u
        const a = Math.min(1, alpha * trailFade * Math.sqrt(trailFade) * 1.15)
        // Brighter, shinier head → soft warm fade along the trail
        colors[i4] = 1.0
        colors[i4 + 1] = 0.98 - u * 0.05
        colors[i4 + 2] = 0.94 - u * 0.12
        colors[i4 + 3] = a
      }

      geo.attributes.position!.needsUpdate = true
      geo.attributes.color!.needsUpdate = true

      line.visible = true
      head.visible = true
      head.position.set(m.x, m.y, -0.5)
      headMat.opacity = Math.min(1, alpha * 1.2)
    }
  })

  return (
    <group>
      {trails.map((line, i) => (
        <primitive key={`trail-${i}`} object={line} />
      ))}
      {heads.map((head, i) => (
        <primitive key={`head-${i}`} object={head} />
      ))}
    </group>
  )
}
