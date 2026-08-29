import { motion } from 'motion/react'

export interface MenuEntry {
  label?: string
  shortcut?: string
  disabled?: boolean
  checked?: boolean
  divider?: boolean
  action?: () => void
}

/** Shared dropdown/context menu panel. Parent handles positioning + outside-click. */
export function MenuPanel({ entries, onClose }: { entries: MenuEntry[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.18 }}
      className="glass min-w-[190px] rounded-xl p-1 shadow-[0_16px_44px_-10px_rgba(30,20,50,0.4)]"
      style={{ transformOrigin: 'top left' }}
      role="menu"
    >
      {entries.map((e, i) =>
        e.divider ? (
          <div key={i} className="mx-2 my-1 h-px bg-black/8" />
        ) : (
          <button
            key={i}
            role="menuitem"
            disabled={e.disabled}
            onClick={() => {
              if (e.disabled) return
              e.action?.()
              onClose()
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] ${
              e.disabled ? 'cursor-default text-ink-soft/45' : 'text-ink hover:bg-lavender-deep/15'
            }`}
          >
            <span className="w-3 text-[11px]">{e.checked ? '✓' : ''}</span>
            <span className="flex-1">{e.label}</span>
            {e.shortcut && <span className="text-[11px] text-ink-soft">{e.shortcut}</span>}
          </button>
        ),
      )}
    </motion.div>
  )
}
