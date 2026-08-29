import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WallpaperId = 'dusk' | 'dawn' | 'night'

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
  setWallpaper: (w: string) => void
  setAccent: (c: string) => void
  setReduceMotion: (v: boolean) => void
  setLiveWallpaper: (v: boolean) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      wallpaper: 'dusk',
      accent: '#8d7fb5',
      reduceMotion: false,
      liveWallpaper: true,
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccent: (accent) => set({ accent }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setLiveWallpaper: (liveWallpaper) => set({ liveWallpaper }),
    }),
    { name: 'gyan-os-settings' },
  ),
)
