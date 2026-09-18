import { useEffect } from 'react'
import { create } from 'zustand'
import { checkAizen, type AizenMeta } from '../lib/aizenClient'

export type AizenStatus = 'checking' | 'online' | 'offline'
interface AizenStore {
  status: AizenStatus
  meta: AizenMeta | null
  setStatus: (status: AizenStatus) => void
  refresh: () => Promise<void>
}
let pending: Promise<void> | null = null
export const useAizen = create<AizenStore>((set) => ({
  status: 'checking', meta: null,
  setStatus: (status) => set({ status }),
  refresh: () => {
    if (pending) return pending
    set({ status: 'checking' })
    pending = checkAizen()
      .then((meta) => set({ status: 'online', meta }))
      .catch(() => set({ status: 'offline', meta: null }))
      .finally(() => { pending = null })
    return pending
  },
}))

export function useAizenStatus() {
  const state = useAizen()
  useEffect(() => {
    void useAizen.getState().refresh()
  }, [])
  return state
}
