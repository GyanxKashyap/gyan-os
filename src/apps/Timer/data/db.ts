import Dexie, { type EntityTable } from 'dexie'
import type { ActiveSession, StickyNote, StudySession } from '../domain/types'

interface Preference {
  key: string
  value: unknown
}

class StudyTimerDatabase extends Dexie {
  sessions!: EntityTable<StudySession, 'id'>
  activeSession!: EntityTable<ActiveSession, 'id'>
  preferences!: EntityTable<Preference, 'key'>
  notes!: EntityTable<StickyNote, 'id'>

  constructor() {
    super('personal-study-timer')
    this.version(1).stores({
      sessions: 'id, startedAt, endedAt, status, subject',
      activeSession: 'id, state',
      preferences: 'key',
    })
    this.version(2).stores({
      sessions: 'id, startedAt, endedAt, status, subject',
      activeSession: 'id, state',
      preferences: 'key',
      notes: 'id, createdAt, updatedAt, color',
    })
  }
}

export const db = new StudyTimerDatabase()
