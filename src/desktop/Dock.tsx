import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { APPS, type AppDef } from '../lib/apps'
import { AppIcon } from './AppIcon'
import { useWindows } from '../store/windows'
import { useSettings } from '../store/settings'

import { useMediaQuery, useMotionPreferences } from '../lib/useMotionPreferences'

const BASE = 44
const MAX = 64
const RANGE = 120

export function Dock() {
  const mouseX = useMotionValue(Infinity)
  const autoHideSetting = useSettings((s) => s.dockAutoHide)
  const pointerHover = useMediaQuery('(hover: hover) and (min-width: 640px)')
  const reduceMotion = useMotionPreferences()
  const autoHide = autoHideSetting && pointerHover
  const [shown, setShown] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancelHide = () => clearTimeout(hideTimer.current)
  const scheduleHide = (delay = 700) => {
    if (!autoHide) return
    cancelHide()
    hideTimer.current = setTimeout(() => setShown(false), delay)
  }
  const reveal = () => {
    cancelHide()
    setShown(true)
  }

  useEffect(() => {
    if (!autoHide) {
      cancelHide()
      setShown(true)
      return
    }
    scheduleHide(1600) // settle in, then tuck away
    return cancelHide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHide])

  return (
    <>
      {/* invisible reveal strip along the bottom edge */}
      {autoHide && (
        <div className="absolute inset-x-0 bottom-0 z-[3999] h-3" onMouseEnter={reveal} aria-hidden />
      )}
      <motion.nav
        aria-label="Dock"
        className="os-dock absolute inset-x-0 bottom-2 z-[4000] flex justify-center"
        animate={{ y: !autoHide || shown ? 0 : 110, opacity: !autoHide || shown ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }}
        onFocusCapture={reveal}
        onMouseEnter={reveal}
        onMouseMove={(e) => {
          reveal()
          mouseX.set(e.clientX)
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity)
          scheduleHide()
        }}
      >
        <div className="dock-items chrome-glass flex items-end gap-5 rounded-[22px] px-6 pb-2 pt-2 shadow-[0_12px_40px_-8px_rgba(40,25,70,0.35)]">
          {APPS.map((app) => (
            <div key={app.id} className="flex items-end gap-5">
              {app.id === 'trash' && <span className="dock-sep mb-1 h-9 w-px self-end bg-black/10" />}
              <DockItem app={app} mouseX={mouseX} />
            </div>
          ))}
        </div>
      </motion.nav>
    </>
  )
}

function DockItem({ app, mouseX }: { app: AppDef; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduceMotion = useMotionPreferences()
  const canMagnify = useMediaQuery('(hover: hover) and (min-width: 640px)') && !reduceMotion
  const open = useWindows((s) => s.open)
  const isOpen = useWindows((s) => Boolean(s.windows[app.id]))

  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return Infinity
    return x - (rect.left + rect.width / 2)
  })
  const targetSize = useTransform(distance, [-RANGE, 0, RANGE], [BASE, MAX, BASE], { clamp: true })
  const size = useSpring(targetSize, { stiffness: 380, damping: 28 })

  return (
    <motion.button
      ref={ref}
      style={{ width: canMagnify ? size : BASE, height: canMagnify ? size : BASE }}
      className="group relative flex shrink-0 items-end justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-plum"
      onClick={() => open(app.id)}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      aria-label={`Open ${app.title}`}
    >
      <span className="pointer-events-none absolute -top-9 rounded-md bg-plum/90 px-2 py-1 text-[11px] font-medium text-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {app.title}
      </span>
      <motion.span style={{ width: canMagnify ? size : BASE, height: canMagnify ? size : BASE }} className="block">
        <FullIcon icon={app.icon} accent={app.accent} />
      </motion.span>
      <span
        className={`dock-dot absolute -bottom-1.5 h-1 w-1 rounded-full bg-plum/70 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
    </motion.button>
  )
}

/** AppIcon stretched to fill the animated square. */
function FullIcon({ icon, accent }: { icon: string; accent: string }) {
  return (
    <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>svg]:h-full [&>svg]:w-full">
      <AppIcon icon={icon} accent={accent} />
    </div>
  )
}
