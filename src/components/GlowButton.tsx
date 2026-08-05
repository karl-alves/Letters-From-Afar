import type { ReactNode } from 'react'

type GlowButtonProps = {
  children: ReactNode
  onClick?: () => void
}

export function GlowButton({ children, onClick }: GlowButtonProps) {
  return (
    <button type="button" className="glow-button" onClick={onClick}>
      {children}
    </button>
  )
}
