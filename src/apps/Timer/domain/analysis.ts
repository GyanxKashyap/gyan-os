import type {
  AnalysisRange,
  AnalysisSummary,
  CalendarDay,
  DailyTotal,
  StudySession,
  SubjectTotal,
} from './types'

const DAY_MS = 86_400_000

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

export function dateKey(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function sessionsForDate(
  sessions: StudySession[],
  key: string,
): StudySession[] {
  return sessions.filter((session) => dateKey(new Date(session.startedAt)) === key)
}

export function sessionsForMonth(
  sessions: StudySession[],
  month: Date,
): StudySession[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  return sessions.filter((session) => {
    const startedAt = new Date(session.startedAt)
    return startedAt.getFullYear() === year && startedAt.getMonth() === monthIndex
  })
}

export function usedMonthsForCurrentYear(
  sessions: StudySession[],
  now = new Date(),
): Date[] {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const monthIndexes = new Set<number>([currentMonth])

  sessions.forEach((session) => {
    const startedAt = new Date(session.startedAt)
    if (
      startedAt.getFullYear() === currentYear &&
      startedAt.getMonth() <= currentMonth
    ) {
      monthIndexes.add(startedAt.getMonth())
    }
  })

  return [...monthIndexes]
    .sort((a, b) => a - b)
    .map((monthIndex) => new Date(currentYear, monthIndex, 1))
}

export function calendarDays(
  sessions: StudySession[],
  month: Date,
  now = new Date(),
): CalendarDay[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const numberOfDays = new Date(year, monthIndex + 1, 0).getDate()
  const totals = new Map<string, number>()

  sessionsForMonth(sessions, month).forEach((session) => {
    const key = dateKey(new Date(session.startedAt))
    totals.set(key, (totals.get(key) ?? 0) + session.focusedDurationMs)
  })

  const todayKey = dateKey(now)
  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1)
    const key = dateKey(date)
    return {
      key,
      dayNumber: index + 1,
      focusedDurationMs: totals.get(key) ?? 0,
      isToday: key === todayKey,
    }
  })
}

export function chartScaleCeiling(days: DailyTotal[]): number {
  const rawMaximum = Math.max(0, ...days.map((day) => day.focusedDurationMs))
  return Math.max(
    60 * 60_000,
    Math.ceil(rawMaximum / (30 * 60_000)) * 30 * 60_000,
  )
}

export function sessionsForRange(
  sessions: StudySession[],
  range: AnalysisRange,
  now = new Date(),
): StudySession[] {
  if (range === 'all') return [...sessions]

  const days = range === 'today' ? 1 : range === '7days' ? 7 : 30
  const start = startOfLocalDay(now).getTime() - (days - 1) * DAY_MS
  return sessions.filter((session) => Date.parse(session.startedAt) >= start)
}

export function summarizeSessions(sessions: StudySession[]): AnalysisSummary {
  const focusedValues = sessions
    .map((session) => session.focusedDurationMs)
    .sort((a, b) => a - b)
  const focusedDurationMs = focusedValues.reduce((total, value) => total + value, 0)
  const midpoint = Math.floor(focusedValues.length / 2)
  const medianFocusedMs = focusedValues.length
    ? focusedValues.length % 2
      ? focusedValues[midpoint]
      : (focusedValues[midpoint - 1] + focusedValues[midpoint]) / 2
    : 0

  return {
    focusedDurationMs,
    pausedDurationMs: sessions.reduce(
      (total, session) => total + session.pausedDurationMs,
      0,
    ),
    completedCount: sessions.filter((session) => session.status === 'completed').length,
    interruptedCount: sessions.filter((session) => session.status === 'interrupted').length,
    pauseCount: sessions.reduce((total, session) => total + session.pauseCount, 0),
    averageFocusedMs: sessions.length ? focusedDurationMs / sessions.length : 0,
    medianFocusedMs,
  }
}

export function dailyTotals(
  sessions: StudySession[],
  range: AnalysisRange,
  now = new Date(),
): DailyTotal[] {
  const earliest = sessions.length
    ? Math.min(...sessions.map((session) => startOfLocalDay(new Date(session.startedAt)).getTime()))
    : startOfLocalDay(now).getTime()
  const count =
    range === 'today'
      ? 1
      : range === '7days'
        ? 7
        : range === '30days'
          ? 30
          : Math.max(1, Math.ceil((startOfLocalDay(now).getTime() - earliest) / DAY_MS) + 1)
  const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (count - 1))
  const totals = new Map<string, number>()

  sessions.forEach((session) => {
    const key = dateKey(new Date(session.startedAt))
    totals.set(key, (totals.get(key) ?? 0) + session.focusedDurationMs)
  })

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index)
    const key = dateKey(day)
    return {
      key,
      label: day.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
      focusedDurationMs: totals.get(key) ?? 0,
    }
  })
}

export function subjectTotals(sessions: StudySession[]): SubjectTotal[] {
  const totals = new Map<string, number>()
  sessions.forEach((session) => {
    const subject = session.subject || 'Unlabelled'
    totals.set(subject, (totals.get(subject) ?? 0) + session.focusedDurationMs)
  })

  return [...totals.entries()]
    .map(([subject, focusedDurationMs]) => ({ subject, focusedDurationMs }))
    .sort((a, b) => b.focusedDurationMs - a.focusedDurationMs)
}
