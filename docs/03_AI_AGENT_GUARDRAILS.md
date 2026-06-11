# AI Agent Guardrails

This document outlines the strict operational parameters for any AI agent interacting with the Sovereign.os codebase. These rules are non-negotiable and designed to prevent architectural drift, maintain product integrity, and enforce the category-defining aesthetic of the platform.

## 1. Source of Truth

*   **Deployment:** GitHub `main` branch → Cloudflare Workers Builds → Cloudflare Workers. Do **not** introduce Render, Vercel, or GitHub Actions as the primary deployment path unless explicitly authorized by the project owner.
*   **Architecture:** The product is a monorepo consisting of a Next.js frontend (`apps/web`) and Cloudflare Worker backends (`apps/worker`, `apps/worker-ai`, etc.). Do not attempt to alter this architecture.
*   **Data Layer:** Cloudflare D1 (Relational), KV (Sessions/Caching), R2 (Assets).

## 2. Product Language & Identity

*   **Sovereign.os is the platform.** Defrag, Covenant, and Alignment are *spaces* within it.
*   **Banned Terminology:** Never use the following terms in user-facing UI or generated content:
    *   *Therapy replacement, diagnosis, anxious, avoidant, attachment style, toxic, narcissist.*
    *   *Chatbot, AI assistant, Ask anything.*
    *   *Workspace, Workbench* (use "space").
    *   *Compatibility score, verdict, Oracle, Destiny.*
*   **Required Terminology:** Use canonical terms: Baseline Design, Active pattern, The Repeat, Old Role, Strain Pattern, Gift Under Strain, Best Next Response, Conversational Steering, Sovereign.os Library, Covenant Brief.

## 3. Product Experience Guardrails

*   **No Chatbot UI:** Sovereign.os provides structured architectural insight, not a conversation. Never implement generic chat bubbles or streaming text blobs.
*   **Structured Results Only:** Defrag outputs must be parsed and rendered into distinct, actionable sections (e.g., Active Pattern, Old Role, Best Next Response).
*   **Honest States:** Do not fake functionality. If an API route (e.g., `/api/covenant`) or a feature (e.g., Stripe, Audio Overview) is not fully implemented or configured, render a beautifully styled "honest unavailable" or "coming soon" state. Do not mock data.
*   **Continuity Over Storage:** The Library is the continuity layer. It must clearly identify the source of the saved item (Defrag, Covenant, etc.) without exposing the internal `workspace_source` database enum to the user.

## 4. Visual System (Premium SaaS)

*   **Aesthetic:** High-end financial terminal + calm editorial product + emotionally intelligent SaaS.
*   **Palette:** Deep charcoal/near-black base (`#050505`, `#080808`, `#0A0A0A`), warm off-white text (`#FAFAFA`), muted gray secondary text (`#A1A1AA`, `#71717A`).
*   **Components:** Graphite layered cards with subtle `1px` borders (`border-white/[0.08]`). No loud gradients, neon colors, or excessive glassmorphism.
*   **Typography:** Strong hierarchy. Use tracking (`tracking-[-0.02em]` for headings, `tracking-[0.1em] uppercase text-[10px]` for labels). Monospace fonts should be used for technical or structural metadata.

## 5. Operational Workflow

*   **Verify Before Committing:** Always run `npm run build -w apps/web` and `npm run build -w apps/worker` before proposing changes.
*   **Preserve Existing Logic:** When refining UI components, carefully preserve all existing React state, API calls, event handlers, and auth checks.
*   **Auth & Billing:** Do not invent new auth or billing systems. Preserve the existing Turnstile, JWT session, and Stripe webhook logic. Do not grant Pro features from frontend state manipulation.

Any deviation from these guardrails requires explicit confirmation from the human operator.
