import { DEFAULT_WALLPAPER } from '../lib/wallpapers'
import { create } from 'zustand'
import { dbAddWallpaper, dbDeleteWallpaper, dbListWallpapers } from '../lib/wallpaperDb'
import { useSettings } from './settings'
import { useNotifications } from './notifications'

export interface WallpaperTheme {
  /** true when the wallpaper is dark → the OS chrome flips to dark glass */
  isDark: boolean
  /** dominant color of the wallpaper, for tinting the chrome glass */
  tint: [number, number, number]
}

export interface CustomWallpaper {
  id: string
  name: string
  type: string // mime — image/* or video/*
  url: string // object URL for rendering
  theme?: WallpaperTheme
}

/** Luminance + dominant color of an image/video frame, sampled tiny.
    Dominant color = the most-weighted of 12 hue buckets (weighted by
    saturation, so grays don't drown the actual color of the scene). */
async function computeTheme(url: string, type: string): Promise<WallpaperTheme> {
  const fallback: WallpaperTheme = { isDark: false, tint: [141, 127, 181] }
  const analyze = (source: CanvasImageSource): WallpaperTheme => {
    const c = document.createElement('canvas')
    c.width = 24
    c.height = 24
    const g = c.getContext('2d')!
    g.drawImage(source, 0, 0, 24, 24)
    const d = g.getImageData(0, 0, 24, 24).data
    let lumSum = 0
    const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }))
    let ar = 0, ag = 0, ab = 0
    const n = d.length / 4
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gr = d[i + 1], b = d[i + 2]
      lumSum += 0.2126 * r + 0.7152 * gr + 0.0722 * b
      ar += r; ag += gr; ab += b
      const max = Math.max(r, gr, b), min = Math.min(r, gr, b)
      const sat = max - min
      if (sat < 20) continue
      let hue = 0
      if (max === r) hue = ((gr - b) / sat + 6) % 6
      else if (max === gr) hue = (b - r) / sat + 2
      else hue = (r - gr) / sat + 4
      const bk = buckets[Math.floor(hue * 2) % 12]
      bk.w += sat; bk.r += r * sat; bk.g += gr * sat; bk.b += b * sat
    }
    const best = buckets.reduce((a, b) => (b.w > a.w ? b : a))
    const tint: [number, number, number] =
      best.w > 0
        ? [best.r / best.w, best.g / best.w, best.b / best.w]
        : [ar / n, ag / n, ab / n]
    return { isDark: lumSum / n < 112, tint: tint.map(Math.round) as [number, number, number] }
  }
  if (type.startsWith('video/')) {
    return new Promise((resolve) => {
      const v = document.createElement('video')
      v.muted = true
      v.src = url
      v.currentTime = 0.1
      v.onloadeddata = () => {
        try {
          resolve(analyze(v))
        } catch {
          resolve(fallback)
        }
      }
      v.onerror = () => resolve(fallback)
    })
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      try {
        resolve(analyze(img))
      } catch {
        resolve(fallback)
      }
    }
    img.onerror = () => resolve(fallback)
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
        const theme = await computeTheme(it.url, it.type)
        set({ items: get().items.map((x) => (x.id === it.id ? { ...x, theme } : x)) })
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
      const theme = await computeTheme(url, stored.type)
      set({
        items: [...get().items, { id: stored.id, name: stored.name, type: stored.type, url, theme }],
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
    if (settings.wallpaper === `custom:${id}`) settings.setWallpaper(DEFAULT_WALLPAPER)
  },
}))
