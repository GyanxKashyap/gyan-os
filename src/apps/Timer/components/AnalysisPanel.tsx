import { useMemo, useRef, useState } from 'react'
import {
  calendarDays,
  chartScaleCeiling,
  dailyTotals,
  sessionsForDate,
  sessionsForMonth,
  sessionsForRange,
  subjectTotals,
  summarizeSessions,
  usedMonthsForCurrentYear,
} from '../domain/analysis'
import type { AnalysisRange, StudySession } from '../domain/types'
import {
  clearAllData,
  deleteSession,
  exportCsv,
  exportJson,
  importJson,
} from '../data/repository'
import {
  formatDateStamp,
  formatDuration,
  formatStartTime,
} from '../utils/format'
import { StudyCalendar } from './StudyCalendar'

interface AnalysisPanelProps {
  compact?: boolean
  onOpen?: () => void
  sessions: StudySession[]
}

type ConfirmationState =
  | { kind: 'delete'; session: StudySession }
  | { kind: 'clear' }
  | { kind: 'import'; file: File }
  | null

const ranges: Array<{ label: string; value: AnalysisRange }> = [
  { label: 'TODAY', value: 'today' },
  { label: '7 DAYS', value: '7days' },
  { label: '30 DAYS', value: '30days' },
  { label: 'ALL TIME', value: 'all' },
]

