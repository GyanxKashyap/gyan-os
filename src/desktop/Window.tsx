import { useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useWindows, type WinState } from '../store/windows'
import { appById } from '../lib/apps'

const MENUBAR = 34

export function Window({ win, isActive }: { win: WinState; isActive: boolean }) {
  const app = appById(win.appId)
  const { close, focus, minimize, toggleMaximize, move, resize } = useWindows.getState()
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const resizeRef = useRef<{ w: number; h: number; x: number; y: number } | null>(null)

  if (!app) return null
  const Body = app.component

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (win.maximized) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
  }
  const onTitlePointerMove = (e: React.PointerEvent) => {
    const grab = dragRef.current
    if (!grab) return
    const x = Math.min(Math.max(e.clientX - grab.dx, -win.w + 120), window.innerWidth - 120)
    const y = Math.min(Math.max(e.clientY - grab.dy, MENUBAR + 2), window.innerHeight - 60)
    move(win.appId, x, y)
  }
  const onTitlePointerUp = () => (dragRef.current = null)

  return (
    <AnimatePresence>
      {!win.minimized && (
        <motion.section
          role="dialog"
          aria-label={app.title}
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
          style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
          className={`glass window-shadow absolute flex flex-col overflow-hidden rounded-window ${
            isActive ? '' : 'opacity-[0.97] saturate-[0.9]'
          }`}
          onPointerDown={() => focus(win.appId)}
        >
          <div
            className="flex h-10 shrink-0 cursor-grab items-center gap-2 border-b border-black/5 px-3 active:cursor-grabbing"
            onPointerDown={onTitlePointerDown}
            onPointerMove={onTitlePointerMove}
            onPointerUp={onTitlePointerUp}
            onDoubleClick={() => toggleMaximize(win.appId)}
          >
            <div className="group flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
              <TrafficButton color="#e8756d" label={`Close ${app.title}`} onClick={() => close(win.appId)} glyph="close" dim={!isActive} />
              <TrafficButton color="#e9b45c" label={`Minimize ${app.title}`} onClick={() => minimize(win.appId)} glyph="min" dim={!isActive} />
              <TrafficButton color="#8fbf6f" label={`Maximize ${app.title}`} onClick={() => toggleMaximize(win.appId)} glyph="max" dim={!isActive} />
            </div>
            <span className={`flex-1 text-center text-[13px] font-medium ${isActive ? 'text-ink' : 'text-ink-soft'}`}>
              {app.title}
            </span>
            <span className="w-[52px]" />
          </div>
          <div className="min-h-0 flex-1 select-text overflow-auto">
            <Body />
          </div>
          <div
            aria-label={`Resize ${app.title}`}
            role="separator"
            className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
            onPointerDown={(e) => {
              e.stopPropagation()
              ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
              resizeRef.current = { w: win.w, h: win.h, x: e.clientX, y: e.clientY }
            }}
            onPointerMove={(e) => {
              const start = resizeRef.current
              if (!start) return
              resize(win.appId, start.w + e.clientX - start.x, start.h + e.clientY - start.y)
            }}
            onPointerUp={() => (resizeRef.current = null)}
          />
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function TrafficButton({
  color,
  label,
  onClick,
  glyph,
  dim,
}: {
  color: string
  label: string
  onClick: () => void
  glyph: 'close' | 'min' | 'max'
  dim: boolean
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{ background: dim ? '#c9c4cf' : color }}
      className="flex h-[13px] w-[13px] items-center justify-center rounded-full text-black/50 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] transition-transform hover:scale-110 active:scale-95"
    >
      <svg
        width="7"
        height="7"
        viewBox="0 0 8 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        {glyph === 'close' && <path d="M1.5 1.5 6.5 6.5 M6.5 1.5 1.5 6.5" />}
        {glyph === 'min' && <path d="M1.5 4 H6.5" />}
        {glyph === 'max' && <path d="M4 1.5 V6.5 M1.5 4 H6.5" />}
      </svg>
    </button>
  )
}
