import { create } from 'zustand'
import { appById } from '../lib/apps.ts'
import { fitWindow, workspaceBounds, type Geometry } from '../lib/windowGeometry.ts'

export interface WinState extends Geometry {
  appId: string
  z: number
  minimized: boolean
  maximized: boolean
  prev?: Geometry
}

interface WindowStore {
  windows: Record<string, WinState>
  order: string[]
  nextZ: number
  intents: Record<string, { value: string; nonce: number }>
  open: (appId: string, intent?: string) => void
  close: (appId: string) => void
  focus: (appId: string) => void
  minimize: (appId: string) => void
  toggleMaximize: (appId: string) => void
  move: (appId: string, x: number, y: number) => void
  resize: (appId: string, w: number, h: number) => void
  fitViewport: () => void
  closeActive: () => void
  minimizeActive: () => void
  activeApp: () => string | null
}

// Normalize z-order on every focus change so windows never overtake shell menus.
function stacking(order: string[], windows: Record<string, WinState>) {
  return {
    order,
    windows: Object.fromEntries(order.map((id, i) => [id, { ...windows[id], z: 100 + i }])),
    nextZ: 100 + order.length,
  }
}

export const useWindows = create<WindowStore>((set, get) => ({
  windows: {}, order: [], nextZ: 100, intents: {},
  open: (appId, intent) => {
    const app = appById(appId)
    if (!app) return
    const { windows, order, intents } = get()
    const bounds = workspaceBounds()
    const offset = (order.length % 6) * 24
    const geometry = fitWindow({
      ...app.defaultSize,
      x: bounds.x + (bounds.w - app.defaultSize.w) / 2 + offset,
      y: bounds.y + (bounds.h - app.defaultSize.h) / 2 + offset,
    })
    const win = windows[appId]
    set({
      ...stacking([...order.filter((id) => id !== appId), appId], {
        ...windows,
        [appId]: win ? { ...win, minimized: false } : { ...geometry, appId, z: 100, minimized: false, maximized: false },
      }),
      intents: intent === undefined ? intents : {
        ...intents, [appId]: { value: intent, nonce: (intents[appId]?.nonce ?? 0) + 1 },
      },
    })
  },
  close: (appId) => {
    const { windows, order, intents } = get()
    const remainingIntents = { ...intents }
    delete remainingIntents[appId]
    set({ ...stacking(order.filter((id) => id !== appId), windows), intents: remainingIntents })
  },
  focus: (appId) => {
    const { windows, order } = get()
    if (!windows[appId] || (order.at(-1) === appId && !windows[appId].minimized)) return
    set(stacking([...order.filter((id) => id !== appId), appId], {
      ...windows, [appId]: { ...windows[appId], minimized: false },
    }))
  },
  minimize: (appId) => {
    const { windows } = get()
    if (windows[appId]) set({ windows: { ...windows, [appId]: { ...windows[appId], minimized: true } } })
  },
  toggleMaximize: (appId) => {
    const { windows, order } = get()
    const win = windows[appId]
    if (!win) return
    const geometry = win.maximized ? fitWindow(win.prev ?? win) : workspaceBounds()
    set(stacking([...order.filter((id) => id !== appId), appId], {
      ...windows,
      [appId]: {
        ...win, ...geometry, minimized: false, maximized: !win.maximized,
        prev: win.maximized ? undefined : { x: win.x, y: win.y, w: win.w, h: win.h },
      },
    }))
  },
  move: (appId, x, y) => {
    const { windows } = get(); const win = windows[appId]
    if (win && !win.maximized) set({ windows: { ...windows, [appId]: { ...win, ...fitWindow({ ...win, x, y }) } } })
  },
  resize: (appId, w, h) => {
    const { windows } = get(); const win = windows[appId]
    if (win) set({ windows: { ...windows, [appId]: { ...win, ...fitWindow({ ...win, w, h }), maximized: false } } })
  },
  fitViewport: () => {
    set({ windows: Object.fromEntries(Object.entries(get().windows).map(([id, win]) => [id, {
      ...win, ...(win.maximized ? workspaceBounds() : fitWindow(win)),
      prev: win.prev ? fitWindow(win.prev) : undefined,
    }])) })
  },
  activeApp: () => {
    const { order, windows } = get()
    return [...order].reverse().find((id) => !windows[id].minimized) ?? null
  },
  closeActive: () => { const id = get().activeApp(); if (id) get().close(id) },
  minimizeActive: () => { const id = get().activeApp(); if (id) get().minimize(id) },
}))
