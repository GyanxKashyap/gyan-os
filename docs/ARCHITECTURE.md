# Architecture

Gyan OS is a React 19 / TypeScript single-page app built with Vite and Tailwind.
Zustand holds shell state, Motion handles interface transitions, and Dexie backs
the embedded Timer’s IndexedDB records.

```text
src/main.tsx → App → Desktop
                       ├─ wallpaper, menu bar, dock, search, notifications
                       └─ Window → lazy-loaded app component
```

## Shell and apps

`src/lib/apps.ts` is metadata only. `appComponents.ts` resolves implementations
with React.lazy, so the window store does not import app code. Window bodies use
Suspense while chunks load. `src/store/windows.ts` owns window geometry, stacking,
minimized/maximized flags and navigation intents. `windowGeometry.ts` clamps
windows to available workspace bounds, including viewport resize.

A minimized window stays mounted, hidden and inert. Closing unmounts it.
The focus order also determines z-order and keyboard menu targets; z-indices
remain below the dock, menus and overlays. Geometry is intentionally transient.

Search indexes app metadata and bundled JSON. `open(appId, intent)` sends a
nonce-tagged intent; `useIntent` selects the requested project or app tab.
Aizen Chat and Story stay mounted when switching information tabs.

## Aizen boundary

`aizenClient.ts` validates `/meta` and consumes streamed text with a stateful UTF-8
decoder. It handles HTTP errors, cancellation and timeouts. `store/aizen.ts`
shares status and deduplicates concurrent checks. Aizen is an external **local**
process; this repository does not contain the server or weights. See the
[local-demo guide](AIZEN_LOCAL_DEMO.md).

## Persistence

| Data | Location | Survives reload? |
| --- | --- | --- |
| Wallpaper choice, accent, motion, dock preference | `gyan-os-settings` localStorage | Yes |
| Uploaded wallpaper blobs | `gyan-os` IndexedDB | Yes |
| Timer sessions, active session, notes, preferences | `personal-study-timer` IndexedDB | Yes |
| Window arrangement, open tabs, chat drafts | React/Zustand memory | No |

Timer separates UI, domain calculations and repository functions. Elapsed time
comes from timestamps, not tick counts. The ticking callback checks completion;
recovery handles an expired saved session. A database transaction commits the
finished session and clears the active record. Browser suspension can delay UI
updates; a web timer is not a background operating-system alarm.

## Appearance

`src/index.css` supplies the existing glass, palette and typography tokens.
`src/lib/wallpapers.ts` defines built-in wallpapers and the fresh-install default.
Existing preferences are preserved. Imported wallpaper colors tint the shell;
the bundled video uses a dark palette and a still poster. The shared motion hook
combines the app preference with `prefers-reduced-motion`.

## Repository map

```text
src/desktop/       Desktop chrome and window components
src/apps/          Portfolio apps and embedded Timer
src/apps/Timer/    UI, domain, IndexedDB repository and formatting
src/store/         Zustand stores
src/lib/           App metadata, geometry, Aizen client and wallpaper helpers
src/data/          Portfolio and model information
src/assets/        Icons, profile image and project screenshots
public/wallpapers/ Bundled default video and poster
 tests/            Node regression tests
 docs/             Guides and captured UI screenshots
```

The local `graphify-out/` directory is ignored. Its graph was created before the
window/registry refactor and is a historical analysis aid, not a current runtime
specification. Regenerate it before relying on its dependency counts.
