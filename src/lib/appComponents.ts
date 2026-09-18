import { lazy } from 'react'

// UI loading stays separate from metadata used by the window store and search.
export const APP_COMPONENTS = {
  aizen: lazy(() => import('../apps/Aizen').then((m) => ({ default: m.AizenApp }))),
  projects: lazy(() => import('../apps/Projects').then((m) => ({ default: m.ProjectsApp }))),
  about: lazy(() => import('../apps/About').then((m) => ({ default: m.AboutApp }))),
  lab: lazy(() => import('../apps/Lab').then((m) => ({ default: m.LabApp }))),
  knowledge: lazy(() => import('../apps/Knowledge').then((m) => ({ default: m.KnowledgeApp }))),
  timer: lazy(() => import('../apps/Timer').then((m) => ({ default: m.TimerApp }))),
  settings: lazy(() => import('../apps/Settings').then((m) => ({ default: m.SettingsApp }))),
  trash: lazy(() => import('../apps/Trash').then((m) => ({ default: m.TrashApp }))),
}
