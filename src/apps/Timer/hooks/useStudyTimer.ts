import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'
import {
  commitFinishedSession,
  getActiveSession,
  saveActiveSession,
} from '../data/repository'
import {
  createActiveSession,
  createOpenSession,
  finishSession,
  focusedDuration,
  pauseSession,
  remainingDuration,
  resumeSession,
  timerMode,
} from '../domain/timer'
import type { ActiveSession, SessionStatus, StudySession } from '../domain/types'

export function useStudyTimer() {
  const [active, setActive] = useState<ActiveSession | null>(null)
  const [lastResult, setLastResult] = useState<StudySession | null>(null)
  const [now, setNow] = useState(Date.now())
  const [ready, setReady] = useState(false)
  const [storageMessage, setStorageMessage] = useState('')
  const finishingRef = useRef<string | null>(null)
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().toArray(),
    [],
    [],
  )

  const finalize = useCallback(async (current: ActiveSession, status: SessionStatus) => {
    if (finishingRef.current === current.id) return
    finishingRef.current = current.id
    const session = finishSession(current, status)
    try {
      await commitFinishedSession(session)
      setActive(null)
      setLastResult(session)
      setStorageMessage('')
    } catch {
      setStorageMessage('The session could not be saved. Keep this tab open and try again.')
    } finally {
      finishingRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void getActiveSession()
      .then(async (recovered) => {
        if (cancelled || !recovered) return
        if (
          timerMode(recovered) === 'countdown' &&
          recovered.state === 'running' &&
          remainingDuration(recovered) <= 0
        ) {
          await finalize(recovered, 'completed')
          return
        }
        setActive(recovered)
      })
      .catch(() => setStorageMessage('Local storage is unavailable in this browser context.'))
      .finally(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [finalize])

  useEffect(() => {
    if (active?.state !== 'running') return
    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [active?.id, active?.state])

  const displayMs = useMemo(
    () => active
      ? timerMode(active) === 'open'
        ? focusedDuration(active, now)
        : remainingDuration(active, now)
      : 0,
    [active, now],
  )

  useEffect(() => {
    if (
      active &&
      timerMode(active) === 'countdown' &&
      active.state === 'running' &&
      displayMs <= 0
    ) {
      void finalize(active, 'completed')
    }
  }, [active, displayMs, finalize])

  useEffect(() => {
    if (active?.state !== 'running' || document.visibilityState !== 'visible') return
    let handle: WakeLockSentinel | null = null
    const wakeLock = navigator.wakeLock
    if (wakeLock) {
      void wakeLock.request('screen').then((lock) => {
        handle = lock
      }).catch(() => undefined)
    }
    return () => {
      if (handle) void handle.release()
    }
  }, [active?.id, active?.state])

  const start = useCallback(async (durationMinutes: number, subject: string) => {
    const next = createActiveSession(durationMinutes, subject)
    await saveActiveSession(next)
    setLastResult(null)
    setActive(next)
    setNow(Date.now())
  }, [])

  const startOpen = useCallback(async (subject: string) => {
    const next = createOpenSession(subject)
    await saveActiveSession(next)
    setLastResult(null)
    setActive(next)
    setNow(Date.now())
  }, [])

  const pause = useCallback(async () => {
    if (!active) return
    const next = pauseSession(active)
    await saveActiveSession(next)
    setActive(next)
  }, [active])

  const resume = useCallback(async () => {
    if (!active) return
    const next = resumeSession(active)
    await saveActiveSession(next)
    setActive(next)
    setNow(Date.now())
  }, [active])

  const end = useCallback(async () => {
    if (active) {
      await finalize(active, timerMode(active) === 'open' ? 'completed' : 'interrupted')
    }
  }, [active, finalize])

  return {
    active,
    displayMs,
    end,
    lastResult,
    pause,
    ready,
    resume,
    sessions,
    setLastResult,
    start,
    startOpen,
    storageMessage,
  }
}
