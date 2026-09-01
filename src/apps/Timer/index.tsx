import './styles.css'
import { App } from './App'

/** Gyan's native macOS study timer (TIMER-APPv1.1), running inside Gyan OS.
    The upstream app is React + Dexie with no Tauri runtime calls, so it ports
    directly; styles.css is scoped under .timer-app-root so it can't leak into
    the rest of the OS. */
export function TimerApp() {
  return (
    <div className="timer-app-root">
      <App />
    </div>
  )
}
