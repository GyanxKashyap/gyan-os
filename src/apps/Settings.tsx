import { useEffect, useState } from 'react'
import { useSettings, ACCENTS, type WallpaperId } from '../store/settings'
import { WALLPAPERS, WallpaperSvg } from '../desktop/Wallpaper'

export function SettingsApp() {
  const { wallpaper, accent, reduceMotion, setWallpaper, setAccent, setReduceMotion } = useSettings()
  const [aizenStatus, setAizenStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    let alive = true
    fetch('/chat', { method: 'OPTIONS' })
      .then((r) => alive && setAizenStatus(r.ok || r.status === 405 ? 'online' : 'offline'))
      .catch(() => alive && setAizenStatus('offline'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-6 px-6 py-5">
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Appearance</h2>

        <div className="mt-2 rounded-2xl border border-black/8 bg-white/50 p-4">
          <p className="text-[12.5px] font-medium">Wallpaper</p>
          <div className="mt-2 flex gap-3">
            {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => (
              <button
                key={id}
                onClick={() => setWallpaper(id)}
                className={`overflow-hidden rounded-xl border-2 transition-colors ${
                  wallpaper === id ? 'border-lavender-deep' : 'border-transparent hover:border-black/15'
                }`}
                aria-label={`Wallpaper: ${WALLPAPERS[id].label}`}
              >
                <div className="relative h-14 w-24">
                  <WallpaperSvg p={WALLPAPERS[id].p} className="h-full w-full" />
                </div>
                <span className="block bg-white/60 py-0.5 text-center text-[10.5px] font-medium text-ink-soft">
                  {WALLPAPERS[id].label}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-[12.5px] font-medium">Accent</p>
          <div className="mt-2 flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.color)}
                title={a.label}
                aria-label={`Accent: ${a.label}`}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  accent === a.color ? 'ring-2 ring-ink/40 ring-offset-2 ring-offset-white/60' : ''
                }`}
                style={{ background: a.color }}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[12.5px] font-medium">Animations</p>
              <p className="text-[11.5px] text-ink-soft">Window springs, dock magnification</p>
            </div>
            <Toggle on={!reduceMotion} onChange={(v) => setReduceMotion(!v)} label="Animations" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Aizen</h2>
        <div className="mt-2 rounded-2xl border border-black/8 bg-white/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-medium">Model status</p>
            <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  aizenStatus === 'online' ? 'bg-[#7dab5c]' : aizenStatus === 'offline' ? 'bg-[#c9c4cf]' : 'bg-ink-soft/50'
                }`}
              />
              {aizenStatus === 'checking' ? 'checking…' : aizenStatus}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
            <p>Checkpoint: <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">aizen_phase5.pt</code> (v3)</p>
            <p>Generation: temperature 0.5 · top-k 20 — server defaults</p>
            <p className="text-[11px] text-ink-soft/80">
              Sliders arrive once the backend accepts per-request generation settings.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">System</h2>
        <div className="mt-2 rounded-2xl border border-black/8 bg-white/50 p-4 text-[12.5px]">
          <p className="font-semibold tracking-tight">Gyan OS</p>
          <p className="mt-0.5 text-ink-soft">Version 0.1.0 · built by Gyan</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
            More than a portfolio — a digital universe. React, TypeScript, Tailwind and springs;
            no templates, no fake data. <em>Gyan</em> means knowledge.
          </p>
        </div>
      </section>
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-lavender-deep' : 'bg-black/15'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${on ? 'left-[18px]' : 'left-0.5'}`}
      />
    </button>
  )
}
