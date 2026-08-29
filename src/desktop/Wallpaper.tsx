import { useSettings, type WallpaperId } from '../store/settings'
import { useCustomWallpapers } from '../store/customWallpapers'

interface Palette {
  sky: [string, string, string]
  sun: string
  dunes: [[string, string], [string, string], [string, string]]
  night?: boolean
  /** dominant color for chrome tinting */
  tint: [number, number, number]
}

export const WALLPAPERS: Record<WallpaperId, { label: string; p: Palette }> = {
  dusk: {
    label: 'Lavender dusk',
    p: {
      sky: ['#e9e0f4', '#e3d3e8', '#f0d9c9'],
      sun: '#fdf3e3',
      dunes: [['#cfc0e2', '#b7a6d4'], ['#b3a0cd', '#9784ba'], ['#8b78ab', '#6f5f92']],
      tint: [151, 132, 186],
    },
  },
  dawn: {
    label: 'Peach dawn',
    p: {
      sky: ['#fdeee2', '#f6ddd2', '#eed4da'],
      sun: '#fff7ea',
      dunes: [['#f0cbb4', '#e4b39a'], ['#dfa98f', '#cd9179'], ['#b97f6d', '#996657']],
      tint: [205, 145, 121],
    },
  },
  night: {
    label: 'Quiet night',
    p: {
      sky: ['#3d3654', '#4a4066', '#5d4d6e'],
      sun: '#8d7fb5',
      dunes: [['#524a6e', '#453e60'], ['#403856', '#342d48'], ['#2b2440', '#1f1a30']],
      tint: [111, 95, 146],
      night: true,
    },
  },
}

// deterministic star field for the night sky (no Math.random — stable render)
const STARS = Array.from({ length: 42 }, (_, i) => {
  const x = ((i * 379) % 1600) + ((i * 53) % 37)
  const y = ((i * 227) % 470) + 20
  const r = 0.8 + ((i * 7) % 10) / 8
  const delay = ((i * 13) % 60) / 10
  const dur = 2.5 + ((i * 11) % 30) / 10
  return { x, y, r, delay, dur }
})

/** Desktop wallpaper — a built-in SVG scene, or a user-added image/video. */
export function Wallpaper() {
  const id = useSettings((s) => s.wallpaper)
  const live = useSettings((s) => s.liveWallpaper)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const custom = useCustomWallpapers((s) =>
    id.startsWith('custom:') ? s.items.find((i) => `custom:${i.id}` === id) : undefined,
  )

  if (id.startsWith('custom:')) {
    // while IndexedDB is still loading (or the item was deleted), fall back to dusk
    if (custom) {
      return custom.type.startsWith('video/') ? (
        <video
          key={custom.id}
          src={custom.url}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={!reduceMotion}
          loop
          muted
          playsInline
          aria-hidden
        />
      ) : (
        <img
          key={custom.id}
          src={custom.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )
    }
    return <WallpaperSvg p={WALLPAPERS.dusk.p} live={false} className="absolute inset-0 h-full w-full" />
  }

  const { p } = WALLPAPERS[id as WallpaperId] ?? WALLPAPERS.dusk
  return <WallpaperSvg p={p} live={live && !reduceMotion} className="absolute inset-0 h-full w-full" />
}

export function WallpaperSvg({ p, live = false, className }: { p: Palette; live?: boolean; className?: string }) {
  const uid = p.sky[0].slice(1)
  return (
    <svg
      className={`${className ?? ''} ${live ? 'wp-live' : ''}`}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.45" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`sun-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        {p.dunes.map((d, i) => (
          <linearGradient key={i} id={`dune-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={d[0]} />
            <stop offset="1" stopColor={d[1]} />
          </linearGradient>
        ))}
        <filter id={`soften-${uid}`} x="-30%" y="-120%" width="160%" height="340%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill={`url(#sky-${uid})`} />

      {/* sun / moon glow — breathes when live */}
      <circle className="wp-sun" cx="1090" cy="340" r="560" fill={`url(#sun-${uid})`} />

      {/* stars, night only — twinkle when live */}
      {p.night && (
        <g>
          {STARS.map((s, i) => (
            <circle
              key={i}
              className="wp-star"
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#e9e0f4"
              opacity="0.7"
              style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
            />
          ))}
        </g>
      )}

      {/* drifting mist bands (very subtle) */}
      <g className="wp-mist" filter={`url(#soften-${uid})`}>
        <ellipse cx="400" cy="470" rx="420" ry="46" fill="#ffffff" opacity={p.night ? 0.06 : 0.1} />
        <ellipse cx="1250" cy="520" rx="520" ry="54" fill="#ffffff" opacity={p.night ? 0.05 : 0.08} />
      </g>

      {/* dunes — drawn wider than the viewBox so they can sway when live */}
      <g className="wp-dune wp-dune-1">
        <path d="M-200 560 C 150 480, 460 620, 800 560 C 1150 508, 1500 580, 1800 520 L1800 1000 L-200 1000 Z" fill={`url(#dune-${uid}-0)`} />
      </g>
      <g className="wp-dune wp-dune-2">
        <path d="M-200 700 C 160 620, 540 760, 880 680 C 1260 616, 1540 720, 1800 660 L1800 1000 L-200 1000 Z" fill={`url(#dune-${uid}-1)`} opacity="0.95" />
      </g>
      <g className="wp-dune wp-dune-3">
        <path d="M-200 840 C 240 760, 600 900, 940 820 C 1320 756, 1580 850, 1800 800 L1800 1000 L-200 1000 Z" fill={`url(#dune-${uid}-2)`} />
      </g>
    </svg>
  )
}
