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
  wallpaper: WallpaperId
  accent: string
  reduceMotion: boolean
  setWallpaper: (w: WallpaperId) => void
  setAccent: (c: string) => void
  setReduceMotion: (v: boolean) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      wallpaper: 'dusk',
      accent: '#8d7fb5',
      reduceMotion: false,
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccent: (accent) => set({ accent }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: 'gyan-os-settings' },
  ),
)
