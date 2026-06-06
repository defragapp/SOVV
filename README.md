# SOVV

SOVV is a privacy-first relational intelligence platform.

## Architecture

- **Frontend**: Next.js App Router deployed as a Cloudflare Worker via OpenNext (`sovv-web`).
- **API Worker**: `sovereign-os-api` for baseline, auth, explain, history, billing, and workspace logic.
- **Session Worker**: `worker-session` for websocket session coordination.
- **AI Worker**: `worker-ai` for auxiliary AI analysis.
- **Database**: Cloudflare D1.
- **Cache / Session State**: Cloudflare KV.
- **Object Storage**: Cloudflare R2.
- **Queue**: Cloudflare Queue for background pattern extraction.
- **Security**: Cloudflare Turnstile and Cloudflare Access where applicable.

## Core Principle

One user. One Baseline. One Library. Multiple guided workspaces.

## Main Surfaces

- `defrag.app` / `www.defrag.app` — public marketing site
- `sovereign.defrag.app` — platform entry
- `app.defrag.app` — authenticated workspace
- `api.defrag.app` — API surface

## Database Schema

- **users**: Primary user records and authentication metadata.
- **sessions**: Session tokens and expiry data.
- **library**: Unified saved-work layer for all workspaces.

## Notes for users and contributors
