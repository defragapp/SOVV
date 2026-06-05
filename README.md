# SOVV

SOVV is a privacy-first relational intelligence platform.

## Architecture

- **Frontend**: Next.js App Router hosted on Cloudflare Pages (`sovv-web`).
- **API Workers**: 
  - `sovv-platform`: Core AI inference and workspace logic.
  - `sovereign-os-api`: Baseline Design and user profile data.
  - `worker-session`: Authentication and session management.
- **Database**: Cloudflare D1.
- **Security**: Cloudflare Turnstile.

## Core Principle

One user. One Design. One Library. Multiple guided workspaces.

## Database Schema

- **users**: Primary user records and authentication metadata.
- **designs**: Structural baseline data for each user.
- **library**: Unified results layer for all workspaces (DEFRAG, COVENANT).

## Notes for users and contributors
