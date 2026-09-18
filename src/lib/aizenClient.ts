export interface AizenMeta {
  checkpoint: string
  story_checkpoint: string
  params: number
}

export function aizenUrl(path: '/chat' | '/story' | '/meta') {
  const base = (import.meta.env?.VITE_AIZEN_API_BASE ?? '').replace(/\/+$/, '')
  return `${base}${path}`
}

export function isAizenMeta(value: unknown): value is AizenMeta {
  if (!value || typeof value !== 'object') return false
  const meta = value as Partial<AizenMeta>
  return typeof meta.checkpoint === 'string' && meta.checkpoint.length > 0 &&
    typeof meta.story_checkpoint === 'string' && meta.story_checkpoint.length > 0 &&
    typeof meta.params === 'number' && Number.isFinite(meta.params) && meta.params > 0
}

export async function checkAizen(): Promise<AizenMeta> {
  const response = await fetch(aizenUrl('/meta'), { signal: AbortSignal.timeout(5000), cache: 'no-store' })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Aizen is unavailable')
  }
  const meta: unknown = await response.json()
  if (!isAizenMeta(meta)) throw new Error('Invalid Aizen metadata')
  return meta
}

export async function readTextStream(body: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      if (text) onChunk(text)
    }
    const tail = decoder.decode()
    if (tail) onChunk(tail)
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}

export class AizenRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function streamAizen(
  path: '/chat' | '/story',
  payload: object,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
) {
  const response = await fetch(aizenUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.any([signal, AbortSignal.timeout(180_000)]),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new AizenRequestError(typeof data?.error === 'string' ? data.error : 'Aizen could not process this request.', response.status)
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/plain')) {
    throw new Error('The server did not return an Aizen response.')
  }
  await readTextStream(response.body, onChunk)
}

export function generationError(error: unknown, stopped: boolean) {
  if (stopped) return '⚠ Generation stopped.'
  if (error instanceof AizenRequestError && error.status < 500) return `⚠ ${error.message}`
  if (error instanceof Error && error.name === 'TimeoutError') return '⚠ Aizen took too long to respond. Please try again.'
  return '⚠ Aizen is unavailable. Check the model connection and try again.'
}
