import { useRef } from 'react'
import { useSettings, ACCENTS, type WallpaperId } from '../store/settings'
import { useCustomWallpapers } from '../store/customWallpapers'
import { WALLPAPERS, WallpaperSvg } from '../desktop/Wallpaper'

import { useAizenStatus } from '../store/aizen'

export function SettingsApp() {
  const {
    wallpaper, accent, reduceMotion, liveWallpaper, dockAutoHide,
    setWallpaper, setAccent, setReduceMotion, setLiveWallpaper, setDockAutoHide,
  } = useSettings()
  const { status: aizenStatus, meta, refresh } = useAizenStatus()

  return (
    <div className="mx-auto max-w-lg space-y-6 px-6 py-5">
      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Appearance</h2>

        <div className="mt-2 rounded-2xl border border-black/8 bg-white/50 p-4">
          <p className="text-[12.5px] font-medium">Wallpaper</p>
          <div className="mt-2 flex flex-wrap gap-3">
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

          <CustomWallpapers active={wallpaper} onSelect={setWallpaper} />

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[12.5px] font-medium">Live wallpaper</p>
              <p className="text-[11.5px] text-ink-soft">Drifting dunes, breathing light{wallpaper === 'night' ? ', twinkling stars' : ''}</p>
            </div>
            <Toggle on={liveWallpaper && !reduceMotion} onChange={setLiveWallpaper} label="Live wallpaper" />
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
              <p className="text-[12.5px] font-medium">Automatically hide the Dock</p>
              <p className="text-[11.5px] text-ink-soft">Slides away when idle; bottom edge brings it back</p>
            </div>
            <Toggle on={dockAutoHide} onChange={setDockAutoHide} label="Automatically hide the Dock" />
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
          <button onClick={() => void refresh()} disabled={aizenStatus === 'checking'} className="mt-2 text-xs underline disabled:opacity-50">Check connection</button>
          <div className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
            <p>Chat: <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">{meta?.checkpoint.split('/').pop() ?? 'aizen_phase8.pt'}</code> (v6, ~40M) · Story: <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">{meta?.story_checkpoint.split('/').pop() ?? 'aizen_phase8_pretrained.pt'}</code></p>
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

function CustomWallpapers({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const items = useCustomWallpapers((s) => s.items)
  const add = useCustomWallpapers((s) => s.add)
  const remove = useCustomWallpapers((s) => s.remove)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mt-3">
      <p className="text-[12.5px] font-medium">My wallpapers</p>
      <p className="text-[11px] text-ink-soft">
        Add any image or video from your computer — videos play as live wallpapers. Saved in Gyan OS.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        {items.map((w) => {
          const id = `custom:${w.id}`
          return (
            <div key={w.id} className="group relative">
              <button
                onClick={() => onSelect(id)}
                className={`block overflow-hidden rounded-xl border-2 transition-colors ${
                  active === id ? 'border-lavender-deep' : 'border-transparent hover:border-black/15'
                }`}
                aria-label={`Wallpaper: ${w.name}`}
                title={w.name}
              >
                {w.type.startsWith('video/') ? (
                  <video src={w.url} className="h-14 w-24 object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={w.url} alt="" className="h-14 w-24 object-cover" />
                )}
                <span className="block max-w-24 truncate bg-white/60 px-1 py-0.5 text-center text-[10.5px] font-medium text-ink-soft">
                  {w.name}
                </span>
              </button>
              <button
                onClick={() => remove(w.id)}
                aria-label={`Delete wallpaper ${w.name}`}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-plum text-cream shadow group-hover:flex"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          )
        })}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-[76px] w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/15 text-ink-soft transition-colors hover:border-lavender-deep/60 hover:text-ink"
          aria-label="Add wallpaper"
        >
          <span className="text-[18px] leading-none">+</span>
          <span className="text-[10.5px] font-medium">Add</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) add(f)
            e.target.value = ''
          }}
        />
      </div>
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
