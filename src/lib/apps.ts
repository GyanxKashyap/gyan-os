export interface AppDef {
  id: string
  title: string
  tagline: string
  /** emoji-free glyph drawn by AppIcon */
  icon: string
  accent: string
  defaultSize: { w: number; h: number }
}

export const APPS: AppDef[] = [
  {
    id: 'aizen',
    title: 'Aizen',
    tagline: 'Your local language model.',
    icon: 'aizen',
    accent: '#8d7fb5',
    defaultSize: { w: 820, h: 580 },
  },
  {
    id: 'projects',
    title: 'Projects',
    tagline: 'Things I have built.',
    icon: 'projects',
    accent: '#e0a583',
    defaultSize: { w: 780, h: 540 },
  },
  {
    id: 'about',
    title: 'About Me',
    tagline: 'Who is Gyan?',
    icon: 'about',
    accent: '#b48ead',
    defaultSize: { w: 620, h: 480 },
  },
  {
    id: 'lab',
    title: 'Lab',
    tagline: 'Experiments & training runs.',
    icon: 'lab',
    accent: '#88a3bf',
    defaultSize: { w: 720, h: 500 },
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    tagline: 'A personal library.',
    icon: 'knowledge',
    accent: '#a3b284',
    defaultSize: { w: 680, h: 500 },
  },
  {
    id: 'timer',
    title: 'Timer',
    tagline: 'Focus, measured honestly.',
    icon: 'timer',
    accent: '#c08a68',
    defaultSize: { w: 900, h: 640 },
  },
  {
    id: 'settings',
    title: 'Settings',
    tagline: 'Make it yours.',
    icon: 'settings',
    accent: '#9a93a6',
    defaultSize: { w: 560, h: 440 },
  },
  {
    id: 'trash',
    title: 'Trash',
    tagline: 'Nothing wasted.',
    icon: 'trash',
    accent: '#9a93a6',
    defaultSize: { w: 460, h: 340 },
  },
]

export const appById = (id: string) => APPS.find((a) => a.id === id)
