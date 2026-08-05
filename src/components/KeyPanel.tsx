import { useEffect, useId, useRef, useState } from 'react'
import { useKeyCheck } from '../hooks/useKeyCheck'
import { KeyStatus } from './KeyStatus'

type KeyPanelProps = {
  open: boolean
}

export function KeyPanel({ open }: KeyPanelProps) {
  const [phrase, setPhrase] = useState('')
  const status = useKeyCheck(phrase)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelId = useId()

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 320)
      return () => window.clearTimeout(t)
    }
    setPhrase('')
  }, [open])

  return (
    <div
      className="key-panel"
      data-open={open ? 'true' : 'false'}
      aria-hidden={!open}
    >
      <div className="key-panel__inner">
        <label className="visually-hidden" htmlFor={`${labelId}-input`}>
          Enter your key
        </label>
        <div className="key-panel__row">
          <div className="key-panel__shell">
            <input
              ref={inputRef}
              id={`${labelId}-input`}
              className="key-panel__input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter your key"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              disabled={!open}
              aria-describedby={`${labelId}-status`}
            />
          </div>
          <div id={`${labelId}-status`} className="key-panel__status" role="status">
            <span className="visually-hidden">
              {status === 'match'
                ? 'Key matched'
                : status === 'checking'
                  ? 'Checking key'
                  : status === 'nomatch'
                    ? 'No matching key'
                    : 'Enter a key phrase'}
            </span>
            <KeyStatus status={status} />
          </div>
        </div>
      </div>
    </div>
  )
}
