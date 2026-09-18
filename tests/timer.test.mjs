import test from 'node:test'
import assert from 'node:assert/strict'
import { createActiveSession, createOpenSession, focusedDuration, remainingDuration, pauseSession, resumeSession, finishSession, MINUTE_MS as minute } from '../src/apps/Timer/domain/timer.ts'
const start=Date.parse('2026-09-18T10:00:00Z')
test('countdown recovers from a long background interval without overcounting',()=>{
  const active=JSON.parse(JSON.stringify(createActiveSession(25,'Physics',start)))
  assert.equal(remainingDuration(active,start+10*minute),15*minute)
  assert.equal(remainingDuration(active,start+90*minute),0)
  assert.equal(focusedDuration(active,start+90*minute),25*minute)
})
test('paused time is excluded when a restored session resumes',()=>{
  const active=createActiveSession(25,'Physics',start)
  const paused=pauseSession(active,start+5*minute)
  assert.equal(focusedDuration(paused,start+30*minute),5*minute)
  const resumed=resumeSession(JSON.parse(JSON.stringify(paused)),start+30*minute)
  const finished=finishSession(resumed,'interrupted',start+35*minute)
  assert.equal(finished.focusedDurationMs,10*minute)
  assert.equal(finished.pausedDurationMs,25*minute)
  assert.equal(finished.pauseCount,1)
})
test('open timer has no countdown ceiling after background recovery',()=>{
  const active=createOpenSession('Reading',start)
  assert.equal(focusedDuration(active,start+120*minute),120*minute)
  assert.equal(active.expectedEndAt,null)
})
