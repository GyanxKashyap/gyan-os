export type WallpaperId = 'samurai' | 'dusk' | 'dawn' | 'night'
export const DEFAULT_WALLPAPER: WallpaperId = 'samurai'

export interface Palette {
  sky: [string, string, string]
  sun: string
  dunes: [[string, string], [string, string], [string, string]]
  night?: boolean
  /** dominant color for chrome tinting */
  tint: [number, number, number]
}

export const WALLPAPERS: Record<WallpaperId, { label: string; p: Palette; media?: { src: string; poster: string } }> = {
  samurai: {
    label: 'Samurai Crimson Gaze',
    media: { src: '/wallpapers/samurai-crimson-gaze.mp4', poster: '/wallpapers/samurai-crimson-gaze-poster.png' },
    p: { sky: ['#111115', '#242126', '#302527'], sun: '#ba6452', dunes: [['#393139', '#30262b'], ['#282128', '#211b21'], ['#19151c', '#100e14']], tint: [100, 58, 54], night: true },
  },
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

