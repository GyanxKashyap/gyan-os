interface Props {
  icon: string
  accent: string
  size?: number
}

/** Custom icon images: drop `<id>.png` (or .jpg/.webp) into src/assets/icons/
    — e.g. aizen.png, projects.png, about.png, lab.png, knowledge.png,
    settings.png, trash.png — and that app switches from the drawn glyph to
    the image everywhere (desktop, dock, windows, search). */
const ICON_IMAGES: Record<string, string> = {}
for (const [path, url] of Object.entries(
  import.meta.glob('../assets/icons/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }) as Record<string, string>,
)) {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  ICON_IMAGES[name] = url
}

/** Rounded-tile app icon — a custom image when provided, else a drawn glyph. */
export function AppIcon({ icon, accent, size = 52 }: Props) {
  const img = ICON_IMAGES[icon]
  if (img) {
    return (
      <img
        src={img}
        alt=""
        width={size}
        height={size}
        draggable={false}
        aria-hidden
        className="rounded-[23.4%] object-cover"
      />
    )
  }
  return <DrawnIcon icon={icon} accent={accent} size={size} />
}

function DrawnIcon({ icon, accent, size = 52 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={`tile-${icon}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="1" stopColor={accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#tile-${icon})`} stroke="rgba(255,255,255,0.7)" />
      <g stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {glyph(icon)}
      </g>
    </svg>
  )
}

function glyph(icon: string) {
  switch (icon) {
    case 'aizen': // a quiet spark / neuron
      return (
        <>
          <circle cx="32" cy="32" r="6" fill="currentColor" stroke="none" style={{ color: 'inherit' }} />
          <circle cx="32" cy="32" r="6" />
          <path d="M32 14v8M32 42v8M14 32h8M42 32h8M20 20l6 6M44 44l-6-6M44 20l-6 6M20 44l6-6" />
        </>
      )
    case 'projects': // folder
      return <path d="M15 24c0-2 1.5-4 4-4h8l4 5h14c2.5 0 4 2 4 4v13c0 2.5-1.5 4-4 4H19c-2.5 0-4-1.5-4-4z" />
    case 'about': // person
      return (
        <>
          <circle cx="32" cy="25" r="7" />
          <path d="M18 47c2-8 7-11 14-11s12 3 14 11" />
        </>
      )
    case 'lab': // flask
      return (
        <>
          <path d="M27 16v12L17 43c-1.5 3 .5 6 4 6h22c3.5 0 5.5-3 4-6L37 28V16" />
          <path d="M24 16h16" />
        </>
      )
    case 'knowledge': // open book
      return (
        <>
          <path d="M32 20c-4-3-9-4-14-3v26c5-1 10 0 14 3 4-3 9-4 14-3V17c-5-1-10 0-14 3z" />
          <path d="M32 20v26" />
        </>
      )
    case 'settings': // sliders
      return (
        <>
          <path d="M18 24h28M18 40h28" />
          <circle cx="27" cy="24" r="4" fill="#fff" />
          <circle cx="38" cy="40" r="4" fill="#fff" />
        </>
      )
    case 'trash':
      return (
        <>
          <path d="M20 24h24l-2.5 22c-.2 2-1.8 3-3.7 3H26.2c-1.9 0-3.5-1-3.7-3z" />
          <path d="M18 24h28M27 24v-4c0-1.5 1-3 3-3h4c2 0 3 1.5 3 3v4" />
        </>
      )
    default:
      return <circle cx="32" cy="32" r="12" />
  }
}
