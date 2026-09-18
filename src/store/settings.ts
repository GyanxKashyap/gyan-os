import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { DEFAULT_WALLPAPER } from '../lib/wallpapers'
export type { WallpaperId } from '../lib/wallpapers'

export const ACCENTS = [
  { id: 'lavender', color: '#8d7fb5', label: 'Lavender' },
  { id: 'rose', color: '#b48ead', label: 'Rose' },
  { id: 'ocean', color: '#7f97b5', label: 'Ocean' },
  { id: 'moss', color: '#8fa377', label: 'Moss' },
  { id: 'peach', color: '#cf9573', label: 'Peach' },
] as const

interface SettingsStore {
  /** a built-in WallpaperId, or `custom:<id>` for a user-added wallpaper */
  wallpaper: string
  accent: string
  reduceMotion: boolean
  liveWallpaper: boolean
  dockAutoHide: boolean
  setWallpaper: (w: string) => void
  setAccent: (c: string) => void
  setReduceMotion: (v: boolean) => void
  setLiveWallpaper: (v: boolean) => void
  setDockAutoHide: (v: boolean) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      wallpaper: DEFAULT_WALLPAPER,
      accent: '#8d7fb5',
      reduceMotion: false,
      liveWallpaper: true,
      dockAutoHide: true,
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccent: (accent) => set({ accent }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setLiveWallpaper: (liveWallpaper) => set({ liveWallpaper }),
      setDockAutoHide: (dockAutoHide) => set({ dockAutoHide }),
    }),
    { name: 'gyan-os-settings' },
  ),
)
