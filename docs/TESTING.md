# Verification and review checklist

## Automated checks

Requires Node.js 24+. Run from the repository root:

```sh
npm ci
npm test
npm run lint
npm run build
```

The 15 regression tests cover bounded window geometry, focus and close targeting,
minimize/restore state, viewport changes, repeated focus ordering, UTF-8 split
across stream chunks, reader cleanup, invalid backend responses, cancellation,
Timer background recovery, pause accounting and open-ended timing.

Lint is configured to fail CI on warnings. The production build type-checks first.
GitHub Actions runs these checks on pushes and pull requests; it does not deploy.

## Your browser review

- [ ] Fresh installation starts with Samurai Crimson Gaze; existing wallpaper
  choices still work. Live wallpaper off shows the matching still image.
- [ ] Reduced motion disables wallpaper motion and UI animation. Restore your
  preferred setting afterward.
- [ ] Open Projects: AI Civilization is absent, Aizen has both supplied images,
  and AI Chatbot has JARVIS and FRIDAY. Inspect full images and source links.
- [ ] About and Skills describe you accurately. Review every contact link.
- [ ] Search for an app, a project and a note. Arrow keys and Enter work; closing
  and reopening Search clears its previous query.
- [ ] Type an Aizen draft, minimize, restore, switch Story→Chat: the draft remains.
- [ ] With the local backend running, try Chat and Story, then Stop during a
  response. Without it, check that the app clearly reports offline.
- [ ] Move, resize, maximize and restore overlapping windows. The active app
  matches the topmost window and the Window menu targets it.
- [ ] At phone/tablet widths, dock icons remain reachable by scrolling, tabs and
  categories scroll, and content stays inside window bounds.
- [ ] In a separate test browser/origin, start a short Timer session, pause/resume,
  minimize, restore and reload. Check the saved result once it finishes. Keep
  test sessions separate from your actual study records.
- [ ] Add/edit a test note and confirm persistence after reload in that test
  origin. Do not clear your main browser data to run this check.

## Recorded checks for this source publication

On 2026-09-18: all 15 tests, lint and the production build passed. Browser checks
covered phone/tablet bounds, draft preservation, wallpaper and motion controls,
project image loading, and local Chat/Story generation. Screenshots in
`screenshots/` document the actual UI, not design mockups.

These checks do not establish behavior on every physical device, multi-tab Timer
coordination, or a hosted model service. No hosted service is configured. Final
personal content review and longer normal-use testing remain with Gyan.
