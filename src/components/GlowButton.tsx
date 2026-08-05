import type { ReactNode } from 'react'

type GlowButtonProps = {
  children: ReactNode
  onClick?: () => void
  tone?: 'moonlit' | 'ivory'
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export function GlowButton({
  children,
  onClick,
  tone = 'moonlit',
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
}: GlowButtonProps) {
  return (
    <button
      type="button"
      className="glow-button"
      data-tone={tone}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </button>
  )
}
