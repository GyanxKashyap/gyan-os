import './styles.css'
import { App } from './App'

/** Gyan's native macOS study timer (TIMER-APPv1.1), running inside Gyan OS.
    The upstream app is React + Dexie with no Tauri runtime calls, so it ports
    directly. styles.css is scoped under .timer-app-root so its global selectors
    cannot leak into the OS, and .timer-app-shell is a size container so the
    app's vh/vw layout and breakpoints resolve against this window rather than
    the browser viewport. */
export function TimerApp() {
  return (
    <div className="timer-app-shell">
      <div className="timer-app-root">
        <App />
      </div>
    </div>
  )
}
