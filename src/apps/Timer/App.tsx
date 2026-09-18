import { useMotionPreferences } from '../../lib/useMotionPreferences'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { AboutPanel } from './components/AboutPanel'
import { AnalysisPanel } from './components/AnalysisPanel'
import { NotesPanel } from './components/NotesPanel'
import { TimerPanel } from './components/TimerPanel'
import { useStudyTimer } from './hooks/useStudyTimer'

type AppView = 'timer' | 'analysis' | 'notes' | 'about'

export function App() {
  const [view, setView] = useState<AppView>('timer')
  const timer = useStudyTimer()
  const reduceMotion = useMotionPreferences()
  const focusMode = Boolean(timer.active)

  const switchView = (nextView: AppView) => {
    if (nextView === view) return
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => void
    }
    if (!transitionDocument.startViewTransition || reduceMotion) {
      setView(nextView)
      return
    }
    transitionDocument.startViewTransition(() => {
      flushSync(() => setView(nextView))
    })
  }

  const openTimer = () => switchView('timer')
  const openAnalysis = () => {
    if (!focusMode) switchView('analysis')
  }
  const openNotes = () => {
    if (!focusMode) switchView('notes')
  }
  const openAbout = () => {
    if (!focusMode) switchView('about')
  }

  if (!timer.ready) {
    return (
      <main className="loading-screen">
        <p>RESTORING LOCAL SESSION</p>
      </main>
    )
  }

  return (
    <main className={`app-shell view-${view} ${focusMode ? 'focus-mode' : ''}`}>
      {!focusMode && (
        <nav className="primary-nav" aria-label="Primary navigation">
          <button
            type="button"
            className={view === 'timer' ? 'is-active' : ''}
            onClick={openTimer}
          >
            TIMER
          </button>
          <button
            type="button"
            className={view === 'analysis' ? 'is-active' : ''}
            onClick={openAnalysis}
          >
            ANALYSIS
          </button>
          <button
            type="button"
            className={view === 'notes' ? 'is-active' : ''}
            onClick={openNotes}
          >
            NOTES
          </button>
          <button
            type="button"
            className={view === 'about' ? 'is-active' : ''}
            onClick={openAbout}
          >
            ABOUT
          </button>
        </nav>
      )}

      {view === 'timer' && (
        <div className="timer-stage view-transition-surface">
          <TimerPanel
            active={timer.active}
            displayMs={timer.displayMs}
            lastResult={timer.lastResult}
            onEnd={timer.end}
            onPause={timer.pause}
            onResume={timer.resume}
            onStart={timer.start}
            onStartOpen={timer.startOpen}
            onStartAnother={() => timer.setLastResult(null)}
            onViewAnalysis={openAnalysis}
          />
        </div>
      )}

      {view === 'timer' && !focusMode && (
        <AnalysisPanel
          compact
          sessions={timer.sessions}
          onOpen={openAnalysis}
        />
      )}

      {view === 'analysis' && (
        <AnalysisPanel
          sessions={timer.sessions}
        />
      )}

      {view === 'notes' && <NotesPanel />}

      {view === 'about' && <AboutPanel />}

      {timer.storageMessage && (
        <p className="storage-warning" role="alert">{timer.storageMessage}</p>
      )}
    </main>
  )
}
