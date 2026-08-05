import { useState } from 'react'
import { GlowButton } from './GlowButton'
import { KeyPanel } from './KeyPanel'
import { Logo } from './Logo'

export function Overlay() {
  const [readOpen, setReadOpen] = useState(false)

  return (
    <main className="overlay">
      <Logo />
      <div className="overlay__actions">
        <div className="overlay__read-group">
          <GlowButton
            onClick={() => setReadOpen((open) => !open)}
            aria-expanded={readOpen}
            aria-controls="read-key-panel"
          >
            Read a Letter
          </GlowButton>
          <div id="read-key-panel">
            <KeyPanel open={readOpen} />
          </div>
        </div>
        <GlowButton tone="ivory" onClick={() => {}}>
          Make a Letter
        </GlowButton>
      </div>
    </main>
  )
}
