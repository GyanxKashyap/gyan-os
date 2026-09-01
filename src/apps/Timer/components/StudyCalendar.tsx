import type { CalendarDay } from '../domain/types'
import { formatCalendarDuration } from '../utils/format'

interface StudyCalendarProps {
  days: CalendarDay[]
  month: Date
  onChangeMonth?: (offset: number) => void
  onSelectDay?: (key: string) => void
  readOnly?: boolean
  selectedDay?: string | null
  showNavigation?: boolean
}

const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function firstDayOffset(month: Date): number {
  const sundayFirst = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  return (sundayFirst + 6) % 7
}

export function StudyCalendar({
  days,
  month,
  onChangeMonth,
  onSelectDay,
  readOnly = false,
  selectedDay = null,
  showNavigation = true,
}: StudyCalendarProps) {
  const offset = firstDayOffset(month)
  const cells = [...Array<CalendarDay | null>(offset).fill(null), ...days]
  while (cells.length % 7) cells.push(null)

  const now = new Date()
  const isCurrentMonth =
    month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth()
  const monthLabel = month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }).toUpperCase()

  return (
    <div className="study-calendar">
      <div className={`calendar-toolbar ${showNavigation ? '' : 'is-static'}`}>
        {showNavigation && (
          <button type="button" onClick={() => onChangeMonth?.(-1)}>PREV</button>
        )}
        <h2>{monthLabel}</h2>
        {showNavigation && (
          <button type="button" disabled={isCurrentMonth} onClick={() => onChangeMonth?.(1)}>
            NEXT
          </button>
        )}
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label) => <span key={label}>{label}</span>)}
      </div>

      <div className="calendar-grid" role="grid" aria-label={`${monthLabel} study calendar`}>
        {cells.map((day, index) => day ? readOnly ? (
          <div
            role="gridcell"
            key={day.key}
            className={[
              'calendar-day',
              'is-read-only',
              day.isToday ? 'is-today' : '',
              day.focusedDurationMs > 0 ? 'has-study' : '',
            ].filter(Boolean).join(' ')}
            aria-label={`${day.dayNumber} ${monthLabel}, studied ${formatCalendarDuration(day.focusedDurationMs)}`}
          >
            <span className="calendar-day-number">{day.dayNumber}</span>
            <span className="calendar-day-time">{formatCalendarDuration(day.focusedDurationMs)}</span>
          </div>
        ) : (
          <button
            type="button"
            role="gridcell"
            key={day.key}
            className={[
              'calendar-day',
              selectedDay === day.key ? 'is-selected' : '',
              day.isToday ? 'is-today' : '',
              day.focusedDurationMs > 0 ? 'has-study' : '',
            ].filter(Boolean).join(' ')}
            aria-label={`${day.dayNumber} ${monthLabel}, studied ${formatCalendarDuration(day.focusedDurationMs)}`}
            aria-selected={selectedDay === day.key}
            onClick={() => onSelectDay?.(day.key)}
          >
            <span className="calendar-day-number">{day.dayNumber}</span>
            <span className="calendar-day-time">{formatCalendarDuration(day.focusedDurationMs)}</span>
          </button>
        ) : (
          <span className="calendar-day is-empty" key={`empty-${index}`} aria-hidden="true" />
        ))}
      </div>
    </div>
  )
}
