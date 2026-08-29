import { create } from 'zustand'
import { appById } from '../lib/apps'

export interface WinState {
  appId: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
  /** saved geometry to restore from maximize */
  prev?: { x: number; y: number; w: number; h: number }
}

interface WindowStore {
  windows: Record<string, WinState>
  order: string[] // open appIds, back → front
  nextZ: number
  /** deep-link payload for the app being opened (e.g. a tab name or item id) */
  intents: Record<string, { value: string; nonce: number }>
  open: (appId: string, intent?: string) => void
  close: (appId: string) => void
  focus: (appId: string) => void
  minimize: (appId: string) => void
  toggleMaximize: (appId: string) => void
  move: (appId: string, x: number, y: number) => void
  resize: (appId: string, w: number, h: number) => void
  closeActive: () => void
  minimizeActive: () => void
  activeApp: () => string | null
}

const MENUBAR = 34
const DOCK = 96

let spawnCount = 0

function spawnPos(w: number, h: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight - MENUBAR - DOCK
  const offset = (spawnCount++ % 6) * 28
  return {
    x: Math.max(12, (vw - w) / 2 + offset),
    y: Math.max(MENUBAR + 8, MENUBAR + (vh - h) / 2 + offset * 0.7),
  }
}

export const useWindows = create<WindowStore>((set, get) => ({
  windows: {},
  order: [],
  nextZ: 100,
  intents: {},

  open: (appId, intent) => {
    const { windows, order, nextZ, intents } = get()
    const app = appById(appId)
    if (!app) return
    if (intent !== undefined) {
      set({ intents: { ...intents, [appId]: { value: intent, nonce: (intents[appId]?.nonce ?? 0) + 1 } } })
    }
    if (windows[appId]) {
      // already open: unminimize + focus
      set({
        windows: { ...windows, [appId]: { ...windows[appId], minimized: false, z: nextZ } },
        order: [...order.filter((id) => id !== appId), appId],
        nextZ: nextZ + 1,
      })
      return
    }
    const { w, h } = app.defaultSize
    const { x, y } = spawnPos(w, h)
    set({
      windows: { ...windows, [appId]: { appId, x, y, w, h, z: nextZ, minimized: false, maximized: false } },
      order: [...order, appId],
      nextZ: nextZ + 1,
    })
  },

  close: (appId) => {
    const { windows, order } = get()
    const rest = { ...windows }
    delete rest[appId]
    set({ windows: rest, order: order.filter((id) => id !== appId) })
  },

  focus: (appId) => {
    const { windows, order, nextZ } = get()
    if (!windows[appId]) return
    set({
      windows: { ...windows, [appId]: { ...windows[appId], z: nextZ } },
      order: [...order.filter((id) => id !== appId), appId],
      nextZ: nextZ + 1,
    })
  },

  minimize: (appId) => {
    const { windows } = get()
    if (!windows[appId]) return
    set({ windows: { ...windows, [appId]: { ...windows[appId], minimized: true } } })
  },

  toggleMaximize: (appId) => {
    const { windows, nextZ } = get()
    const win = windows[appId]
    if (!win) return
    if (win.maximized) {
      const prev = win.prev ?? { x: 40, y: MENUBAR + 20, w: 640, h: 480 }
      set({
        windows: {
          ...windows,
          [appId]: { ...win, ...prev, maximized: false, prev: undefined, z: nextZ },
        },
        nextZ: nextZ + 1,
      })
    } else {
      set({
        windows: {
          ...windows,
          [appId]: {
            ...win,
            prev: { x: win.x, y: win.y, w: win.w, h: win.h },
            x: 8,
            y: MENUBAR + 6,
            w: window.innerWidth - 16,
            h: window.innerHeight - MENUBAR - 14,
            maximized: true,
            z: nextZ,
          },
        },
        nextZ: nextZ + 1,
      })
    }
  },

  move: (appId, x, y) => {
    const { windows } = get()
    const win = windows[appId]
    if (!win) return
    set({ windows: { ...windows, [appId]: { ...win, x, y } } })
  },

  resize: (appId, w, h) => {
    const { windows } = get()
    const win = windows[appId]
    if (!win) return
    set({
      windows: {
        ...windows,
        [appId]: { ...win, w: Math.max(340, w), h: Math.max(240, h), maximized: false },
      },
    })
  },

  activeApp: () => {
    const { order, windows } = get()
    for (let i = order.length - 1; i >= 0; i--) {
      const id = order[i]
      if (windows[id] && !windows[id].minimized) return id
    }
    return null
  },

  closeActive: () => {
    const id = get().activeApp()
    if (id) get().close(id)
  },

  minimizeActive: () => {
    const id = get().activeApp()
    if (id) get().minimize(id)
  },
}))
