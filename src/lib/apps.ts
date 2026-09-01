import type { ComponentType } from 'react'
import { AizenApp } from '../apps/Aizen'
import { ProjectsApp } from '../apps/Projects'
import { AboutApp } from '../apps/About'
import { LabApp } from '../apps/Lab'
import { KnowledgeApp } from '../apps/Knowledge'
import { SettingsApp } from '../apps/Settings'
import { TrashApp } from '../apps/Trash'
import { TimerApp } from '../apps/Timer'

export interface AppDef {
  id: string
  title: string
  tagline: string
  /** emoji-free glyph drawn by AppIcon */
  icon: string
  accent: string
  component: ComponentType
  defaultSize: { w: number; h: number }
}

export const APPS: AppDef[] = [
  {
    id: 'aizen',
    title: 'Aizen',
    tagline: 'Your local language model.',
    icon: 'aizen',
    accent: '#8d7fb5',
    component: AizenApp,
    defaultSize: { w: 820, h: 580 },
  },
  {
    id: 'projects',
    title: 'Projects',
    tagline: 'Things I have built.',
    icon: 'projects',
    accent: '#e0a583',
    component: ProjectsApp,
    defaultSize: { w: 780, h: 540 },
  },
  {
    id: 'about',
    title: 'About Me',
    tagline: 'Who is Gyan?',
    icon: 'about',
    accent: '#b48ead',
    component: AboutApp,
    defaultSize: { w: 620, h: 480 },
  },
  {
    id: 'lab',
    title: 'Lab',
    tagline: 'Experiments & training runs.',
    icon: 'lab',
    accent: '#88a3bf',
    component: LabApp,
    defaultSize: { w: 720, h: 500 },
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    tagline: 'A personal library.',
    icon: 'knowledge',
    accent: '#a3b284',
    component: KnowledgeApp,
    defaultSize: { w: 680, h: 500 },
  },
  {
    id: 'timer',
    title: 'Timer',
    tagline: 'Focus, measured honestly.',
    icon: 'timer',
    accent: '#c08a68',
    component: TimerApp,
    defaultSize: { w: 900, h: 640 },
  },
  {
    id: 'settings',
    title: 'Settings',
    tagline: 'Make it yours.',
    icon: 'settings',
    accent: '#9a93a6',
    component: SettingsApp,
    defaultSize: { w: 560, h: 440 },
  },
  {
    id: 'trash',
    title: 'Trash',
    tagline: 'Nothing wasted.',
    icon: 'trash',
    accent: '#9a93a6',
    component: TrashApp,
    defaultSize: { w: 460, h: 340 },
  },
]

export const appById = (id: string) => APPS.find((a) => a.id === id)
