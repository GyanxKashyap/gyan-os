import { formatClock } from '../utils/format'

interface FlipClockProps {
  countUp?: boolean
  durationMs: number
  subduedSeconds?: boolean
}

function Digit({ value, animate = false }: { value: string; animate?: boolean }) {
  return (
    <span className={`flip-digit ${animate ? 'should-flip' : ''}`} aria-hidden="true">
      <span>{value}</span>
      <i className="flip-hinge" />
    </span>
  )
}

export function FlipClock({ countUp = false, durationMs, subduedSeconds = false }: FlipClockProps) {
  const { minutes, seconds } = formatClock(durationMs, countUp)
  return (
    <div
      className="flip-clock"
      role="timer"
      aria-label={`${minutes} minutes and ${seconds} seconds ${countUp ? 'focused' : 'remaining'}`}
    >
      <span className="flip-unit flip-minutes">
        {minutes.split('').map((digit, index) => (
          <Digit key={`minute-${index}-${digit}`} value={digit} animate />
        ))}
      </span>
      <span className="flip-colon" aria-hidden="true">:</span>
      <span className={`flip-unit flip-seconds ${subduedSeconds ? 'is-subdued' : ''}`}>
        {seconds.split('').map((digit, index) => (
          <Digit key={`second-${index}`} value={digit} />
        ))}
      </span>
    </div>
  )
}
