# Active deploy workflow risk

## Summary

The active platform deploy workflow can deploy multiple Cloudflare Workers from `main`. Treat this as a release-safety risk for web-only work until the workflow is split or gated.

## Risk

A web-only merge should not redeploy unrelated Workers. The web release target is `sovv-web` only, but the active platform workflow also contains deploy jobs for additional Workers and agents.

## Required remediation

Before using GitHub Actions for a web-only production deploy, create a follow-up PR that either:

1. Re-enables a dedicated manual `sovv-web` workflow that deploys only `apps/web`, or
2. Adds explicit workflow inputs so deploy target selection is manual and scoped, or
3. Splits platform deploys into separate workflows with no automatic all-service deploy on ordinary web merges.

## Required properties of a safe web workflow

- Manual trigger or explicitly scoped trigger.
- Deploys only `apps/web` to `sovv-web`.
- Uses GitHub secrets by name only.
- Runs secret scan, lint, typecheck, Next build, OpenNext build, and Wrangler dry-run before deploy.
- Uses explicit production targeting.
- Does not deploy API, AI, session, control, developer, build-agent, or code-agent Workers.

## Deploy status

Production deploy remains blocked until the active workflow risk is resolved or a safe dedicated web-only workflow is used.
