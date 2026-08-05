import type { KeyCheckStatus } from '../hooks/useKeyCheck'

const DOT_COUNT = 12

type KeyStatusProps = {
  status: KeyCheckStatus
}

export function KeyStatus({ status }: KeyStatusProps) {
  const isMatch = status === 'match'
  const isDim = status === 'idle'

  return (
    <div
      className={`key-status${isDim ? ' key-status--dim' : ''}`}
      aria-hidden="true"
      data-status={status}
    >
      <div
        className={`key-status__ring${isMatch ? ' key-status__ring--hidden' : ''}`}
      >
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <span
            key={i}
            className="key-status__dot"
            style={{
              transform: `rotate(${(360 / DOT_COUNT) * i}deg) translateY(-10px)`,
              animationDelay: `${-(i / DOT_COUNT) * 1.2}s`,
            }}
          />
        ))}
      </div>
      <div
        className={`key-status__arrow${isMatch ? ' key-status__arrow--visible' : ''}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 7h7.5M7.5 3.5 11 7l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
