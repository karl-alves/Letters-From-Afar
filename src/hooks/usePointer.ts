import { useEffect, useRef } from 'react'

export type PointerState = {
  x: number
  y: number
  active: boolean
}

const INITIAL: PointerState = { x: 0, y: 0, active: false }

/**
 * Tracks pointer in normalized device coords (-1..1), aspect-corrected so
 * distance math matches the orthographic starfield. Stored in a ref so
 * pointer movement never triggers React re-renders.
 */
export function usePointer() {
  const pointer = useRef<PointerState>({ ...INITIAL })

  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      const aspect = window.innerWidth / Math.max(window.innerHeight, 1)
      pointer.current.x = ((clientX / window.innerWidth) * 2 - 1) * aspect
      pointer.current.y = -((clientY / window.innerHeight) * 2 - 1)
      pointer.current.active = true
    }

    const onPointerMove = (e: PointerEvent) => {
      update(e.clientX, e.clientY)
    }

    const onPointerLeave = () => {
      pointer.current.active = false
    }

    const onBlur = () => {
      pointer.current.active = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('blur', onBlur)
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onBlur)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [])

  return pointer
}
