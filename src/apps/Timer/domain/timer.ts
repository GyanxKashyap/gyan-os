import type { ActiveSession, SessionStatus, StudySession, TimerMode } from './types'

export const MINUTE_MS = 60_000

export function timerMode(session: Pick<ActiveSession, 'mode'> | Pick<StudySession, 'mode'>): TimerMode {
  return session.mode === 'open' ? 'open' : 'countdown'
}

export function createActiveSession(
  durationMinutes: number,
  subject: string,
  now = Date.now(),
): ActiveSession {
  const plannedDurationMs = durationMinutes * MINUTE_MS
  const trimmedSubject = subject.trim().slice(0, 60)

  return {
    id: crypto.randomUUID(),
    state: 'running',
    subject: trimmedSubject || null,
    mode: 'countdown',
    plannedDurationMs,
    accumulatedFocusedMs: 0,
    accumulatedPausedMs: 0,
    pauseCount: 0,
    startedAt: new Date(now).toISOString(),
    lastResumedAt: new Date(now).toISOString(),
    pausedAt: null,
    expectedEndAt: new Date(now + plannedDurationMs).toISOString(),
  }
}

export function createOpenSession(subject: string, now = Date.now()): ActiveSession {
  const trimmedSubject = subject.trim().slice(0, 60)

  return {
    id: crypto.randomUUID(),
    state: 'running',
    subject: trimmedSubject || null,
    mode: 'open',
    plannedDurationMs: 0,
    accumulatedFocusedMs: 0,
    accumulatedPausedMs: 0,
    pauseCount: 0,
    startedAt: new Date(now).toISOString(),
    lastResumedAt: new Date(now).toISOString(),
    pausedAt: null,
    expectedEndAt: null,
  }
}

export function focusedDuration(active: ActiveSession, now = Date.now()): number {
  if (active.state !== 'running' || !active.lastResumedAt) {
    return active.accumulatedFocusedMs
  }

  const elapsed = active.accumulatedFocusedMs + Math.max(0, now - Date.parse(active.lastResumedAt))
  return timerMode(active) === 'open' ? elapsed : Math.min(active.plannedDurationMs, elapsed)
}

export function pausedDuration(active: ActiveSession, now = Date.now()): number {
  if (active.state !== 'paused' || !active.pausedAt) {
    return active.accumulatedPausedMs
  }

  return active.accumulatedPausedMs + Math.max(0, now - Date.parse(active.pausedAt))
}

export function remainingDuration(active: ActiveSession, now = Date.now()): number {
  if (timerMode(active) === 'open') return 0
  return Math.max(0, active.plannedDurationMs - focusedDuration(active, now))
}

export function pauseSession(active: ActiveSession, now = Date.now()): ActiveSession {
  if (active.state !== 'running') return active

  return {
    ...active,
    state: 'paused',
    accumulatedFocusedMs: focusedDuration(active, now),
    pauseCount: active.pauseCount + 1,
    lastResumedAt: null,
    pausedAt: new Date(now).toISOString(),
    expectedEndAt: null,
  }
}

export function resumeSession(active: ActiveSession, now = Date.now()): ActiveSession {
  if (active.state !== 'paused') return active

  const nextPausedDuration = pausedDuration(active, now)
  const remainingMs = Math.max(0, active.plannedDurationMs - active.accumulatedFocusedMs)
  const isOpen = timerMode(active) === 'open'

  return {
    ...active,
    state: 'running',
    accumulatedPausedMs: nextPausedDuration,
    pausedAt: null,
    lastResumedAt: new Date(now).toISOString(),
    expectedEndAt: isOpen ? null : new Date(now + remainingMs).toISOString(),
  }
}

export function finishSession(
  active: ActiveSession,
  status: SessionStatus,
  now = Date.now(),
): StudySession {
  const timestamp = new Date(now).toISOString()
  const actualFocused = focusedDuration(active, now)
  const isOpen = timerMode(active) === 'open'

  return {
    id: active.id,
    schemaVersion: 1,
    subject: active.subject,
    mode: isOpen ? 'open' : 'countdown',
    plannedDurationMs: active.plannedDurationMs,
    focusedDurationMs: status === 'completed' && !isOpen
      ? active.plannedDurationMs
      : actualFocused,
    pausedDurationMs: pausedDuration(active, now),
    pauseCount: active.pauseCount,
    startedAt: active.startedAt,
    endedAt: timestamp,
    status,
    createdAt: active.startedAt,
    updatedAt: timestamp,
  }
}

export function validateDuration(value: number): string | null {
  if (!Number.isInteger(value)) return 'Use a whole number of minutes.'
  if (value < 1 || value > 240) return 'Choose between 1 and 240 minutes.'
  return null
}
