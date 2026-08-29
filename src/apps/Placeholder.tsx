import { AppIcon } from '../desktop/AppIcon'

interface Props {
  title: string
  tagline: string
  icon: string
  accent: string
  note: string
}

/** Milestone-1 placeholder body shared by all apps. */
export function Placeholder({ title, tagline, icon, accent, note }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
      <AppIcon icon={icon} accent={accent} size={72} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{tagline}</p>
      </div>
      <p className="max-w-sm text-[13px] leading-relaxed text-ink-soft">{note}</p>
      <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium text-ink-soft">
        Coming in a later milestone
      </span>
    </div>
  )
}
