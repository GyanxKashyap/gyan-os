# Gyan OS

My portfolio, built as a desktop operating system that runs in the browser.

Not a page you scroll — a desktop you use. There's a window manager with real
dragging and resizing, a dock that magnifies, global search, live wallpapers you
can replace with your own, and seven apps. One of those apps talks to a language
model I wrote from scratch.

```bash
npm install
npm run dev          # -> http://localhost:5173
```

---

## The apps

| app | what it is |
|---|---|
| **Aizen** | Chat and story generation against my own 40M-parameter LLM, plus its benchmark, training phases and model card |
| **Projects** | Finder-style browser for the eleven things I have built |
| **About Me** | Who I am, the timeline, what I actually know |
| **Lab** | Training timeline, real loss curves from the metrics CSVs, every checkpoint, every dataset |
| **Knowledge** | Notes on what I learned building all of it |
| **Timer** | My native macOS study timer, ported to run inside the OS — it keeps its own brutalist look on purpose |
| **Settings** | Wallpapers, accent colours, animation and transparency toggles |

## Aizen needs a backend

The Aizen app is wired to a real model, not a canned script. It expects
[the Aizen server](https://github.com/GyanxKashyap/aizen) on port 8321, which
`vite.config.ts` proxies for `/chat`, `/story` and `/meta`.

Without it the app says so — it shows an honest offline state rather than
faking a reply. Nothing in this repository invents a model response.

Note that the proxy is a **dev-server** feature. A static build has no backend,
so a deployed copy shows Aizen offline unless the server is hosted too.

## How it is put together

- **Vite + React 19 + TypeScript**, Tailwind v4 through `@tailwindcss/vite`
- **zustand** for window state (`src/store/windows.ts`) — geometry, z-order and
  a z-counter; settings and custom wallpapers persist to localStorage and
  IndexedDB
- **motion** for the dock springs and window transitions
- Apps deep-link to each other through intents: `open(appId, intent)` plus the
  `useIntent` hook, which is how search results land on the right tab
- Every Aizen number in `src/data/` is generated from the training repo's real
  `results/*.json` — including the two places the score went *down*

```
src/
  desktop/   menu bar, dock, windows, icons, search, wallpaper
  apps/      the seven applications
  store/     windows, settings, notifications, custom wallpapers
  data/      projects, about, knowledge, aizen, loss curves
  assets/    icons and project screenshots
```

## Two rules I held to

**No invented numbers.** Every benchmark score, parameter count and training
detail comes from a real result file. The benchmark chart shows v4 and v5
dipping, because they did.

**No faked intelligence.** Aizen's replies come from the model or they do not
come at all.

---

## License

MIT — see [LICENSE](LICENSE).
