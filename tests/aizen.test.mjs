import test from 'node:test'
import assert from 'node:assert/strict'
import { readTextStream, checkAizen, streamAizen, generationError, AizenRequestError } from '../src/lib/aizenClient.ts'

test('UTF-8 split at every byte boundary preserves emojis and non-Latin text', async () => {
  const expected='Hello 🌙 — नमस्ते 日本語'
  const bytes=new TextEncoder().encode(expected)
  const body=new ReadableStream({start(c){ for (const byte of bytes) c.enqueue(Uint8Array.of(byte)); c.close() }})
  let result=''
  await readTextStream(body, chunk=>result+=chunk)
  assert.equal(result,expected)
  assert.equal(body.locked,false)
})
test('stream failures release the reader', async () => {
  const body=new ReadableStream({pull(c){c.error(new Error('connection lost'))}})
  await assert.rejects(readTextStream(body,()=>{}), /connection lost/)
  assert.equal(body.locked,false)
})
test('health check rejects HTML fallback and malformed metadata', async t => {
  const fetch=t.mock.method(globalThis,'fetch')
  for (const response of [new Response('<html/>',{headers:{'Content-Type':'text/html'}}),Response.json({}),Response.json({checkpoint:'x',story_checkpoint:'y',params:0})]) {
    fetch.mock.mockImplementation(async()=>response)
    await assert.rejects(checkAizen())
  }
  const meta={checkpoint:'phase8.pt',story_checkpoint:'story.pt',params:40188928}
  fetch.mock.mockImplementation(async()=>Response.json(meta))
  assert.deepEqual(await checkAizen(),meta)
})
test('generation propagates backend validation errors and rejects HTML', async t => {
  const fetch=t.mock.method(globalThis,'fetch',async()=>Response.json({error:'Question is too long'},{status:400}))
  await assert.rejects(streamAizen('/chat',{question:'x'},()=>{},new AbortController().signal),error=>error instanceof AizenRequestError && error.status===400 && generationError(error,false).includes('too long'))
  fetch.mock.mockImplementation(async()=>new Response('<html/>',{headers:{'Content-Type':'text/html'}}))
  await assert.rejects(streamAizen('/chat',{},()=>{},new AbortController().signal), /did not return/)
})
test('valid response streams text and forwards caller cancellation', async t => {
  const controller=new AbortController()
  let signal
  t.mock.method(globalThis,'fetch',async(_url,options)=>{signal=options.signal;return new Response('A real response',{headers:{'Content-Type':'text/plain'}})})
  let output=''
  await streamAizen('/story',{prompt:'Once'},chunk=>output+=chunk,controller.signal)
  assert.equal(output,'A real response')
  controller.abort()
  assert.equal(signal.aborted,true)
  assert.equal(generationError(new Error(),true),'⚠ Generation stopped.')
})
