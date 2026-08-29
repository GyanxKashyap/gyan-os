import { useCallback, useEffect, useRef, useState } from 'react'
import data from '../data/aizen.json'
import { AppIcon } from '../desktop/AppIcon'
import { useIntent } from '../lib/useIntent'

const TABS = ['Chat', 'Model', 'Benchmark', 'Training', 'About'] as const
type Tab = (typeof TABS)[number]

type Status = 'checking' | 'online' | 'offline'

export function AizenApp() {
  const [tab, setTab] = useState<Tab>('Chat')
  const [status, setStatus] = useState<Status>('checking')

  useIntent(
    'aizen',
    useCallback((v: string) => {
      if ((TABS as readonly string[]).includes(v)) setTab(v as Tab)
    }, []),
  )

  useEffect(() => {
    let alive = true
    // OPTIONS /chat: Flask answers 200 when up; the dev proxy answers 5xx when
    // the backend is down; a static host answers 404.
    fetch('/chat', { method: 'OPTIONS' })
      .then((r) => alive && setStatus(r.ok || r.status === 405 ? 'online' : 'offline'))
      .catch(() => alive && setStatus('offline'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="flex h-full flex-col">
      <nav className="flex shrink-0 items-center gap-1 border-b border-black/5 px-3 py-2">
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
        <div className="flex-1" />
        <StatusPill status={status} />
      </nav>
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === 'Chat' && <Chat status={status} onStatus={setStatus} />}
        {tab === 'Model' && <Model />}
        {tab === 'Benchmark' && <Benchmark />}
        {tab === 'Training' && <Training />}
        {tab === 'About' && <About />}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Status }) {
  const cfg = {
    checking: { dot: 'bg-ink-soft/50', text: 'checking…' },
    online: { dot: 'bg-[#7dab5c]', text: 'model online' },
    offline: { dot: 'bg-[#c9c4cf]', text: 'model offline' },
  }[status]
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </span>
  )
}

/* ---------------- Chat ---------------- */

interface Msg {
  role: 'user' | 'aizen'
  text: string
}

const QUICK = [
  { label: 'Explain', prompt: 'Why is the sky blue?' },
  { label: 'Solve', prompt: 'What is 63 + 26?' },
  { label: 'Reason', prompt: 'If all cats are animals, is a cat an animal?' },
  { label: 'Write', prompt: 'Tell me a short story about the moon.' },
] as const

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Good night.'
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

function Chat({ status, onStatus }: { status: Status; onStatus: (s: Status) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [msgs])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'aizen', text: '' }])
    setBusy(true)
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`)
      onStatus('online')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value)
        setMsgs((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'aizen', text: copy[copy.length - 1].text + chunk }
          return copy
        })
      }
    } catch {
      onStatus('offline')
      setMsgs((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'aizen',
          text: '⚠ Aizen is offline. The model runs locally on Gyan’s machine and isn’t reachable right now.',
        }
        return copy
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {msgs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <AppIcon icon="aizen" accent="#8d7fb5" size={64} />
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight">{greeting()}</h1>
              <p className="mt-1 text-[14px] text-ink-soft">What would you like to explore?</p>
            </div>
            {status === 'offline' && <OfflineCard />}
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.prompt)}
                  className="rounded-xl border border-black/8 bg-white/50 px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-white/80"
                  title={q.prompt}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <p className="max-w-md text-[11px] leading-relaxed text-ink-soft/80">
              Aizen is a tiny ~16M-parameter model trained from scratch — it does best with short
              questions: arithmetic, simple facts, small talk and short stories.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                  m.role === 'user'
                    ? 'self-end bg-lavender-deep text-white'
                    : 'self-start border border-black/5 bg-white/60 text-ink'
                }`}
              >
                {m.text || <span className="animate-pulse text-ink-soft">…</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <form
        className="shrink-0 border-t border-black/5 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-black/8 bg-white/60 px-3 py-2 focus-within:border-lavender-deep/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aizen anything…"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/60"
            aria-label="Ask Aizen"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-lg bg-lavender-deep px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

function OfflineCard() {
  return (
    <div className="max-w-md rounded-2xl border border-black/8 bg-white/50 px-5 py-4 text-left">
      <p className="text-[13px] font-semibold">Aizen is offline</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
        The model isn&rsquo;t an API — it runs locally on Gyan&rsquo;s MacBook. When the backend is
        up, this chat streams real generations from <code className="text-[11px]">aizen_phase5.pt</code>.
        Meanwhile, the Model and Benchmark tabs show what it can do.
      </p>
    </div>
  )
}

/* ---------------- Model ---------------- */

function Model() {
  const m = data.model
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <div className="flex items-center gap-4">
        <AppIcon icon="aizen" accent="#8d7fb5" size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {m.name} <span className="text-[15px] font-medium text-ink-soft">{m.version}</span>
          </h1>
          <p className="text-[13px] text-ink-soft">{m.params} · {m.checkpoint}</p>
        </div>
      </div>
      <dl className="mt-6 overflow-hidden rounded-2xl border border-black/8 bg-white/50">
        {m.specs.map((s, i) => (
          <div key={s.label} className={`flex gap-4 px-4 py-3 ${i > 0 ? 'border-t border-black/5' : ''}`}>
            <dt className="w-36 shrink-0 text-[12.5px] font-medium text-ink-soft">{s.label}</dt>
            <dd className="text-[12.5px] leading-relaxed">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------------- Benchmark ---------------- */

function Benchmark() {
  const versions = data.benchmark.versions
  const [sel, setSel] = useState(versions[versions.length - 1].id)
  const selected = versions.find((v) => v.id === sel)!

  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Aizen progress</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">{data.benchmark.note}</p>

      <div className="mt-5 flex flex-col gap-2">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => setSel(v.id)}
            className={`rounded-xl border px-4 py-2.5 text-left transition-colors ${
              sel === v.id ? 'border-lavender-deep/50 bg-white/70' : 'border-black/5 bg-white/40 hover:bg-white/60'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">
                {v.id}
                <span className="ml-2 font-normal text-ink-soft">{v.label}</span>
              </span>
              <span className="text-[14px] font-semibold tabular-nums">{v.score}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/8">
              <div className="h-full rounded-full bg-lavender-deep" style={{ width: `${v.score}%` }} />
            </div>
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-[13px] font-semibold uppercase tracking-wider text-ink-soft">
        {selected.id} by category
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-black/8 bg-white/50 p-4">
        {Object.entries(selected.categories).map(([cat, score]) => (
          <div key={cat}>
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-soft">{cat}</span>
              <span className="font-medium tabular-nums">{score}%</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/8">
              <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: '#b394cf' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Training ---------------- */

function Training() {
  const [open, setOpen] = useState<number | null>(5)
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Training history</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        Five completed phases, each judged against the frozen eval.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {data.phases.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-black/8 bg-white/50">
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/40"
              onClick={() => setOpen(open === p.id ? null : p.id)}
              aria-expanded={open === p.id}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lavender-deep/15 text-[11px] font-semibold text-plum">
                {p.id}
              </span>
              <span className="flex-1 text-[13.5px] font-semibold">{p.name}</span>
              <span className={`text-ink-soft transition-transform ${open === p.id ? 'rotate-90' : ''}`}>›</span>
            </button>
            {open === p.id && (
              <div className="space-y-2.5 border-t border-black/5 px-4 py-3 text-[12.5px] leading-relaxed">
                <Row k="Objective" v={p.objective} />
                <Row k="Work" v={p.work} />
                <Row k="Outcome" v={p.outcome} />
                <Row k="Lesson" v={p.lesson} />
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-6 text-[13px] font-semibold uppercase tracking-wider text-ink-soft">Planned</h2>
      <div className="mt-2 flex flex-col gap-1.5">
        {data.roadmap.map((r) => (
          <div key={r.phase} className="flex items-baseline gap-3 rounded-xl border border-dashed border-black/10 bg-white/30 px-4 py-2.5">
            <span className="text-[12px] font-semibold text-ink-soft">Phase {r.phase}</span>
            <span className="text-[12.5px]">
              <span className="font-medium">{r.name}</span>
              <span className="text-ink-soft"> — {r.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="font-semibold text-ink">{k}: </span>
      <span className="text-ink-soft">{v}</span>
    </p>
  )
}

/* ---------------- About ---------------- */

function About() {
  return (
    <div className="mx-auto max-w-xl space-y-4 px-6 py-6 text-[13.5px] leading-relaxed">
      <h1 className="text-xl font-semibold tracking-tight">About Aizen</h1>
      <p>
        Aizen started as a 0.8M-parameter character-level model trained on Shakespeare — the classic
        first LLM exercise. It grew into a from-scratch question-answering model, and then into a
        proper research loop: build a frozen benchmark, change one thing, retrain, measure.
      </p>
      <p>
        Everything is hand-built — the Transformer, the BPE tokenizer, the training loops, the eval
        harness. No pretrained weights, no cloud GPUs: every run happens on a MacBook.
      </p>
      <div className="rounded-2xl border border-black/8 bg-white/50 px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">Integrity rules</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12.5px] text-ink-soft">
          <li>The 400-question eval is frozen — never re-tuned against.</li>
          <li>One training run per approved experiment.</li>
          <li>Hard cap of 30–50M parameters — improvement must come from data and method, not scale.</li>
        </ul>
      </div>
      <p className="text-ink-soft">
        The name is Gyan&rsquo;s choice — and <em>gyan</em> means knowledge.
      </p>
    </div>
  )
}
