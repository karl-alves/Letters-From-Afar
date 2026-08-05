import { GlowButton } from './GlowButton'
import { Logo } from './Logo'

export function Overlay() {
  return (
    <main className="overlay">
      <Logo />
      <div className="overlay__actions">
        <GlowButton onClick={() => {}}>Read a Letter</GlowButton>
        <GlowButton onClick={() => {}}>Make a Letter</GlowButton>
      </div>
    </main>
  )
}
