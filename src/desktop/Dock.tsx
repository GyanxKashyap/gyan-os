import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { APPS, type AppDef } from '../lib/apps'
import { AppIcon } from './AppIcon'
import { useWindows } from '../store/windows'

const BASE = 52
const MAX = 76
const RANGE = 130

export function Dock() {
  const mouseX = useMotionValue(Infinity)

  return (
    <nav
      aria-label="Dock"
      className="absolute inset-x-0 bottom-3 z-[4000] flex justify-center"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <div className="glass flex items-end gap-2 rounded-[22px] px-3 pb-2 pt-2 shadow-[0_12px_40px_-8px_rgba(40,25,70,0.35)]">
        {APPS.map((app) => (
          <div key={app.id} className="flex items-end gap-2">
            {app.id === 'trash' && <span className="mb-1 h-10 w-px self-end bg-black/10" />}
            <DockItem app={app} mouseX={mouseX} />
          </div>
        ))}
      </div>
    </nav>
  )
}

function DockItem({ app, mouseX }: { app: AppDef; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null)
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
      style={{ width: size, height: size }}
      className="group relative flex items-end justify-center outline-none"
      onClick={() => open(app.id)}
      whileTap={{ scale: 0.92 }}
      aria-label={`Open ${app.title}`}
    >
      <span className="pointer-events-none absolute -top-9 rounded-md bg-plum/90 px-2 py-1 text-[11px] font-medium text-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {app.title}
      </span>
      <motion.span style={{ width: size, height: size }} className="block">
        <FullIcon icon={app.icon} accent={app.accent} />
      </motion.span>
      <span
        className={`absolute -bottom-1.5 h-1 w-1 rounded-full bg-plum/70 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
    </motion.button>
  )
}

/** AppIcon stretched to fill the animated square. */
function FullIcon({ icon, accent }: { icon: string; accent: string }) {
  return (
    <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full">
      <AppIcon icon={icon} accent={accent} />
    </div>
  )
}
