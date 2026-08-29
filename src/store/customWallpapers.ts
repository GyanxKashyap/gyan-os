import { create } from 'zustand'
import { dbAddWallpaper, dbDeleteWallpaper, dbListWallpapers } from '../lib/wallpaperDb'
import { useSettings } from './settings'
import { useNotifications } from './notifications'

export interface CustomWallpaper {
  id: string
  name: string
  type: string // mime — image/* or video/*
  url: string // object URL for rendering
  /** true when the wallpaper is dark → the OS chrome flips to dark glass */
  isDark?: boolean
}

/** Average luminance of an image/video frame, sampled tiny. */
async function computeIsDark(url: string, type: string): Promise<boolean> {
  const draw = (source: CanvasImageSource): boolean => {
    const c = document.createElement('canvas')
    c.width = 24
    c.height = 24
    const g = c.getContext('2d')!
    g.drawImage(source, 0, 0, 24, 24)
    const d = g.getImageData(0, 0, 24, 24).data
    let sum = 0
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
    return sum / (d.length / 4) < 112
  }
  if (type.startsWith('video/')) {
    return new Promise((resolve) => {
      const v = document.createElement('video')
      v.muted = true
      v.src = url
      v.currentTime = 0.1
      v.onloadeddata = () => {
        try {
          resolve(draw(v))
        } catch {
          resolve(false)
        }
      }
      v.onerror = () => resolve(false)
    })
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      try {
        resolve(draw(img))
      } catch {
        resolve(false)
      }
    }
    img.onerror = () => resolve(false)
  })
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
      const items = stored.map((s) => ({ id: s.id, name: s.name, type: s.type, url: URL.createObjectURL(s.blob) }))
      set({ items, loaded: true })
      items.forEach(async (it) => {
        const isDark = await computeIsDark(it.url, it.type)
        set({ items: get().items.map((x) => (x.id === it.id ? { ...x, isDark } : x)) })
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
      const url = URL.createObjectURL(stored.blob)
      const isDark = await computeIsDark(url, stored.type)
      set({
        items: [...get().items, { id: stored.id, name: stored.name, type: stored.type, url, isDark }],
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
