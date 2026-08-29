import { create } from 'zustand'
import { dbAddWallpaper, dbDeleteWallpaper, dbListWallpapers } from '../lib/wallpaperDb'
import { useSettings } from './settings'
import { useNotifications } from './notifications'

export interface CustomWallpaper {
  id: string
  name: string
  type: string // mime — image/* or video/*
  url: string // object URL for rendering
}

interface CustomWallpaperStore {
  items: CustomWallpaper[]
  loaded: boolean
  load: () => Promise<void>
  add: (file: File) => Promise<void>
  remove: (id: string) => Promise<void>
}

const MAX_BYTES = 120 * 1024 * 1024 // keep IndexedDB reasonable

export const useCustomWallpapers = create<CustomWallpaperStore>((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      const stored = await dbListWallpapers()
      set({
        items: stored.map((s) => ({ id: s.id, name: s.name, type: s.type, url: URL.createObjectURL(s.blob) })),
        loaded: true,
      })
    } catch {
      set({ loaded: true })
    }
  },

  add: async (file) => {
    const push = useNotifications.getState().push
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      push('Unsupported file', 'Wallpapers can be images or videos.')
      return
    }
    if (file.size > MAX_BYTES) {
      push('File too large', 'Keep wallpapers under 120 MB.')
      return
    }
    try {
      const stored = await dbAddWallpaper(file)
      set({
        items: [...get().items, { id: stored.id, name: stored.name, type: stored.type, url: URL.createObjectURL(stored.blob) }],
      })
      useSettings.getState().setWallpaper(`custom:${stored.id}`)
      push('Wallpaper added', `“${stored.name}” is saved in Gyan OS and set as your wallpaper.`)
    } catch {
      push('Could not save wallpaper', 'The browser refused to store the file.')
    }
  },

  remove: async (id) => {
    try {
      await dbDeleteWallpaper(id)
    } catch {
      /* removing from the UI regardless */
    }
    const item = get().items.find((i) => i.id === id)
    if (item) URL.revokeObjectURL(item.url)
    set({ items: get().items.filter((i) => i.id !== id) })
    const settings = useSettings.getState()
    if (settings.wallpaper === `custom:${id}`) settings.setWallpaper('dusk')
  },
}))
