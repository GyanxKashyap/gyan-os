import { useState } from 'react'
import type { ActiveSession, StudySession } from '../domain/types'
import { timerMode, validateDuration } from '../domain/timer'
import { formatDuration } from '../utils/format'
import { EndControl } from './EndControl'
import { FlipClock } from './FlipClock'

interface TimerPanelProps {
  active: ActiveSession | null
  lastResult: StudySession | null
  onEnd: () => Promise<void>
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onStart: (durationMinutes: number, subject: string) => Promise<void>
  onStartOpen: (subject: string) => Promise<void>
  onStartAnother: () => void
  onViewAnalysis: () => void
  displayMs: number
}

const presets = [25, 50, 90]

export function TimerPanel({
  active,
  lastResult,
  onEnd,
  onPause,
  onResume,
  onStart,
  onStartOpen,
  onStartAnother,
  onViewAnalysis,
  displayMs,
}: TimerPanelProps) {
  const initialDuration = Number(window.localStorage.getItem('study-timer-duration')) || 50
  const initialSelection = window.localStorage.getItem('study-timer-mode') === 'open'
    ? 'open'
    : presets.includes(initialDuration) ? 'preset' : 'custom'
  const [duration, setDuration] = useState(initialDuration)
  const [subject, setSubject] = useState('')
  const [selection, setSelection] = useState<'preset' | 'custom' | 'open'>(initialSelection)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const chooseDuration = (minutes: number) => {
    setDuration(minutes)
    setSelection('preset')
    setError('')
    window.localStorage.setItem('study-timer-duration', String(minutes))
    window.localStorage.setItem('study-timer-mode', 'countdown')
  }

  const start = async () => {
    if (selection !== 'open') {
      const validation = validateDuration(duration)
      if (validation) {
        setError(validation)
        return
      }
    }
    setStarting(true)
    try {
      if (selection === 'open') {
        await onStartOpen(subject)
      } else {
        await onStart(duration, subject)
      }
      setError('')
    } catch {
      setError('The session could not start because local storage is unavailable.')
    } finally {
      setStarting(false)
    }
  }

  if (lastResult && !active) {
    return (
      <section className="timer-panel completion-panel" aria-labelledby="completion-title">
        <p className="session-label">SESSION / {lastResult.subject?.toUpperCase() ?? 'UNLABELLED'}</p>
        <h1 id="completion-title">
          {lastResult.status === 'completed'
            ? 'SESSION COMPLETED'
            : 'SESSION RECORDED AS INTERRUPTED'}
        </h1>
        <div className="completion-facts">
          <div>
            <span>FOCUSED</span>
            <strong>{formatDuration(lastResult.focusedDurationMs)}</strong>
          </div>
          <div>
            <span>PAUSED</span>
            <strong>{formatDuration(lastResult.pausedDurationMs)}</strong>
          </div>
        </div>
        <div className="completion-actions">
          <button type="button" className="start-button" onClick={onStartAnother}>
            START ANOTHER
          </button>
          <button type="button" className="quiet-action" onClick={onViewAnalysis}>
            VIEW ANALYSIS
          </button>
        </div>
      </section>
    )
  }

  const isOpenActive = Boolean(active && timerMode(active) === 'open')
  const clockDuration = active ? displayMs : selection === 'open' ? 0 : duration * 60_000
  const subjectLabel = active?.subject ?? 'UNLABELLED'

  return (
    <section className={`timer-panel ${active ? 'is-active' : 'is-idle'}`} aria-label="Study timer">
      {active ? (
        <p className="session-label">SESSION / {subjectLabel.toUpperCase()}</p>
      ) : (
        <label className="session-label session-subject-inline">
          <span>SESSION /</span>
          <input
            type="text"
            value={subject}
            maxLength={60}
            aria-label="Optional subject"
            placeholder="SUBJECT (OPTIONAL)"
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>
      )}

      <FlipClock
        countUp={isOpenActive || (!active && selection === 'open')}
        durationMs={clockDuration}
        subduedSeconds={Boolean(active && !isOpenActive && displayMs > 60_000)}
      />

      {active ? (
        <div className="active-controls">
          <div className="active-status" aria-live="polite">
            <span>STATUS</span>
            <strong>{active.state.toUpperCase()}</strong>
          </div>
          <div className="focus-actions">
            <button
              type="button"
              className="pause-action"
              onClick={() => void (active.state === 'running' ? onPause() : onResume())}
            >
              {active.state === 'running' ? 'PAUSE' : 'RESUME'}
            </button>
            <span aria-hidden="true">|</span>
            <EndControl openEnded={isOpenActive} onEnd={onEnd} />
          </div>
        </div>
      ) : (
        <>
          <fieldset className="duration-fieldset">
            <legend>DURATION</legend>
            <div className="duration-options">
              {presets.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={duration === minutes && selection === 'preset' ? 'is-selected' : ''}
                  onClick={() => chooseDuration(minutes)}
                >
                  {minutes}
                </button>
              ))}
              <button
                type="button"
                className={selection === 'custom' ? 'is-selected' : ''}
                onClick={() => {
                  setSelection('custom')
                  setError('')
                  window.localStorage.setItem('study-timer-mode', 'countdown')
                }}
              >
                CUSTOM
              </button>
              <button
                type="button"
                className={selection === 'open' ? 'is-selected' : ''}
                onClick={() => {
                  setSelection('open')
                  setError('')
                  window.localStorage.setItem('study-timer-mode', 'open')
                }}
              >
                OPEN
              </button>
            </div>
            {selection === 'custom' && (
              <label className="custom-duration">
                <span>MINUTES</span>
                <input
                  type="number"
                  min="1"
                  max="240"
                  step="1"
                  value={duration}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setDuration(next)
                    window.localStorage.setItem('study-timer-duration', String(next))
                    window.localStorage.setItem('study-timer-mode', 'countdown')
                    setError(validateDuration(next) ?? '')
                  }}
                />
              </label>
            )}
          </fieldset>

          {error && <p className="timer-error" role="alert">{error}</p>}
          <button
            type="button"
            className="start-button"
            disabled={starting}
            onClick={() => void start()}
          >
            {starting ? 'STARTING' : 'START'}
          </button>
        </>
      )}
    </section>
  )
}
