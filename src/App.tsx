import { lazy, Suspense } from 'react'
import { Overlay } from './components/Overlay'

const StarfieldCanvas = lazy(() =>
  import('./scene/StarfieldCanvas').then((m) => ({ default: m.StarfieldCanvas })),
)

export default function App() {
  return (
    <div className="app">
      <Suspense fallback={<div className="starfield-fallback" aria-hidden="true" />}>
        <StarfieldCanvas />
      </Suspense>
      <Overlay />
    </div>
  )
}
