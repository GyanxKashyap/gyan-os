import { useCallback, useState } from 'react'
import curves from '../data/loss_curves.json'
import aizen from '../data/aizen.json'
import { useIntent } from '../lib/useIntent'

interface Run {
  id: string
  label: string
  points: { step: number; train: number; val: number }[]
}

const RUNS = curves as Run[]
const TABS = ['Timeline', 'Loss curves', 'Versions', 'Datasets'] as const
type Tab = (typeof TABS)[number]

export function LabApp() {
  const [tab, setTab] = useState<Tab>('Timeline')
  useIntent(
    'lab',
    useCallback((v: string) => {
      if ((TABS as readonly string[]).includes(v)) setTab(v as Tab)
    }, []),
  )
  return (
    <div className="flex h-full flex-col">
      <nav className="flex shrink-0 gap-1 border-b border-black/5 px-3 py-2">
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
        {tab === 'Timeline' && <Timeline />}
        {tab === 'Loss curves' && <LossCurves />}
        {tab === 'Versions' && <Versions />}
        {tab === 'Datasets' && <Datasets />}
      </div>
    </div>
  )
}

/* ---------- Timeline ---------- */

const TIMELINE = [
  { title: 'Aizen v0', sub: '14.3M char-level QA model — baseline 17.0%' },
  { title: 'Eval harness', sub: 'Frozen 400-question benchmark, 8 categories' },
  { title: 'Reasoning dataset', sub: '10k examples: multi-step, logic, instructions' },
  { title: 'Fine-tuning', sub: 'Answer-masked loss → v1 26.5%, v1b 28.75%' },
  { title: 'BPE tokenizer', sub: 'From scratch, 2048 vocab, 512 context → v2 35.75%' },
  { title: 'Pretraining', sub: 'TinyStories, 26.2M tokens, 16k steps → v3 45.25%' },
]

function Timeline() {
  return (
    <div className="mx-auto max-w-lg px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">The Aizen pipeline</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        Every experiment, in order — each judged by the frozen eval.
      </p>
      <div className="relative mt-5 flex flex-col gap-4 pl-6">
        <span className="absolute bottom-3 left-[7px] top-3 w-px bg-lavender-deep/25" />
        {TIMELINE.map((t, i) => (
          <div key={t.title} className="relative">
            <span
              className={`absolute -left-6 top-1 h-[15px] w-[15px] rounded-full border-2 ${
                i === TIMELINE.length - 1 ? 'border-lavender-deep bg-lavender-deep' : 'border-lavender-deep/50 bg-cream'
              }`}
            />
            <h3 className="text-[13.5px] font-semibold">{t.title}</h3>
            <p className="text-[12.5px] text-ink-soft">{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Loss curves ---------- */

function LossCurves() {
  const [sel, setSel] = useState(RUNS[RUNS.length - 2].id)
  const run = RUNS.find((r) => r.id === sel)!
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Loss curves</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        Real training logs from every run (metrics CSVs, unedited).
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {RUNS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSel(r.id)}
            className={`rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
              sel === r.id ? 'bg-lavender-deep text-white' : 'bg-black/5 text-ink-soft hover:bg-black/10'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <Chart run={run} />
    </div>
  )
}

function Chart({ run }: { run: Run }) {
  const W = 560
  const H = 240
  const PAD = { l: 42, r: 12, t: 14, b: 28 }
  const pts = run.points
  const maxStep = pts[pts.length - 1].step || 1
  const maxLoss = Math.max(...pts.map((p) => Math.max(p.train, p.val)))
  const minLoss = 0

  const x = (s: number) => PAD.l + (s / maxStep) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - minLoss) / (maxLoss - minLoss)) * (H - PAD.t - PAD.b)
  const path = (key: 'train' | 'val') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.step).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')

  const yTicks = [0, maxLoss / 2, maxLoss]
  const final = pts[pts.length - 1]

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-black/8 bg-white/55 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Loss curve for ${run.label}`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgba(0,0,0,0.07)" />
            <text x={PAD.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#5c5566">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={(W + PAD.l) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#5c5566">
          step (0 – {maxStep.toLocaleString()})
        </text>
        <path d={path('train')} fill="none" stroke="#8d7fb5" strokeWidth="2" strokeLinejoin="round" />
        <path d={path('val')} fill="none" stroke="#e0a583" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" />
      </svg>
      <div className="mt-2 flex items-center gap-4 text-[11.5px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-5 rounded bg-[#8d7fb5]" /> train
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-5 rounded bg-[#e0a583]" /> val
        </span>
        <span className="ml-auto tabular-nums">final val loss: {final.val}</span>
      </div>
    </div>
  )
}

/* ---------- Versions ---------- */

function Versions() {
  const versions = aizen.benchmark.versions
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Model versions</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">Every checkpoint that survived — nothing deleted, nothing hidden.</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-black/8 bg-white/50">
        {versions.map((v, i) => (
          <div key={v.id} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-black/5' : ''}`}>
            <span className="w-8 shrink-0 text-[13px] font-semibold">{v.id}</span>
            <code className="shrink-0 rounded bg-black/5 px-1.5 py-0.5 text-[11px] text-ink-soft">{v.checkpoint}</code>
            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">{v.label}</span>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums">{v.score}%</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-ink-soft/80">
        Plus the ancestor: tinygpt.pt — a 0.8M char-level model trained on Shakespeare, kept deliberately.
      </p>
    </div>
  )
}

/* ---------- Datasets ---------- */

const DATASETS = [
  { name: 'qa.txt', size: '~0.97 MB · 25,390 Q&A pairs', desc: '100% synthetic, deterministically generated: small talk, capitals, facts, arithmetic. Aizen v0 trained on exactly this one file.' },
  { name: 'aizen_phase2_train.txt', size: '10k examples', desc: 'Reasoning dataset: multi-step arithmetic, logic, and instruction-following formats.' },
  { name: 'aizen_phase3b_train.txt', size: '15k examples', desc: 'Phase 2 data plus a 5k targeted-fix set aimed at measured failure cases.' },
  { name: 'pretrain.txt (TinyStories)', size: '103 MB · 26.2M tokens', desc: 'ASCII-cleaned TinyStories corpus, tokenized with the 4096-vocab BPE for overnight pretraining.' },
  { name: 'data/eval.json', size: '400 questions · frozen', desc: 'The benchmark. Eight categories, never edited after creation, never trained on.' },
]

function Datasets() {
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Datasets</h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">Everything Aizen has ever seen.</p>
      <div className="mt-4 flex flex-col gap-2">
        {DATASETS.map((d) => (
          <div key={d.name} className="rounded-xl border border-black/8 bg-white/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <code className="text-[12.5px] font-semibold">{d.name}</code>
              <span className="shrink-0 text-[11px] tabular-nums text-ink-soft">{d.size}</span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
