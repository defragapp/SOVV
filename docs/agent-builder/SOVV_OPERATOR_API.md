# SOVV Operator API

Initial read-only facade for the SOVV Business Operator workflow.

Created endpoints:

- `GET /health`
- `POST /state/audit`
- `POST /github/repo-audit`
- `POST /cloudflare/audit`
- `POST /stripe/audit`

This first version intentionally has no deploy, merge, delete, DNS edit, Stripe edit, branch creation, file write, or production mutation route.

Agent Builder should connect to the deployed Worker using the OpenAPI file in this folder.

Next phase after read-only verification: add a branch-and-PR-only repository write path.
