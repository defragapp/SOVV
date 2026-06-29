# Deployment Targets

SOVV is deployed through Cloudflare Workers, Cloudflare Pages/OpenNext, and GitHub Actions.

Vercel is not a deployment target for this repository.

## Expected deployment surfaces

- `apps/worker` -> Cloudflare Worker API
- `apps/worker-ai` -> Cloudflare Worker AI service
- `apps/worker-session` -> Cloudflare Worker + Durable Objects
- `apps/web` -> OpenNext on Cloudflare Workers
- GitHub Actions -> deployment orchestration

## Vercel removal checklist

Because repo search has no `vercel` or `Vercel` config references, any Vercel status checks are coming from an external integration rather than code in this repository.

Remove Vercel as follows:

1. In Vercel, disconnect the GitHub project linked to `defragapp/SOVV`.
2. In GitHub repository settings, remove the Vercel GitHub App if it is installed only for this repo.
3. In branch protection rules, remove `Vercel` from required status checks.
4. Keep Cloudflare/GitHub checks as the source of truth.

## Branch protection expectation

Required checks should represent the Cloudflare deployment pipeline only:

- TypeScript check
- Worker tests
- Web build / OpenNext build
- Cloudflare deploy checks
- Post-deploy smoke checks
