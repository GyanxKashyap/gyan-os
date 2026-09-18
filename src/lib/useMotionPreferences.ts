import { useCallback, useSyncExternalStore } from 'react'
import { useSettings } from '../store/settings'

export function useMediaQuery(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', notify)
    return () => media.removeEventListener('change', notify)
  }, [query])
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

export function useMotionPreferences() {
  const preference = useSettings((s) => s.reduceMotion)
  const system = useMediaQuery('(prefers-reduced-motion: reduce)')
  return preference || system
}
