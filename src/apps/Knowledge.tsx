import { useCallback, useState } from 'react'
import data from '../data/knowledge.json'
import { useIntent } from '../lib/useIntent'

interface Note {
  id: string
  title: string
  category: string
  date: string
  related: string[]
  content: string[]
}

const NOTES = data.notes as Note[]

export function KnowledgeApp() {
  const [cat, setCat] = useState('All')
  const [sel, setSel] = useState<Note | null>(null)

  useIntent(
    'knowledge',
    useCallback((id: string) => setSel(NOTES.find((n) => n.id === id) ?? null), []),
  )

  if (sel) return <NoteView note={sel} onBack={() => setSel(null)} />

  const list = NOTES.filter((n) => cat === 'All' || n.category === cat)

  return (
    <div className="flex h-full">
      <aside className="w-44 shrink-0 space-y-0.5 border-r border-black/5 bg-white/25 p-2">
        <p className="px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">
          Library
        </p>
        {['All', ...data.categories].map((c) => {
          const count = c === 'All' ? NOTES.length : NOTES.filter((n) => n.category === c).length
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors ${
                cat === c ? 'bg-lavender-deep/15 font-medium text-plum' : 'text-ink-soft hover:bg-black/5'
              }`}
            >
              <span className="truncate">{c}</span>
              <span className="text-[11px] tabular-nums opacity-60">{count}</span>
            </button>
          )
        })}
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {list.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-ink-soft">
            No notes here yet — the library grows over time.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((n) => (
              <button
                key={n.id}
                onClick={() => setSel(n)}
                className="rounded-xl border border-black/8 bg-white/50 px-4 py-3 text-left transition-colors hover:bg-white/75"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-semibold tracking-tight">{n.title}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-soft">{n.date}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
                  {n.content[0]}
                </p>
                <span className="mt-2 inline-block rounded-md bg-black/5 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft">
                  {n.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NoteView({ note, onBack }: { note: Note; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-7 py-6">
      <button onClick={onBack} className="mb-4 text-[12.5px] font-medium text-ink-soft hover:text-ink">
        ‹ Library
      </button>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        {note.category} · {note.date}
      </p>
      <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">{note.title}</h1>
      <div className="mt-4 space-y-3">
        {note.content.map((p, i) => (
          <p key={i} className="text-[13.5px] leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </div>
      {note.related.length > 0 && (
        <div className="mt-6 border-t border-black/5 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Related</span>
          <div className="mt-1.5 flex gap-1.5">
            {note.related.map((r) => (
              <span key={r} className="rounded-lg bg-black/5 px-2 py-1 text-[12px] font-medium">{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
