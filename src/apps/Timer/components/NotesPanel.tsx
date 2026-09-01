import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  createStickyNote,
  stickyNoteCharacterLimit,
  stickyNoteColors,
  updateStickyNote,
} from '../domain/notes'
import type { StickyNote, StickyNoteColor } from '../domain/types'
import { deleteNote, listNotes, saveNote } from '../data/repository'
import { formatNoteTimestamp } from '../utils/format'

const colorLabels: Record<StickyNoteColor, string> = {
  ivory: 'Ivory',
  yellow: 'Muted yellow',
  blue: 'Powder blue',
  pink: 'Dusty pink',
  sage: 'Sage',
}

export function NotesPanel() {
  const notes = useLiveQuery(
    () => listNotes(),
    [],
    [],
  )
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState<StickyNoteColor>('ivory')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const editingNote = useMemo(
    () => notes.find((note) => note.id === editingId) ?? null,
    [editingId, notes],
  )

  const resetComposer = () => {
    setDraft('')
    setColor('ivory')
    setEditingId(null)
    setMessage('')
  }

  const pinNote = async () => {
    try {
      const note = editingNote
        ? updateStickyNote(editingNote, draft, color)
        : createStickyNote(draft, color)
      await saveNote(note)
      setSelectedId(note.id)
      resetComposer()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The note could not be saved.')
    }
  }

  const beginEdit = (note: StickyNote) => {
    setEditingId(note.id)
    setDraft(note.text)
    setColor(note.color)
    setMessage('')
    document.querySelector<HTMLTextAreaElement>('.note-composer textarea')?.focus()
  }

  const confirmDelete = async (note: StickyNote) => {
    await deleteNote(note.id)
    if (selectedId === note.id) setSelectedId(null)
    if (editingId === note.id) resetComposer()
    setDeleteId(null)
  }

  return (
    <section className="notes-workspace view-transition-surface" aria-label="Sticky notes">
      <section className="note-composer" aria-labelledby="new-note-heading">
        <div className="note-composer-inner">
          <div className="note-composer-heading">
            <h1 id="new-note-heading">{editingNote ? 'EDIT NOTE' : 'NEW NOTE'}</h1>
            {editingNote && <button type="button" onClick={resetComposer}>CANCEL</button>}
          </div>

          <textarea
            aria-label="Note text"
            className={`paper-${color}`}
            maxLength={stickyNoteCharacterLimit}
            placeholder="WRITE WHATEVER YOU WANT TO REMEMBER..."
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (message) setMessage('')
            }}
          />

          <div className="paper-color-fieldset" role="group" aria-label="Paper color">
            <span>PAPER COLOR</span>
            <div>
              {stickyNoteColors.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`paper-swatch paper-${item} ${color === item ? 'is-selected' : ''}`}
                  aria-label={colorLabels[item]}
                  aria-pressed={color === item}
                  onClick={() => setColor(item)}
                />
              ))}
            </div>
          </div>

          <button type="button" className="pin-note-button" onClick={() => void pinNote()}>
            {editingNote ? 'UPDATE NOTE' : 'PIN TO WALL'}
          </button>
          {message && <p className="note-message" role="alert">{message}</p>}
        </div>
      </section>

      <section className="notes-wall" aria-label="Pinned notes wall">
        {notes.length ? (
          <div className="notes-grid">
            {notes.map((note) => {
              const selected = selectedId === note.id
              const isEdited = note.updatedAt !== note.createdAt
              return (
                <article
                  key={note.id}
                  className={`sticky-note paper-${note.color} ${selected ? 'is-selected' : ''}`}
                >
                  <button
                    type="button"
                    className="sticky-note-open"
                    aria-expanded={selected}
                    onClick={() => {
                      setSelectedId(selected ? null : note.id)
                      setDeleteId(null)
                    }}
                  >
                    <span className="sticky-note-text">{note.text}</span>
                    <time dateTime={note.createdAt}>{formatNoteTimestamp(note.createdAt)}</time>
                  </button>

                  {selected && (
                    <div className="sticky-note-details">
                      <dl>
                        <div>
                          <dt>CREATED</dt>
                          <dd>{formatNoteTimestamp(note.createdAt)}</dd>
                        </div>
                        {isEdited && (
                          <div>
                            <dt>UPDATED</dt>
                            <dd>{formatNoteTimestamp(note.updatedAt)}</dd>
                          </div>
                        )}
                      </dl>
                      {deleteId === note.id ? (
                        <div className="note-delete-confirmation">
                          <span>DELETE THIS NOTE?</span>
                          <button type="button" onClick={() => setDeleteId(null)}>CANCEL</button>
                          <button type="button" onClick={() => void confirmDelete(note)}>DELETE</button>
                        </div>
                      ) : (
                        <div className="sticky-note-actions">
                          <button type="button" onClick={() => beginEdit(note)}>EDIT</button>
                          <button type="button" onClick={() => setDeleteId(note.id)}>DELETE</button>
                          <button type="button" onClick={() => setSelectedId(null)}>CLOSE</button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="notes-empty-state">
            <span>NO NOTES PINNED YET</span>
          </div>
        )}
      </section>
    </section>
  )
}
