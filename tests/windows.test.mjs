import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { useWindows } from '../src/store/windows.ts'
import { fitWindow, workspaceBounds } from '../src/lib/windowGeometry.ts'

beforeEach(() => {
  globalThis.window = { innerWidth: 1280, innerHeight: 900 }
  useWindows.setState({ windows: {}, order: [], intents: {}, nextZ: 100 })
})
const state = () => useWindows.getState()
const within = (rect, view) => {
  const bounds = workspaceBounds(view)
  assert.ok(rect.x >= bounds.x && rect.y >= bounds.y)
  assert.ok(rect.x + rect.w <= bounds.x + bounds.w)
  assert.ok(rect.y + rect.h <= bounds.y + bounds.h)
}

test('open, move, resize and maximize stay inside a narrow phone workspace', () => {
  window.innerWidth = 320; window.innerHeight = 568
  state().open('projects')
  within(state().windows.projects)
  state().move('projects', -2000, 2000)
  state().resize('projects', 2000, 2000)
  within(state().windows.projects)
  state().toggleMaximize('projects')
  assert.deepEqual({ x: state().windows.projects.x, y: state().windows.projects.y, w: state().windows.projects.w, h: state().windows.projects.h }, workspaceBounds())
})
test('maximizing a background window updates active window and keyboard close target', () => {
  state().open('projects'); state().open('about')
  state().toggleMaximize('projects')
  assert.equal(state().activeApp(), 'projects')
  assert.ok(state().windows.projects.z > state().windows.about.z)
  state().closeActive()
  assert.equal(state().activeApp(), 'about')
  assert.equal(state().windows.projects, undefined)
})
test('minimize and restore preserve geometry and intent, close clears intent', () => {
  state().open('about', 'Skills')
  const before = state().windows.about
  state().minimize('about')
  assert.equal(state().activeApp(), null)
  state().open('about')
  assert.deepEqual(state().windows.about, before)
  assert.equal(state().intents.about.value, 'Skills')
  state().close('about'); state().open('about')
  assert.equal(state().intents.about, undefined)
})
test('viewport changes refit maximized and restore bounds', () => {
  state().open('projects'); state().toggleMaximize('projects')
  window.innerWidth = 390; window.innerHeight = 844
  state().fitViewport(); within(state().windows.projects)
  state().toggleMaximize('projects'); within(state().windows.projects)
})
test('thousands of focus changes cannot overtake menu and dock layers', () => {
  state().open('about'); state().open('projects')
  for (let i=0;i<5000;i++) state().focus(i%2 ? 'about' : 'projects')
  assert.ok(Math.max(...Object.values(state().windows).map(w=>w.z)) < 4000)
})
test('unknown app IDs do not create phantom windows', () => {
  state().open('missing'); state().focus('missing'); state().toggleMaximize('missing')
  assert.deepEqual(state().order, [])
})
test('all representative screen sizes bound an oversized window', () => {
  for (const width of [320,390,768,1280]) for (const height of [320,568,844,900]) {
    const view={width,height}
    within(fitWindow({x:-500,y:2000,w:950,h:950},view),view)
  }
})
