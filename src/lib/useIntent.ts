import { useEffect, useRef } from 'react'
import { useWindows } from '../store/windows'

/** Run `handler` whenever the app receives a fresh deep-link intent (from Search). */
export function useIntent(appId: string, handler: (value: string) => void) {
  const intent = useWindows((s) => s.intents[appId])
  const seen = useRef(0)
  useEffect(() => {
    if (intent && intent.nonce !== seen.current) {
      seen.current = intent.nonce
      handler(intent.value)
    }
  }, [intent, handler])
}
