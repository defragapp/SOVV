# Sovereign.os Platform Architecture

## Core Logic
The platform operates on a strictly server-side intelligence model. The client layer (Next.js) serves as a thin UI for the data retrieved from the Cloudflare Worker API.

## Database Layer (Cloudflare D1)
- **Library Table**: Unified storage for workspace outputs. Strict row-level isolation using `user_id`.
- **Designs Table**: User baseline configuration.
- **Users Table**: Authentication state.

## Security Layer
- **Authentication**: JWT-based sessions managed by `worker-session`.
- **Bot Protection**: Silent Turnstile validation on all critical workspace inputs.
- **Isolation**: All database queries hard-code a `WHERE user_id = ?` clause derived from the verified session.

## Workspaces
1. **DEFRAG**: Real-time pattern analysis for relational moments.
2. **COVENANT**: Long-form structural dynamics for groups.

## Design System
- **Esoteric Brutalism**: Pure black backgrounds, 1px white borders, monospaced typography, zero gradients, zero rounded corners.