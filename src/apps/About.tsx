import { useCallback, useState } from 'react'
import about from '../data/about.json'
import { useIntent } from '../lib/useIntent'

/** Drop a photo (avatar.jpg/png/webp) and/or resume.pdf into src/assets/profile/
    — each one appears automatically once the file exists. */
const PROFILE = import.meta.glob('../assets/profile/*.{jpg,jpeg,png,webp,pdf}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const assetFor = (base: string) =>
  Object.entries(PROFILE).find(([p]) => p.split('/').pop()!.startsWith(base))?.[1]

const AVATAR = assetFor('avatar')
const RESUME = assetFor('resume')

interface Contact {
  label: string
  value: string
  href: string
  icon?: string
}

function ContactIcon({ name }: { name?: string }) {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  if (name === 'github')
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2" />
      </svg>
    )
  if (name === 'email')
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
        <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" />
      </svg>
    )
  if (name === 'linkedin')
    return (
      <svg {...common} fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.3 8.75 21 11.05 21 14.1V21h-4v-6.1c0-1.46-.03-3.34-2.05-3.34-2.05 0-2.36 1.59-2.36 3.23V21H9z" />
      </svg>
    )
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.5 13.5a4 4 0 0 0 5.6 0l2.6-2.6a4 4 0 1 0-5.6-5.6l-1 1" />
      <path d="M13.5 10.5a4 4 0 0 0-5.6 0l-2.6 2.6a4 4 0 1 0 5.6 5.6l1-1" />
    </svg>
  )
}
const TABS = ['About', 'Skills', 'Journey', 'Achievements'] as const
type Tab = (typeof TABS)[number]

export function AboutApp() {
  const [tab, setTab] = useState<Tab>('About')
  useIntent(
    'about',
    useCallback((v: string) => {
      if ((TABS as readonly string[]).includes(v)) setTab(v as Tab)
    }, []),
  )

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-black/5 px-6 pb-4 pt-5">
        <div className="flex items-center gap-4">
          {AVATAR ? (
            <img
              src={AVATAR}
              alt={about.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-white/90 to-lavender text-[22px] font-semibold text-plum shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
              {about.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{about.name}</h1>
            <p className="text-[12.5px] text-ink-soft">
              {about.role} · {about.age} · {about.location}
            </p>
          </div>
          <div className="flex-1" />
          {RESUME && (
            <a
              href={RESUME}
              download
              className="shrink-0 rounded-lg bg-plum px-3 py-1.5 text-[12px] font-medium text-cream transition-opacity hover:opacity-90"
            >
              Resume ↓
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(about.contacts as Contact[]).map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              title={c.value}
              className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-white/50 px-2.5 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:bg-white/85 hover:text-ink"
            >
              <ContactIcon name={c.icon} />
              {c.label}
            </a>
          ))}
        </div>
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-black/5 px-4 py-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1 text-[13px] font-medium transition-colors ${
              tab === t ? 'bg-lavender-deep/15 text-plum' : 'text-ink-soft hover:bg-black/5'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'About' && <AboutTab />}
        {tab === 'Skills' && <SkillsTab />}
        {tab === 'Journey' && <JourneyTab />}
        {tab === 'Achievements' && <AchievementsTab />}
      </div>
    </div>
  )
}

function AboutTab() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-6 py-6">
      <p className="text-[15px] leading-relaxed">{about.intro}</p>
      <p className="text-[13.5px] leading-relaxed text-ink-soft">{about.now}</p>
      <div>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
          Current interests
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {about.interests.map((i) => (
            <span key={i} className="rounded-lg bg-white/60 px-2.5 py-1 text-[12.5px] font-medium shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillsTab() {
  const s = about.skills
  return (
    <div className="mx-auto max-w-lg space-y-5 px-6 py-6">
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Strongest</h2>
        <div className="mt-2 space-y-2">
          {s.strong.map((k) => (
            <SkillRow key={k.name} name={k.name} note={k.note} level={3} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Working with</h2>
        <div className="mt-2 space-y-2">
          {s.working.map((k) => (
            <SkillRow key={k.name} name={k.name} note={k.note} level={2} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">
          Familiar with
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {s.familiar.map((k) => (
            <span key={k} className="rounded-lg bg-black/5 px-2.5 py-1 text-[12.5px] font-medium text-ink-soft">
              {k}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] text-ink-soft/80">
          Used in real projects, still learning the depths.
        </p>
      </section>
    </div>
  )
}

function SkillRow({ name, note, level }: { name: string; note: string; level: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/8 bg-white/50 px-4 py-2.5">
      <span className="w-28 shrink-0 text-[13px] font-semibold">{name}</span>
      <span className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1.5 w-5 rounded-full ${n <= level ? 'bg-lavender-deep' : 'bg-black/10'}`} />
        ))}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">{note}</span>
    </div>
  )
}

function JourneyTab() {
  return (
    <div className="mx-auto max-w-lg px-6 py-6">
      <div className="relative flex flex-col gap-5 pl-6">
        <span className="absolute bottom-2 left-[7px] top-2 w-px bg-lavender-deep/25" />
        {about.journey.map((j, i) => (
          <div key={j.title} className="relative">
            <span
              className={`absolute -left-6 top-1 h-[15px] w-[15px] rounded-full border-2 ${
                i === about.journey.length - 1
                  ? 'border-lavender-deep bg-lavender-deep'
                  : 'border-lavender-deep/50 bg-cream'
              }`}
            />
            <h3 className="text-[13.5px] font-semibold">{j.title}</h3>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{j.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AchievementsTab() {
  return (
    <div className="mx-auto max-w-lg space-y-3 px-6 py-6">
      {about.achievements.map((a) => (
        <div key={a.title} className="rounded-2xl border border-black/8 bg-white/50 px-5 py-4">
          <h3 className="text-[14px] font-semibold tracking-tight">{a.title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{a.detail}</p>
        </div>
      ))}
      <p className="pt-1 text-[11.5px] text-ink-soft/80">
        Just getting started — this list grows with every project.
      </p>
    </div>
  )
}
