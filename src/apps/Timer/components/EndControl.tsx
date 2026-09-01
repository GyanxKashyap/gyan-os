import { useEffect, useRef, useState } from 'react'

interface EndControlProps {
  openEnded?: boolean
  onEnd: () => Promise<void>
}

export function EndControl({ openEnded = false, onEnd }: EndControlProps) {
  const [confirming, setConfirming] = useState(false)
  const [holding, setHolding] = useState(false)
  const holdTimer = useRef<number | null>(null)
  const holdCompleted = useRef(false)

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
  }, [])

  const cancelHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
    setHolding(false)
  }

  const startHold = () => {
    holdCompleted.current = false
    setHolding(true)
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null
      holdCompleted.current = true
      void onEnd()
    }, 2000)
  }

  if (confirming) {
    return (
      <div className="end-confirmation" role="group" aria-label="Confirm ending the session">
        <p>
          {openEnded
            ? 'This open session will be saved as completed.'
            : 'This session will be recorded as interrupted.'}
        </p>
        <button type="button" className="quiet-action" onClick={() => setConfirming(false)}>
          KEEP STUDYING
        </button>
        <button
          type="button"
          className={openEnded ? 'quiet-action confirm-finish-action' : 'danger-action'}
          onClick={() => void onEnd()}
        >
          {openEnded ? 'FINISH SESSION' : 'END SESSION'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`end-action ${holding ? 'is-holding' : ''}`}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onClick={() => {
        if (holdCompleted.current) {
          holdCompleted.current = false
          return
        }
        setConfirming(true)
      }}
    >
      {holding
        ? openEnded ? 'HOLD TO FINISH' : 'HOLD TO END'
        : openEnded ? 'FINISH' : 'END'}
    </button>
  )
}
