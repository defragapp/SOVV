# Implementation Plan: Relational Memory Layer

## Objective
Enhance the `/api/explain` endpoint to leverage the newly created D1 tables (`interactions` and `patterns`) for a relational memory layer. This involves logging every interaction and extracting behavioral patterns to build a long-term context that improves subsequent explanations.

## Implementation Steps

### 1. Database Helpers
Create helper functions for D1 operations in `apps/worker/src/db.ts` to manage inserting interactions and upserting extracted patterns.

### 2. Update `handleExplain`
Modify `apps/worker/src/explain.ts` to:
- Retrieve existing patterns for the session and inject them into the system prompt.
- After generating the explanation, save the new interaction to D1.

### 3. Background Pattern Extraction
Create an asynchronous process (using `ctx.waitUntil` if available, or floating promises) that triggers after an explanation to:
- Fetch recent interactions for the session.
- Run a background AI prompt to identify new or recurring patterns.
- Upsert the findings into the `patterns` table.