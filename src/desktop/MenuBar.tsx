import { useEffect, useRef, useState } from 'react'
import { useWindows } from '../store/windows'
import { useSettings } from '../store/settings'
import { appById } from '../lib/apps'
import { WALLPAPERS } from './Wallpaper'
import { MenuPanel, type MenuEntry } from './Menu'
import type { WallpaperId } from '../store/settings'

export function MenuBar({ onSearch }: { onSearch: () => void }) {
  const [now, setNow] = useState(new Date())
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLElement>(null)
  const order = useWindows((s) => s.order)
  const windows = useWindows((s) => s.windows)
  const settings = useSettings()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!openMenu) return
    const close = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', esc)
    }
  }, [openMenu])

  const activeId = [...order].reverse().find((id) => windows[id] && !windows[id].minimized)
  const activeTitle = activeId ? appById(activeId)?.title : null
  const ws = useWindows.getState()

  const menus: Record<string, MenuEntry[]> = {
    File: [
      { label: 'New Aizen chat', action: () => ws.open('aizen', 'Chat') },
      { label: 'Open Projects', action: () => ws.open('projects') },
      { divider: true },
      { label: 'Close Window', shortcut: '⌘W', disabled: !activeId, action: () => ws.closeActive() },
    ],
    Edit: [
      { label: 'Undo', disabled: true, shortcut: '⌘Z' },
      { label: 'Redo', disabled: true, shortcut: '⇧⌘Z' },
      { divider: true },
      { label: 'Copy', disabled: true, shortcut: '⌘C' },
      { label: 'Paste', disabled: true, shortcut: '⌘V' },
    ],
    View: [
      ...(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => ({
        label: `Wallpaper: ${WALLPAPERS[id].label}`,
        checked: settings.wallpaper === id,
        action: () => settings.setWallpaper(id),
      })),
      { divider: true },
      {
        label: 'Animations',
        checked: !settings.reduceMotion,
        action: () => settings.setReduceMotion(!settings.reduceMotion),
      },
    ],
    Window: [
      { label: 'Minimize', shortcut: '⌘M', disabled: !activeId, action: () => ws.minimizeActive() },
      { label: 'Zoom', disabled: !activeId, action: () => activeId && ws.toggleMaximize(activeId) },
      { divider: true },
      ...(order.length
        ? order.map((id) => ({
            label: appById(id)?.title ?? id,
            checked: id === activeId,
            action: () => ws.open(id),
          }))
        : [{ label: 'No open windows', disabled: true }]),
    ],
    Help: [
      { label: 'About Gyan OS', action: () => ws.open('settings') },
      { label: 'Search', shortcut: '⌘K', action: onSearch },
      { divider: true },
      { label: 'GitHub ↗', action: () => window.open('https://github.com/GyanxKashyap', '_blank') },
    ],
  }

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header
      ref={barRef}
      className="glass absolute inset-x-0 top-0 z-[5000] flex h-[34px] items-center gap-1 border-x-0 border-t-0 px-3 text-[13px] whitespace-nowrap"
    >
      <span className="px-2 font-semibold tracking-tight">Gyan OS</span>
      {activeTitle && <span className="px-1 font-medium text-ink">{activeTitle}</span>}
      {Object.keys(menus).map((m) => (
        <div key={m} className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === m ? null : m)}
            onMouseEnter={() => openMenu && setOpenMenu(m)}
            className={`rounded-md px-2 py-0.5 transition-colors ${
              openMenu === m ? 'bg-lavender-deep/20 text-ink' : 'text-ink-soft hover:bg-black/5 hover:text-ink'
            }`}
            aria-haspopup="menu"
            aria-expanded={openMenu === m}
          >
            {m}
          </button>
          {openMenu === m && (
            <div className="absolute left-0 top-[30px]">
              <MenuPanel entries={menus[m]} onClose={() => setOpenMenu(null)} />
            </div>
          )}
        </div>
      ))}
      <div className="flex-1" />
      <button
        onClick={onSearch}
        title="Search (⌘K)"
        aria-label="Search"
        className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.8-4.8" />
        </svg>
      </button>
      <span className="p-1.5 text-ink-soft" title="Wi-Fi" aria-label="Wi-Fi">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 9.5C8.5 4.5 15.5 4.5 21 9.5M6 13c3.5-3 8.5-3 12 0M9.2 16.4c1.7-1.4 3.9-1.4 5.6 0" />
          <circle cx="12" cy="19.2" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="p-1.5 text-ink-soft" title="Battery" aria-label="Battery">
        <svg width="20" height="15" viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="2" width="22" height="10" rx="3" />
          <rect x="3" y="4" width="15" height="6" rx="1.5" fill="currentColor" stroke="none" />
          <path d="M25 5.5v3" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </span>
      <span className="px-2 font-medium tabular-nums text-ink">
        {date}&ensp;{time}
      </span>
    </header>
  )
}
