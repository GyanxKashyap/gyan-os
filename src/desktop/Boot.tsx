import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const LINES = ['Initializing…', 'Loading knowledge…', 'Loading projects…', 'Loading Aizen…']

export function Boot({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (line < LINES.length) {
      const t = setTimeout(() => setLine(line + 1), 420)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setGone(true), 250)
    return () => clearTimeout(t)
  }, [line])

  const skip = () => setGone(true)

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          className="absolute inset-0 z-[9000] flex flex-col items-center justify-center gap-8 bg-[#171420]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onClick={skip}
          onKeyDown={skip}
          role="status"
        >
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
            className="text-[44px] font-semibold tracking-[0.18em] text-cream"
          >
            GYAN&nbsp;OS
          </motion.h1>
          <div className="h-5 text-[13px] tracking-wide text-cream/60">
            {line > 0 && line <= LINES.length ? LINES[line - 1] : ' '}
          </div>
          <div className="h-[3px] w-44 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-lavender"
              initial={{ width: '0%' }}
              animate={{ width: `${(line / LINES.length) * 100}%` }}
              transition={{ ease: 'easeOut', duration: 0.35 }}
            />
          </div>
          <button className="absolute bottom-8 text-[12px] text-cream/40 hover:text-cream/70" onClick={skip}>
            Press anywhere to skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
