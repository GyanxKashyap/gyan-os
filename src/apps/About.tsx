import { useCallback, useState } from 'react'
import about from '../data/about.json'
import { useIntent } from '../lib/useIntent'

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
      <header className="flex shrink-0 items-center gap-4 border-b border-black/5 px-6 pb-4 pt-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-white/90 to-lavender text-[22px] font-semibold text-plum shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
          G
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{about.name}</h1>
          <p className="text-[12.5px] text-ink-soft">
            {about.role} · {about.age} · {about.location}
          </p>
        </div>
        <div className="flex-1" />
        <a
          href="https://github.com/GyanxKashyap"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-black/10 bg-white/50 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/80"
        >
          GitHub ↗
        </a>
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