export function AnalysisPanel({ compact = false, onOpen, sessions }: AnalysisPanelProps) {
  const [range, setRange] = useState<AnalysisRange>('7days')
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null)
  const importInput = useRef<HTMLInputElement>(null)
  const allTimeOnly = !compact && range === 'all'
  const filtered = useMemo(
    () => range === '30days'
      ? sessionsForMonth(sessions, calendarMonth)
      : sessionsForRange(sessions, range),
    [calendarMonth, range, sessions],
  )
  const days = useMemo(() => dailyTotals(filtered, range), [filtered, range])
  const monthDays = useMemo(
    () => calendarDays(sessions, calendarMonth),
    [calendarMonth, sessions],
  )
  const usedMonths = useMemo(
    () => usedMonthsForCurrentYear(sessions),
    [sessions],
  )
  const selectedSessions = useMemo(
    () => selectedDay ? sessionsForDate(filtered, selectedDay) : [],
    [filtered, selectedDay],
  )
  const detailSessions = selectedDay ? selectedSessions : filtered
  const summary = useMemo(() => summarizeSessions(detailSessions), [detailSessions])
  const subjects = useMemo(() => subjectTotals(detailSessions), [detailSessions])
  const chartCeiling = chartScaleCeiling(days)
  const selectedDate = selectedDay ? new Date(`${selectedDay}T12:00:00`) : null

  const changeMonth = (offset: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
    setSelectedDay(null)
  }

  const changeRange = (nextRange: AnalysisRange) => {
    setRange(nextRange)
    if (nextRange !== '30days') setSelectedDay(null)
  }

  const handleImport = (file: File | undefined) => {
    if (!file) return
    setConfirmation({ kind: 'import', file })
    if (importInput.current) importInput.current.value = ''
  }

  const confirmAction = async () => {
    if (!confirmation) return
    try {
      if (confirmation.kind === 'delete') {
        await deleteSession(confirmation.session.id)
      } else if (confirmation.kind === 'clear') {
        await clearAllData()
        setMessage('All local data was deleted.')
      } else {
        const result = await importJson(confirmation.file)
        const sessionLabel = `${result.sessionCount} session${result.sessionCount === 1 ? '' : 's'}`
        const noteLabel = `${result.noteCount} note${result.noteCount === 1 ? '' : 's'}`
        setMessage(`${sessionLabel} and ${noteLabel} imported.`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The data action failed.')
    } finally {
      setConfirmation(null)
    }
  }

  return (
    <aside className={`analysis-panel ${compact ? 'is-compact' : 'is-expanded view-transition-surface'}`}>
      <div className="analysis-scroll">
        <header className="analysis-header">
          {compact ? (
            <button type="button" className="panel-title" onClick={onOpen}>
              ANALYSIS <span>/</span> {formatDateStamp(new Date())}
            </button>
          ) : (
            <div className="analysis-heading-row">
              <h1>ANALYSIS</h1>
              <time>{formatDateStamp(new Date())}</time>
            </div>
          )}
        </header>

        {!compact && (
          <div className="range-selector" aria-label="Analysis date range">
            {ranges.map((item) => (
              <button
                key={item.value}
                type="button"
                className={range === item.value ? 'is-selected' : ''}
                onClick={() => changeRange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {!compact && selectedDate && (
          <div className="selected-day-context">
            <span>DAY ANALYSIS / {formatDateStamp(selectedDate)}</span>
            <button type="button" onClick={() => setSelectedDay(null)}>MONTH TOTALS</button>
          </div>
        )}

        {!allTimeOnly && (
          <section
            className={`summary-grid ${compact ? 'summary-compact' : ''}`}
            aria-label={selectedDay ? 'Selected day session summary' : 'Session summary'}
          >
            <div>
              <span>FOCUSED</span>
              <strong>{formatDuration(summary.focusedDurationMs)}</strong>
            </div>
            <div>
              <span>COMPLETED</span>
              <strong>{summary.completedCount}</strong>
            </div>
            <div>
              <span>INTERRUPTED</span>
              <strong>{summary.interruptedCount}</strong>
            </div>
            {!compact && (
              <>
                <div>
                  <span>PAUSED</span>
                  <strong>{formatDuration(summary.pausedDurationMs)}</strong>
                </div>
                <div>
                  <span>AVERAGE</span>
                  <strong>{formatDuration(summary.averageFocusedMs)}</strong>
                </div>
                <div>
                  <span>MEDIAN</span>
                  <strong>{formatDuration(summary.medianFocusedMs)}</strong>
                </div>
              </>
            )}
          </section>
        )}

        {allTimeOnly ? (
          <section className="all-time-calendars" aria-label="All used months this year">
            {usedMonths.map((month) => (
              <StudyCalendar
                key={`${month.getFullYear()}-${month.getMonth()}`}
                days={calendarDays(sessions, month)}
                month={month}
                readOnly
                showNavigation={false}
              />
            ))}
          </section>
        ) : range === '30days' && !compact ? (
          <section className="analysis-section calendar-section">
            <StudyCalendar
              days={monthDays}
              month={calendarMonth}
              onChangeMonth={changeMonth}
              onSelectDay={(key) => setSelectedDay((current) => current === key ? null : key)}
              selectedDay={selectedDay}
            />
          </section>
        ) : (
          <section className="analysis-section week-section">
            <div className="chart-heading-row">
              <h2>{compact || range === '7days' ? 'WEEK OVERVIEW' : 'TODAY'}</h2>
              <span>SCALE / {formatDuration(chartCeiling)}</span>
            </div>
            <div className="bar-chart" aria-label="Focused time by day">
              {days.slice(compact ? -7 : 0).map((day) => {
                const height = day.focusedDurationMs > 0
                  ? `${Math.max(2, (day.focusedDurationMs / chartCeiling) * 100)}%`
                  : '0%'
                return (
                  <div className="bar-column" key={day.key}>
                    <span className="bar-value">{formatDuration(day.focusedDurationMs)}</span>
                    <span
                      className={`bar ${day.focusedDurationMs > 0 ? 'has-data' : ''}`}
                      style={{ height }}
                      title={`${day.label}: ${formatDuration(day.focusedDurationMs)}`}
                    />
                    <span className="bar-label">{day.label}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {!allTimeOnly && <section className="analysis-section subject-section">
          <h2>SUBJECT TOTALS{selectedDay ? ' / SELECTED DAY' : ''}</h2>
          {subjects.length ? (
            <div className="subject-list">
              {subjects.slice(0, compact ? 4 : undefined).map((item) => (
                <div key={item.subject}>
                  <span>{item.subject.toUpperCase()}</span>
                  <strong>{formatDuration(item.focusedDurationMs)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">NO SUBJECT DATA</p>
          )}
        </section>}

        {!allTimeOnly && <section className="analysis-section history-section">
          <h2>SESSION LOG{selectedDay ? ' / SELECTED DAY' : ''}</h2>
          {detailSessions.length ? (
            <div className="session-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>START</th>
                    {!compact && <th>SUBJECT</th>}
                    <th>PLANNED</th>
                    <th>FOCUSED</th>
                    <th>PAUSES</th>
                    <th>RESULT</th>
                    {!compact && <th aria-label="Delete" />}
                  </tr>
                </thead>
                <tbody>
                  {detailSessions.slice(0, compact ? 5 : undefined).map((session) => (
                    <tr key={session.id}>
                      <td>{formatStartTime(session.startedAt)}</td>
                      {!compact && <td>{session.subject ?? 'Unlabelled'}</td>}
                      <td>{session.mode === 'open' || session.plannedDurationMs === 0
                        ? 'OPEN'
                        : formatDuration(session.plannedDurationMs)}</td>
                      <td>{formatDuration(session.focusedDurationMs)}</td>
                      <td>{session.pauseCount}</td>
                      <td>{session.status.toUpperCase()}</td>
                      {!compact && (
                        <td>
                          <button
                            type="button"
                            className="delete-row"
                            aria-label={`Delete ${formatStartTime(session.startedAt)} session`}
                            onClick={() => setConfirmation({ kind: 'delete', session })}
                          >
                            DELETE
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-copy">NO SESSIONS RECORDED YET</p>
          )}
        </section>}

        {!compact && !allTimeOnly && confirmation && (
          <section className="data-confirmation" role="group" aria-label="Confirm data action">
            <p>
              {confirmation.kind === 'delete' &&
                `Delete the ${formatStartTime(confirmation.session.startedAt)} session?`}
              {confirmation.kind === 'clear' &&
                'Delete all local Study Timer data? This cannot be undone.'}
              {confirmation.kind === 'import' &&
                `Merge records from ${confirmation.file.name} into local history?`}
            </p>
            <div>
              <button type="button" onClick={() => setConfirmation(null)}>CANCEL</button>
              <button type="button" className="confirm-data-action" onClick={() => void confirmAction()}>
                {confirmation.kind === 'import' ? 'IMPORT' : 'DELETE'}
              </button>
            </div>
          </section>
        )}

        {!compact && !allTimeOnly && (
          <section className="data-controls" aria-label="Local data controls">
            <p>Browser storage can be cleared. Exports are your backup.</p>
            <div>
              <button type="button" onClick={() => void exportJson()}>EXPORT JSON</button>
              <button type="button" onClick={() => void exportCsv()}>EXPORT CSV</button>
              <button type="button" onClick={() => importInput.current?.click()}>IMPORT</button>
              <button type="button" className="clear-data" onClick={() => setConfirmation({ kind: 'clear' })}>
                DELETE ALL
              </button>
            </div>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => handleImport(event.target.files?.[0])}
            />
            {message && <p className="data-message" role="status">{message}</p>}
          </section>
        )}
      </div>
    </aside>
  )
}
