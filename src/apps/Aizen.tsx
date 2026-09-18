import { useCallback, useEffect, useRef, useState } from 'react'
import data from '../data/aizen.json'
import { AppIcon } from '../desktop/AppIcon'
import { useIntent } from '../lib/useIntent'

import { streamAizen, generationError, AizenRequestError } from '../lib/aizenClient'
import { useAizenStatus, type AizenStatus as Status } from '../store/aizen'

const TABS = ['Chat', 'Story', 'Model', 'Benchmark', 'Training', 'About'] as const
type Tab = (typeof TABS)[number]


export function AizenApp() {
  const [tab, setTab] = useState<Tab>('Chat')
  const { status, setStatus, refresh } = useAizenStatus()

  useIntent(
    'aizen',
    useCallback((v: string) => {
      if ((TABS as readonly string[]).includes(v)) setTab(v as Tab)
    }, []),
  )


  return (
    <div className="flex h-full flex-col">
      <nav className="app-tabs flex shrink-0 items-center gap-1 border-b border-black/5 px-3 py-2">
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
        <button onClick={() => void refresh()} disabled={status === 'checking'} aria-label="Check Aizen connection" className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-plum">
          <StatusPill status={status} />
        </button>
      </nav>
      <div className="min-h-0 flex-1 overflow-auto">
        <div hidden={tab !== 'Chat'} className="h-full"><Chat status={status} onStatus={setStatus} /></div>
        <div hidden={tab !== 'Story'} className="h-full"><Story status={status} onStatus={setStatus} /></div>
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
    online: { dot: 'bg-[#7dab5c]', text: 'local demo online' },
    offline: { dot: 'bg-[#c9c4cf]', text: 'local demo offline' },
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
  failed?: boolean
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
  const requestRef = useRef<AbortController | null>(null)
  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [msgs])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy || requestRef.current) return
    setInput('')
    // the backend accepts [[question, answer], ...] and fits as many recent turns as the 512 context allows
    const history: [string, string][] = []
    for (let i = 0; i + 1 < msgs.length; i += 2) {
      const u = msgs[i], a = msgs[i + 1]
      if (u.role === 'user' && a.role === 'aizen' && a.text && !a.failed) history.push([u.text, a.text])
    }
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'aizen', text: '' }])
    setBusy(true)
    const request = new AbortController()
    requestRef.current = request
    try {
      await streamAizen('/chat', { question: q, history: history.slice(-6) }, (chunk) => {
        setMsgs((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'aizen', text: copy[copy.length - 1].text + chunk }
          return copy
        })
      }, request.signal)
      onStatus('online')
    } catch (error) {
      if (!request.signal.aborted && !(error instanceof AizenRequestError && error.status < 500)) onStatus('offline')
      setMsgs((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'aizen',
          failed: true,
          text: `${copy[copy.length - 1].text}${copy[copy.length - 1].text ? '\n\n' : ''}${generationError(error, request.signal.aborted)}`,
        }
        return copy
      })
    } finally {
      requestRef.current = null
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
              Aizen is a local ~40M-parameter model trained from scratch — short questions work best:
              arithmetic, facts, logic, small talk. It remembers the last few turns, so follow-ups like
              “and plus 3?” work.
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
            maxLength={2048}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aizen anything…"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/60"
            aria-label="Ask Aizen"
          />
          {busy && <button type="button" onClick={() => requestRef.current?.abort()} className="px-2 py-1 text-xs text-ink-soft">Stop</button>}
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
        up, this chat streams real generations from <code className="text-[11px]">aizen_phase8.pt</code>.
        Meanwhile, the Model and Benchmark tabs show what it can do.
      </p>
    </div>
  )
}

/* ---------------- Story ---------------- */

function Story({ status, onStatus }: { status: Status; onStatus: (s: Status) => void }) {
  const [prompt, setPrompt] = useState('Once upon a time')
  const [out, setOut] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  useEffect(() => () => requestRef.current?.abort(), [])
  const [busy, setBusy] = useState(false)

  const tell = async () => {
    if (busy || requestRef.current) return
    setOut('')
    setBusy(true)
    const request = new AbortController()
    requestRef.current = request
    try {
      await streamAizen('/story', { prompt: prompt.trim() || 'Once upon a time', tokens: 220, temperature: 0.85 },
        (chunk) => setOut((text) => text + chunk), request.signal)
      onStatus('online')
    } catch (error) {
      if (!request.signal.aborted && !(error instanceof AizenRequestError && error.status < 500)) onStatus('offline')
      setOut((text) => `${text}${text ? '\n\n' : ''}${generationError(error, request.signal.aborted)}`)
    } finally {
      requestRef.current = null
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Aizen Storyteller</h1>
      {busy && <button onClick={() => requestRef.current?.abort()} className="mt-2 rounded-lg border border-black/10 px-3 py-2 text-xs">Stop generation</button>}
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
        The same 40M weights <em>before</em> the task fine-tune — a pure language model that only ever read
        TinyStories. Give it an opening, not a question.
      </p>
      {status === 'offline' && (
        <p className="mt-3 rounded-xl border border-black/8 bg-white/50 px-4 py-3 text-[12.5px] text-ink-soft">
          Offline right now — the storyteller runs on Gyan&rsquo;s MacBook alongside the chat model.
        </p>
      )}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/8 bg-white/60 px-3 py-2 focus-within:border-lavender-deep/50">
        <input
            maxLength={2048}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && tell()}
          placeholder="Once upon a time…"
          className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/60"
          aria-label="Story opening"
        />
        <button
          onClick={tell}
          disabled={busy}
          className="rounded-lg bg-lavender-deep px-3 py-1.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
        >
          {busy ? 'Writing…' : 'Tell the story'}
        </button>
      </div>
      {(out || busy) && (
        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-black/5 bg-white/60 px-5 py-4 text-[13.5px] leading-relaxed">
          {out || <span className="animate-pulse text-ink-soft">…</span>}
        </div>
      )}
      <p className="mt-3 text-[11px] text-ink-soft/80">
        Sampled at temperature 0.85, top-k 40, up to 220 tokens — expect charming nonsense; that is what a
        40M model that read children’s stories sounds like.
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
  const [open, setOpen] = useState<number | null>(8)
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Training history</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        Eight completed phases, each judged against the frozen eval — 17% to 60.75%.
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
