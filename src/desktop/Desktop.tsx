import { useEffect, useState } from 'react'
import { Wallpaper, WALLPAPERS } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { DesktopIcons } from './DesktopIcons'
import { Dock } from './Dock'
import { Window } from './Window'
import { Search } from './Search'
import { Notifications } from './Notifications'
import { MenuPanel, type MenuEntry } from './Menu'
import { useWindows } from '../store/windows'
import { useSettings, type WallpaperId } from '../store/settings'
import { useNotifications } from '../store/notifications'
import { useCustomWallpapers } from '../store/customWallpapers'

export function Desktop() {
  const windows = useWindows((s) => s.windows)
  const order = useWindows((s) => s.order)
  const accent = useSettings((s) => s.accent)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const [searchOpen, setSearchOpen] = useState(false)
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null)

  const activeId = [...order].reverse().find((id) => windows[id] && !windows[id].minimized) ?? null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const { closeActive, minimizeActive } = useWindows.getState()
      // Cmd+Space is usually captured by macOS Spotlight before the browser
      // sees it, so Cmd+K is the primary in-OS search shortcut.
      if (mod && (e.code === 'Space' || e.key === 'k')) {
        e.preventDefault()
        setSearchOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setCtx(null)
      } else if (mod && e.key === 'w') {
        e.preventDefault()
        closeActive()
      } else if (mod && e.key === 'm') {
        e.preventDefault()
        minimizeActive()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // restore user-added wallpapers from IndexedDB
  useEffect(() => {
    useCustomWallpapers.getState().load()
  }, [])

  // one welcome notification per session, reporting the real model status
  useEffect(() => {
    if (sessionStorage.getItem('gyan-os-welcomed')) return
    sessionStorage.setItem('gyan-os-welcomed', '1')
    const push = useNotifications.getState().push
    fetch('/chat', { method: 'OPTIONS' })
      .then((r) => {
        if (r.ok || r.status === 405) push('Aizen is online', 'The model is live — open Aizen and chat.')
        else push('Aizen is offline', 'The model runs locally on Gyan’s machine.')
      })
      .catch(() => push('Aizen is offline', 'The model runs locally on Gyan’s machine.'))
  }, [])

  const settings = useSettings.getState()
  const ctxEntries: MenuEntry[] = [
    ...(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => ({
      label: `Wallpaper: ${WALLPAPERS[id].label}`,
      checked: useSettings.getState().wallpaper === id,
      action: () => settings.setWallpaper(id),
    })),
    { divider: true },
    { label: 'Search…', shortcut: '⌘K', action: () => setSearchOpen(true) },
    { label: 'Open Settings', action: () => useWindows.getState().open('settings') },
  ]

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${reduceMotion ? 'motion-off' : ''}`}
      style={{ '--color-lavender-deep': accent } as React.CSSProperties}
      onContextMenu={(e) => {
        // custom menu only on the bare desktop, not inside windows/dock/menus
        if ((e.target as HTMLElement).closest('[role="dialog"], nav, header, [role="menu"]')) return
        e.preventDefault()
        setCtx({ x: e.clientX, y: e.clientY })
      }}
      onPointerDown={(e) => {
        if (ctx && !(e.target as HTMLElement).closest('[role="menu"]')) setCtx(null)
      }}
    >
      <Wallpaper />
      <MenuBar onSearch={() => setSearchOpen(true)} />
      <DesktopIcons />

      {order.map((id) => windows[id] && <Window key={id} win={windows[id]} isActive={id === activeId} />)}

      <Dock />
      <Notifications />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />

      {ctx && (
        <div
          className="absolute z-[5800]"
          style={{
            left: Math.min(ctx.x, window.innerWidth - 210),
            top: Math.min(ctx.y, window.innerHeight - 220),
          }}
        >
          <MenuPanel entries={ctxEntries} onClose={() => setCtx(null)} />
        </div>
      )}
    </div>
  )
}
