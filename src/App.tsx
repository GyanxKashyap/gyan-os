import { useState } from 'react'
import { Boot } from './desktop/Boot'
import { Desktop } from './desktop/Desktop'

export default function App() {
  const [booted, setBooted] = useState(false)
  return (
    <div className="h-full w-full">
      <Desktop />
      {!booted && <Boot onDone={() => setBooted(true)} />}
    </div>
  )
}
