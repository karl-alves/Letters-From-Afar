import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { OrthographicCamera } from 'three'
import { usePointer } from '../hooks/usePointer'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Starfield } from './Starfield'

/**
 * Lock the ortho frustum to aspect-corrected space (-aspect..aspect, -1..1).
 * `manual` stops R3F from resetting left/right to pixel dimensions on resize.
 */
function OrthoCameraSync() {
  const { size, camera } = useThree()

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return
    camera.manual = true
    const aspect = size.width / Math.max(size.height, 1)
    camera.left = -aspect
    camera.right = aspect
    camera.top = 1
    camera.bottom = -1
    camera.near = 0.1
    camera.far = 100
    camera.position.set(0, 0, 5)
    camera.zoom = 1
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [size.width, size.height, camera])

  return null
}

export function StarfieldCanvas() {
  const pointer = usePointer()
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div className="starfield-canvas" aria-hidden="true">
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 5],
          zoom: 1,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        frameloop={paused ? 'never' : 'always'}
        style={{ background: '#000000' }}
        onCreated={({ gl, camera }) => {
          // Opaque black: additive star blending composites correctly
          gl.setClearColor(0x000000, 1)
          if (camera instanceof OrthographicCamera) {
            camera.manual = true
            const aspect =
              gl.domElement.clientWidth /
              Math.max(gl.domElement.clientHeight, 1)
            camera.left = -aspect
            camera.right = aspect
            camera.top = 1
            camera.bottom = -1
            camera.updateProjectionMatrix()
          }
        }}
      >
        <OrthoCameraSync />
        <Starfield pointer={pointer} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
