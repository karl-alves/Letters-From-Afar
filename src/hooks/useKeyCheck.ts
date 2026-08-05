import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export type KeyCheckStatus = 'idle' | 'checking' | 'match' | 'nomatch'

const DEBOUNCE_MS = 300

/**
 * Debounced key-phrase check against Supabase RPC `check_letter_key`.
 * Stale responses are ignored so an older reply cannot overwrite a newer one.
 */
export function useKeyCheck(phrase: string): KeyCheckStatus {
  const [status, setStatus] = useState<KeyCheckStatus>('idle')
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = phrase.trim()
    if (!trimmed) {
      requestId.current += 1
      setStatus('idle')
      return
    }

    setStatus('checking')
    const id = ++requestId.current

    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_letter_key', {
        p_key: trimmed,
      })

      if (id !== requestId.current) return

      if (error) {
        console.error('check_letter_key failed', error)
        setStatus('nomatch')
        return
      }

      setStatus(data === true ? 'match' : 'nomatch')
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [phrase])

  return status
}
