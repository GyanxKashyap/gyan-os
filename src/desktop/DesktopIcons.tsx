import { APPS } from '../lib/apps'
import { AppIcon } from './AppIcon'
import { useWindows } from '../store/windows'

/** Desktop shows files only — apps live in the dock. */
const DESKTOP_APP_IDS = ['projects']

export function DesktopIcons() {
  const open = useWindows((s) => s.open)

  const items = APPS.filter((a) => DESKTOP_APP_IDS.includes(a.id)).map((a) => ({
    id: a.id,
    title: a.title,
    icon: a.icon,
    accent: a.accent,
    action: () => open(a.id),
  }))

  return (
    <div className="absolute right-4 top-12 z-[5] flex flex-col gap-1">
      {items.map((item) => (
        <button
          key={item.id}
          onDoubleClick={item.action}
          onClick={(e) => e.detail === 1 && e.currentTarget.focus()}
          onKeyDown={(e) => e.key === 'Enter' && item.action()}
          className="flex w-[86px] flex-col items-center gap-1 rounded-xl p-2 outline-none transition-colors hover:bg-white/15 focus-visible:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label={`Open ${item.title}`}
        >
          <AppIcon icon={item.icon} accent={item.accent} size={46} />
          <span className="rounded px-1 text-[12px] font-medium text-white [text-shadow:0_1px_2px_rgba(40,25,70,0.75),0_0_8px_rgba(40,25,70,0.35)]">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  )
}
