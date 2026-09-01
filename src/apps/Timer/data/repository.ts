import { db } from './db'
import { isStickyNote } from '../domain/notes'
import type { ActiveSession, StickyNote, StudySession } from '../domain/types'

export async function getActiveSession(): Promise<ActiveSession | null> {
  return (await db.activeSession.toCollection().first()) ?? null
}

export async function saveActiveSession(active: ActiveSession): Promise<void> {
  await db.activeSession.put(active)
}

export async function commitFinishedSession(session: StudySession): Promise<void> {
  await db.transaction('rw', db.sessions, db.activeSession, async () => {
    await db.sessions.put(session)
    await db.activeSession.delete(session.id)
  })
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
}

export async function saveNote(note: StickyNote): Promise<void> {
  await db.notes.put(note)
}

export async function listNotes(): Promise<StickyNote[]> {
  return db.notes.orderBy('createdAt').reverse().toArray()
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id)
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.sessions, db.activeSession, db.preferences, db.notes, async () => {
    await Promise.all([
      db.sessions.clear(),
      db.activeSession.clear(),
      db.preferences.clear(),
      db.notes.clear(),
    ])
  })
}

export async function exportJson(): Promise<void> {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    notes: await db.notes.toArray(),
  }
  downloadFile(
    JSON.stringify(payload, null, 2),
    `study-timer-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json',
  )
}

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export async function exportCsv(): Promise<void> {
  const sessions = await db.sessions.orderBy('startedAt').reverse().toArray()
  const rows = [
    ['startedAt', 'subject', 'mode', 'plannedMinutes', 'focusedMinutes', 'pausedMinutes', 'pauseCount', 'status'],
    ...sessions.map((session) => [
      session.startedAt,
      session.subject ?? '',
      session.mode === 'open' || session.plannedDurationMs === 0 ? 'open' : 'countdown',
      session.mode === 'open' || session.plannedDurationMs === 0
        ? ''
        : Math.round(session.plannedDurationMs / 60_000),
      Math.round(session.focusedDurationMs / 60_000),
      Math.round(session.pausedDurationMs / 60_000),
      session.pauseCount,
      session.status,
    ]),
  ]
  downloadFile(
    rows.map((row) => row.map(csvCell).join(',')).join('\n'),
    `study-timer-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8',
  )
}

function isStudySession(value: unknown): value is StudySession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<StudySession>
  return (
    session.schemaVersion === 1 &&
    typeof session.id === 'string' &&
    (session.subject === null || typeof session.subject === 'string') &&
    (session.mode === undefined || session.mode === 'countdown' || session.mode === 'open') &&
    typeof session.plannedDurationMs === 'number' &&
    typeof session.focusedDurationMs === 'number' &&
    typeof session.pausedDurationMs === 'number' &&
    typeof session.pauseCount === 'number' &&
    typeof session.startedAt === 'string' &&
    typeof session.endedAt === 'string' &&
    (session.status === 'completed' || session.status === 'interrupted')
  )
}

export interface ImportResult {
  sessionCount: number
  noteCount: number
}

export async function importJson(file: File): Promise<ImportResult> {
  const parsed = JSON.parse(await file.text()) as {
    schemaVersion?: unknown
    sessions?: unknown
    notes?: unknown
  }
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.sessions)) {
    throw new Error('This file is not a version 1 Study Timer export.')
  }
  if (!parsed.sessions.every(isStudySession)) {
    throw new Error('One or more session records are invalid.')
  }
  if (parsed.notes !== undefined && !Array.isArray(parsed.notes)) {
    throw new Error('The notes collection is invalid.')
  }
  const notes = parsed.notes ?? []
  if (!notes.every(isStickyNote)) {
    throw new Error('One or more sticky notes are invalid.')
  }

  await db.transaction('rw', db.sessions, db.notes, async () => {
    await db.sessions.bulkPut(parsed.sessions as StudySession[])
    await db.notes.bulkPut(notes as StickyNote[])
  })
  return {
    sessionCount: parsed.sessions.length,
    noteCount: notes.length,
  }
}

function downloadFile(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
