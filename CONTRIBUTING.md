# Contributing

Use Node.js 24+, install with `npm ci`, and run the project locally. Read the
[architecture](docs/ARCHITECTURE.md) and [content guide](docs/CONTENT_GUIDE.md)
before changing the shell or portfolio content.

Keep changes focused and use a meaningful commit for each coherent improvement.
Do not invent project achievements, benchmark scores or live-demo links. Preserve
keyboard controls, narrow-window layouts and reduced-motion behavior.

Before proposing a change, run:

```sh
npm test
npm run lint
npm run build
```

Include what changed, why, and how you checked it. For visual changes, capture the
actual UI. Add tests for behavioral regressions, not tests that merely repeat the
implementation. Keep Aizen local; backend hosting and deployment are deferred.
