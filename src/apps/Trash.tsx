import { AppIcon } from '../desktop/AppIcon'

/** The desktop shortcuts Gyan threw away — apps live in the dock now. */
const DISCARDED = [
  { icon: 'aizen', accent: '#8d7fb5', title: 'Aizen' },
  { icon: 'about', accent: '#b48ead', title: 'About Me' },
  { icon: 'lab', accent: '#88a3bf', title: 'Lab' },
  { icon: 'knowledge', accent: '#a3b284', title: 'Knowledge' },
  { icon: 'settings', accent: '#9a93a6', title: 'Settings' },
]

export function TrashApp() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex gap-3">
        {DISCARDED.map((d) => (
          <div key={d.title} className="flex flex-col items-center gap-1 opacity-55 saturate-[0.6]" title={d.title}>
            <AppIcon icon={d.icon} accent={d.accent} size={40} />
            <span className="text-[10px] text-ink-soft">{d.title}</span>
          </div>
        ))}
      </div>
      <p className="text-[13.5px] font-semibold">Old desktop shortcuts</p>
      <p className="max-w-sm text-[12px] leading-relaxed text-ink-soft">
        The desktop is for files now — these apps moved to the dock, so their shortcuts ended up
        here. Nothing else gets thrown away: every project ships.
      </p>
    </div>
  )
}
