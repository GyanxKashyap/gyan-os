import { useCallback, useState } from 'react'
import projects from '../data/projects.json'
import { useIntent } from '../lib/useIntent'

interface Project {
  id: string
  title: string
  category: string
  description: string
  technologies: string[]
  status: string
  github: string | null
  demo: string | null
  flagship?: boolean
  placeholder?: boolean
  highlights?: string[]
}

/** Screenshots: drop files named <project-id>-1.png, <project-id>-2.png … into
    src/assets/shots/ and they appear on the card and the project page. */
const SHOTS: Record<string, string[]> = {}
for (const [path, url] of Object.entries(
  import.meta.glob('../assets/shots/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }) as Record<string, string>,
)) {
  const file = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  const id = file.replace(/-\d+$/, '')
  ;(SHOTS[id] ||= []).push(url)
}
for (const list of Object.values(SHOTS)) list.sort()

const ALL = projects as Project[]
const CATEGORIES = ['All', 'AI', 'Apps', 'Games', 'Experiments', 'Web']

export function ProjectsApp() {
  const [cat, setCat] = useState('All')
  const [sel, setSel] = useState<Project | null>(null)

  useIntent(
    'projects',
    useCallback((id: string) => setSel(ALL.find((p) => p.id === id) ?? null), []),
  )

  const list = ALL.filter((p) => cat === 'All' || p.category === cat)

  if (sel) return <ProjectPage project={sel} onBack={() => setSel(null)} />

  return (
    <div className="portfolio-browser flex h-full">
      <aside className="w-40 shrink-0 space-y-0.5 border-r border-black/5 bg-white/25 p-2">
        <p className="px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">
          Library
        </p>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
              cat === c ? 'bg-lavender-deep/15 font-medium text-plum' : 'text-ink-soft hover:bg-black/5'
            }`}
          >
            {c}
            <span className="text-[11px] tabular-nums opacity-60">
              {c === 'All' ? ALL.length : ALL.filter((p) => p.category === c).length}
            </span>
          </button>
        ))}
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="project-grid grid grid-cols-2 gap-3">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => setSel(p)}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white/50 text-left transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-[0_8px_24px_-8px_rgba(40,25,70,0.25)]"
            >
              {SHOTS[p.id]?.[0] && (
                <img
                  src={SHOTS[p.id][0]}
                  alt=""
                  loading="lazy"
                  className="h-24 w-full border-b border-black/5 bg-white object-cover object-top"
                />
              )}
              <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold tracking-tight">{p.title}</span>
                {p.flagship && (
                  <span className="rounded-full bg-lavender-deep/15 px-2 py-0.5 text-[10px] font-semibold text-plum">
                    flagship
                  </span>
                )}
              </div>
              <p className="mt-1.5 line-clamp-3 flex-1 text-[12px] leading-relaxed text-ink-soft">
                {p.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.technologies.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectPage({ project: p, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-5">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-[12.5px] font-medium text-ink-soft hover:text-ink">
        ‹ All projects
      </button>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
        {p.flagship && (
          <span className="rounded-full bg-lavender-deep/15 px-2 py-0.5 text-[11px] font-semibold text-plum">flagship</span>
        )}
      </div>
      <p className="mt-1 text-[12.5px] text-ink-soft">{p.category} · {p.status}</p>

      <p className="mt-4 text-[13.5px] leading-relaxed">{p.description}</p>

      {SHOTS[p.id]?.length > 0 && <Gallery shots={SHOTS[p.id]} title={p.title} />}

      {p.highlights && p.highlights.length > 0 && (
        <>
          <h2 className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-ink-soft">What it does</h2>
          <ul className="mt-1.5 space-y-1">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lavender-deep" />
                {h}
              </li>
            ))}
          </ul>
        </>
      )}

      {p.technologies.length > 0 && (
        <>
          <h2 className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Technologies</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.technologies.map((t) => (
              <span key={t} className="rounded-lg bg-black/5 px-2 py-1 text-[12px] font-medium">{t}</span>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex gap-2">
        {p.github && (
          <a
            href={p.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-plum px-4 py-2 text-[12.5px] font-medium text-cream transition-opacity hover:opacity-90"
          >
            View on GitHub ↗
          </a>
        )}
        {p.demo && (
          <a
            href={p.demo}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-black/10 bg-white/60 px-4 py-2 text-[12.5px] font-medium"
          >
            Live demo ↗
          </a>
        )}
        {p.placeholder && (
          <span className="rounded-xl bg-black/5 px-4 py-2 text-[12.5px] text-ink-soft">Details coming soon</span>
        )}
      </div>
    </div>
  )
}

function Gallery({ shots, title }: { shots: string[]; title: string }) {
  const [active, setActive] = useState(0)
  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-black/8 bg-white">
        <img src={shots[active]} alt={`${title} screenshot ${active + 1}`} className="w-full" />
      </div>
      {shots.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {shots.map((s, i) => (
            <button
              key={s}
              onClick={() => setActive(i)}
              aria-label={`${title} screenshot ${i + 1}`}
              className={`h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                i === active ? 'border-lavender-deep' : 'border-transparent hover:border-black/15'
              }`}
            >
              <img src={s} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
