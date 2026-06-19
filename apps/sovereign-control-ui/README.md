# sovereign-control-ui

Internal operator UI for Sovereign.os platform development.

## Stack

- React 18 + Vite
- TypeScript
- No external UI library — pure CSS-in-JS

## Local development

```bash
npm install
npm run dev
```

Proxies `/api` to `http://localhost:8787` (sovereign-control Worker dev server).

## Architecture

- Thread-based layout (left: threads, center: messages, bottom: composer)
- Mode-aware (Inspect / Build / Deploy / Creative)
- Structured message blocks (text, meta, action, error, diff, preview)
- TODO markers for Browser Run, AI Gateway, deploy wiring

## TODO

- [ ] Wire `/api/action` to sovereign-control backend
- [ ] Browser Run screenshot integration
- [ ] Diff viewer for file modifications
- [ ] Preview panel (iframe) for live URL inspection
- [ ] Deploy confirmation flow
- [ ] Mobile bottom nav
