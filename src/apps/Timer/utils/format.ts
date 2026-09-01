export function formatClock(durationMs: number, countUp = false): {
  minutes: string
  seconds: string
} {
  const totalSeconds = Math.max(0, countUp
    ? Math.floor(durationMs / 1000)
    : Math.ceil(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

export function formatDuration(durationMs: number): string {
  if (durationMs > 0 && durationMs < 60_000) {
    return `${Math.max(1, Math.round(durationMs / 1000))}s`
  }
  const totalMinutes = Math.round(durationMs / 60_000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${hours}h`
}

export function formatCalendarDuration(durationMs: number): string {
  if (durationMs <= 0) return '0m'
  if (durationMs < 60_000) return '<1m'
  return formatDuration(durationMs)
}

export function formatDateStamp(value: Date): string {
  return value
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()
}

export function formatStartTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatNoteTimestamp(value: string): string {
  const date = new Date(value)
  const day = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return `${day} / ${time}`
}
