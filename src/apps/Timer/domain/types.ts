export type SessionStatus = 'completed' | 'interrupted'
export type TimerState = 'running' | 'paused'
export type TimerMode = 'countdown' | 'open'

export interface StudySession {
  id: string
  schemaVersion: 1
  subject: string | null
  mode?: TimerMode
  plannedDurationMs: number
  focusedDurationMs: number
  pausedDurationMs: number
  pauseCount: number
  startedAt: string
  endedAt: string
  status: SessionStatus
  createdAt: string
  updatedAt: string
}

export interface ActiveSession {
  id: string
  state: TimerState
  subject: string | null
  mode?: TimerMode
  plannedDurationMs: number
  accumulatedFocusedMs: number
  accumulatedPausedMs: number
  pauseCount: number
  startedAt: string
  lastResumedAt: string | null
  pausedAt: string | null
  expectedEndAt: string | null
}

export type AnalysisRange = 'today' | '7days' | '30days' | 'all'

export interface AnalysisSummary {
  focusedDurationMs: number
  pausedDurationMs: number
  completedCount: number
  interruptedCount: number
  pauseCount: number
  averageFocusedMs: number
  medianFocusedMs: number
}

export interface DailyTotal {
  key: string
  label: string
  focusedDurationMs: number
}

export interface CalendarDay {
  key: string
  dayNumber: number
  focusedDurationMs: number
  isToday: boolean
}

export interface SubjectTotal {
  subject: string
  focusedDurationMs: number
}

export type StickyNoteColor = 'ivory' | 'yellow' | 'blue' | 'pink' | 'sage'

export interface StickyNote {
  id: string
  schemaVersion: 1
  text: string
  color: StickyNoteColor
  createdAt: string
  updatedAt: string
}
