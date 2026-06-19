# sovereign-control

Private operator control plane for Sovereign.os.

Protected by Cloudflare Access at operator.defrag.app.

## Architecture

- Role-gated action system (viewer / operator / deployer / admin)
- Structured audit log for every write/deploy action
- Browser Run integration points (prepared, not faked)
- AI Gateway routing prepared

## Local development

```bash
npm install
npm run dev
```

## Deployment

Deployed via GitHub Actions. Requires Cloudflare Access policy on operator.defrag.app.

## Security

- Never accepts credentials from request body
- All CF API calls use bound Worker secrets
- CORS restricted to operator origins only
- Every mutating action requires role check + confirm + audit log
