# Sovereign.os AI Wiring Plan

## 1. Centralized Prompts
We need to abstract prompt generation out of individual space routes and into a shared `packages/prompts` library. This ensures consistency and makes it easier to update prompts across the entire platform.

Each space will have its own prompt generator:
- `generateDefragPrompt(baseline, context)`
- `generateAlignmentPrompt(baseline, context)`
- `generateCovenantPrompt(baseline, context)`

## 2. Worker-AI Service
The `apps/worker-ai` service will act as the single entry point for all AI inference. It will receive structured requests from the core API worker, assemble the correct prompt using the `packages/prompts` library and the provided Baseline Design, and then route the request through the Cloudflare AI Gateway.

## 3. Strict JSON Outputs
All AI models MUST be instructed to return responses in a strict JSON format defined by Zod schemas. This ensures the frontend receives predictable, parseable data.

## 4. Security
The Baseline Design MUST be injected securely on the server-side within `worker-ai`. It should never be passed in the client request body.
