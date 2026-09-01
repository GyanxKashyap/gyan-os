import type { StickyNote, StickyNoteColor } from './types'

export const stickyNoteColors: StickyNoteColor[] = [
  'ivory',
  'yellow',
  'blue',
  'pink',
  'sage',
]

export const stickyNoteCharacterLimit = 4_000

export function normalizeStickyNoteText(value: string): string {
  const text = value.trim()
  if (!text) throw new Error('Write something before pinning the note.')
  if (text.length > stickyNoteCharacterLimit) {
    throw new Error(`Keep the note under ${stickyNoteCharacterLimit.toLocaleString()} characters.`)
  }
  return text
}

export function createStickyNote(
  text: string,
  color: StickyNoteColor,
  now = new Date(),
  id: string = crypto.randomUUID(),
): StickyNote {
  const timestamp = now.toISOString()
  return {
    id,
    schemaVersion: 1,
    text: normalizeStickyNoteText(text),
    color,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function updateStickyNote(
  note: StickyNote,
  text: string,
  color: StickyNoteColor,
  now = new Date(),
): StickyNote {
  return {
    ...note,
    text: normalizeStickyNoteText(text),
    color,
    updatedAt: now.toISOString(),
  }
}

export function isStickyNote(value: unknown): value is StickyNote {
  if (!value || typeof value !== 'object') return false
  const note = value as Partial<StickyNote>
  return (
    note.schemaVersion === 1 &&
    typeof note.id === 'string' &&
    typeof note.text === 'string' &&
    note.text.trim().length > 0 &&
    note.text.length <= stickyNoteCharacterLimit &&
    stickyNoteColors.includes(note.color as StickyNoteColor) &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  )
}
