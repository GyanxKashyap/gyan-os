import { useMotionPreferences } from '../lib/useMotionPreferences'
import { motion, AnimatePresence } from 'motion/react'
import { useNotifications } from '../store/notifications'

export function Notifications() {
  const reduceMotion = useMotionPreferences()
  const notices = useNotifications((s) => s.notices)
  const dismiss = useNotifications((s) => s.dismiss)

  return (
    <div className="pointer-events-none absolute right-4 top-11 z-[5500] flex w-[300px] flex-col gap-2">
      <AnimatePresence>
        {notices.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={reduceMotion ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }}
            className="glass pointer-events-auto flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 shadow-[0_10px_30px_-8px_rgba(30,20,50,0.3)]"
            role="status"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-snug">{n.title}</p>
              {n.body && <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{n.body}</p>}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-0.5 text-ink-soft hover:bg-black/5 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
