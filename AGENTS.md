# AGENTS.md

Guidelines for agents working in this repository.

## Build / Lint / Test
- This repo contains static HTML/Markdown only; no formal build system.
- To preview HTML: open `index.html` in a browser.
- No linter is configured; keep formatting consistent and readable.
- No automated tests exist. If tests are added, place them in `tests/` and document commands.
- For single‑test workflows, use `npm test -- <pattern>` once a test runner is introduced.

## Code Style
- Prefer simple, readable HTML/JS/CSS without unnecessary abstraction.
- Keep imports (if JS added later) grouped: external libs first, then local modules.
- Use consistent indentation (2 spaces) and trailing newlines.
- Prefer descriptive identifiers; avoid one‑letter names.
- Keep functions pure when reasonable; handle errors explicitly.
- Avoid global variables; encapsulate logic.
- Add comments only when clarity requires it.
- For Markdown files, wrap lines around 100 chars.

## Misc
- No Cursor or Copilot rules found; add references here if added later.
