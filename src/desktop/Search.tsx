import { useMotionPreferences } from '../lib/useMotionPreferences'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { APPS } from '../lib/apps'
import { AppIcon } from './AppIcon'
import { useWindows } from '../store/windows'
import projects from '../data/projects.json'
import knowledge from '../data/knowledge.json'

interface Result {
  id: string
  title: string
  sub: string
  icon: string
  accent: string
  appId: string
  intent?: string
  keywords: string
}

function buildIndex(): Result[] {
  const results: Result[] = []
  for (const a of APPS) {
    results.push({
      id: `app-${a.id}`,
      title: a.title,
      sub: a.tagline,
      icon: a.icon,
      accent: a.accent,
      appId: a.id,
      keywords: `${a.title} app open`,
    })
  }
  for (const t of ['Chat', 'Story', 'Model', 'Benchmark', 'Training', 'About']) {
    results.push({
      id: `aizen-${t}`,
      title: `Aizen ${t}`,
      sub: 'Aizen section',
      icon: 'aizen',
      accent: '#8d7fb5',
      appId: 'aizen',
      intent: t,
      keywords: `aizen ${t} model llm benchmark score training chat`,
    })
  }
  for (const t of ['Timeline', 'Loss curves', 'Versions', 'Datasets']) {
    results.push({
      id: `lab-${t}`,
      title: `Lab · ${t}`,
      sub: 'Lab section',
      icon: 'lab',
      accent: '#88a3bf',
      appId: 'lab',
      intent: t,
      keywords: `lab ${t} experiments training runs loss curve chart`,
    })
  }
  for (const p of projects) {
    results.push({
      id: `project-${p.id}`,
      title: p.title,
      sub: `Project · ${p.category}`,
      icon: 'projects',
      accent: '#e0a583',
      appId: 'projects',
      intent: p.id,
      keywords: `${p.title} ${p.category} ${p.description} ${p.technologies.join(' ')}`,
    })
  }
  for (const n of knowledge.notes) {
    results.push({
      id: `note-${n.id}`,
      title: n.title,
      sub: `Note · ${n.category}`,
      icon: 'knowledge',
      accent: '#a3b284',
      appId: 'knowledge',
      intent: n.id,
      keywords: `${n.title} ${n.category} ${n.content.join(' ')}`,
    })
  }
  for (const t of ['Skills', 'Journey', 'Achievements']) {
    results.push({
      id: `about-${t}`,
      title: t,
      sub: 'About Me section',
      icon: 'about',
      accent: '#b48ead',
      appId: 'about',
      intent: t,
      keywords: `about me profile gyan ${t}`,
    })
  }
  return results
}

const INDEX = buildIndex()

function rank(q: string): Result[] {
  const query = q.trim().toLowerCase()
  if (!query) return []
  const scored = INDEX.map((r) => {
    const title = r.title.toLowerCase()
    let score = 0
    if (title === query) score = 100
    else if (title.startsWith(query)) score = 60
    else if (title.includes(query)) score = 40
    else if (r.keywords.toLowerCase().includes(query)) score = 15
    return { r, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.r)
}

export function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useMotionPreferences()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const openApp = useWindows((s) => s.open)

  const results = useMemo(() => rank(q), [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])


  const launch = (r: Result) => {
    openApp(r.appId, r.intent)
    onClose()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[sel]) {
      launch(results[sel])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[6000] flex items-start justify-center bg-black/15 pt-[18vh]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
          onPointerDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-label="Search Gyan OS"
            className="glass w-[540px] max-w-[90vw] overflow-hidden rounded-2xl shadow-[0_30px_80px_-16px_rgba(30,20,50,0.45)]"
            initial={reduceMotion ? false : { scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: -6, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.25 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5c5566" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m20 20-4.8-4.8" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setSel(0) }}
                onKeyDown={onKey}
                placeholder="Search Gyan OS…"
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-soft/50"
                aria-label="Search"
              />
              <kbd className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-ink-soft">esc</kbd>
            </div>
            {results.length > 0 && (
              <ul className="max-h-[320px] overflow-y-auto border-t border-black/5 p-1.5">
                {results.map((r, i) => (
                  <li key={r.id}>
                    <button
                      onClick={() => launch(r)}
                      onMouseEnter={() => setSel(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ${
                        i === sel ? 'bg-lavender-deep/15' : ''
                      }`}
                    >
                      <AppIcon icon={r.icon} accent={r.accent} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{r.title}</span>
                        <span className="block truncate text-[11.5px] text-ink-soft">{r.sub}</span>
                      </span>
                      {i === sel && <kbd className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-ink-soft">↵</kbd>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {q.trim() && results.length === 0 && (
              <p className="border-t border-black/5 px-4 py-5 text-center text-[12.5px] text-ink-soft">
                Nothing found for “{q}”.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
