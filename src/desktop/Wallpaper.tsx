import { useSettings, type WallpaperId } from '../store/settings'

interface Palette {
  sky: [string, string, string]
  sun: string
  dunes: [[string, string], [string, string], [string, string]]
}

export const WALLPAPERS: Record<WallpaperId, { label: string; p: Palette }> = {
  dusk: {
    label: 'Lavender dusk',
    p: {
      sky: ['#e9e0f4', '#e3d3e8', '#f0d9c9'],
      sun: '#fdf3e3',
      dunes: [['#cfc0e2', '#b7a6d4'], ['#b3a0cd', '#9784ba'], ['#8b78ab', '#6f5f92']],
    },
  },
  dawn: {
    label: 'Peach dawn',
    p: {
      sky: ['#fdeee2', '#f6ddd2', '#eed4da'],
      sun: '#fff7ea',
      dunes: [['#f0cbb4', '#e4b39a'], ['#dfa98f', '#cd9179'], ['#b97f6d', '#996657']],
    },
  },
  night: {
    label: 'Quiet night',
    p: {
      sky: ['#3d3654', '#4a4066', '#5d4d6e'],
      sun: '#8d7fb5',
      dunes: [['#524a6e', '#453e60'], ['#403856', '#342d48'], ['#2b2440', '#1f1a30']],
    },
  },
}

/** Soft dune landscape — pure SVG, palette driven by Settings. */
export function Wallpaper() {
  const id = useSettings((s) => s.wallpaper)
  const { p } = WALLPAPERS[id] ?? WALLPAPERS.dusk
  return <WallpaperSvg p={p} className="absolute inset-0 h-full w-full" />
}

export function WallpaperSvg({ p, className }: { p: Palette; className?: string }) {
  const uid = p.sky[0].slice(1)
  return (
    <svg className={className} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.45" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`sun-${uid}`} cx="0.68" cy="0.34" r="0.35">
          <stop offset="0" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        {p.dunes.map((d, i) => (
          <linearGradient key={i} id={`dune-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={d[0]} />
            <stop offset="1" stopColor={d[1]} />
          </linearGradient>
        ))}
      </defs>
      <rect width="1600" height="1000" fill={`url(#sky-${uid})`} />
      <rect width="1600" height="1000" fill={`url(#sun-${uid})`} />
      <path d="M0 560 C 300 480, 560 620, 900 560 C 1200 508, 1400 560, 1600 520 L1600 1000 L0 1000 Z" fill={`url(#dune-${uid}-0)`} />
      <path d="M0 700 C 260 620, 640 760, 980 680 C 1260 616, 1440 700, 1600 660 L1600 1000 L0 1000 Z" fill={`url(#dune-${uid}-1)`} opacity="0.95" />
      <path d="M0 840 C 340 760, 700 900, 1040 820 C 1320 756, 1480 830, 1600 800 L1600 1000 L0 1000 Z" fill={`url(#dune-${uid}-2)`} />
    </svg>
  )
}
