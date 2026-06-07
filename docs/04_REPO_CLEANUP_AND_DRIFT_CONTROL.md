# Repo Cleanup and Drift Control

## Files Removed in Realignment (2026-06-06)

The following files were removed from git tracking and added to `.gitignore`:

### Sensitive / Operational Files
| File | Reason |
|---|---|
| `cookies.txt` | Session cookie dump — credentials |
| `apps/worker/cookies.txt` | Session cookie dump — credentials |
| `apps/worker/login.log` | Runtime log |
| `apps/worker/login.pid` | Process ID file |
| `apps/worker/wrangler.log` | Wrangler runtime log |
| `cf_audit.txt` | Cloudflare audit output |
| `fix_billing.js` | Ad-hoc script |
| `update_index.js` | Ad-hoc script |
| `tatus` | Mistyped `git status` output |
| `deploy-worker.yml` | Misplaced workflow file |
| `apps/worker/src/deploy.yml` | Misplaced workflow file |
| `apps/worker/src/deploy-worker.yml` | Misplaced workflow file |

**⚠️ ACTION REQUIRED**: Rotate any session tokens that were present in `cookies.txt` files.

### Stale App Files
| File | Reason |
|---|---|
| `apps/web/src/` (entire directory) | Duplicate app root — stale scaffold |
| `apps/web/wrangler.old.json` | Legacy Cloudflare Pages config |
| `apps/web/tailwind.config.js` | Duplicate — `.ts` version is correct |
| `apps/web/app/todo.md` | Operational file inside app directory |

### Rogue Workflows
| File | Reason |
|---|---|
| `.github/workflows/fix-lockfile.yml` | Auto-committed to all branches on every push |
| `.github/workflows/deploy-live.yml` | Deprecated — replaced by Cloudflare Workers Builds |

---

## Drift Prevention Rules

### Files That Must Never Be Committed
```
cookies.txt
apps/worker/cookies.txt
apps/worker/login.log
apps/worker/login.pid
apps/worker/wrangler.log
*.log
*.pid
cf_audit.txt
fix_billing.js
update_index.js
tatus
deploy-worker.yml
apps/worker/src/deploy.yml
apps/worker/src/deploy-worker.yml
apps/web/wrangler.old.json
apps/web/tailwind.config.js
apps/web/src/
apps/web/app/todo.md
```

All of the above are in `.gitignore`.

### Build Artifacts That Must Not Be Committed
```
apps/web/.open-next/          ← gitignored at root
apps/web/.next/               ← gitignored at root
apps/worker/index.js          ← gitignored
apps/worker/index.js.map      ← gitignored
apps/worker/src/*.js.map      ← gitignored
apps/worker/src/*.d.ts.map    ← gitignored
```

### The One App Root Rule
`apps/web/app/` is the **only** Next.js app root. `apps/web/src/` must not exist.
If `apps/web/src/` reappears, delete it immediately.

---

## Periodic Drift Checks

Run these checks before any release:

```bash
# Check for sensitive files
git ls-files | grep -E "cookies\.txt|\.log$|\.pid$|wrangler\.log"

# Check for duplicate app root
ls apps/web/src/ 2>/dev/null && echo "ERROR: src/ exists — delete it"

# Check for stale configs
ls apps/web/wrangler.old.json 2>/dev/null && echo "ERROR: wrangler.old.json exists"

# Check for DEFRAG in body copy (should only appear in titles/headers)
grep -rn '"DEFRAG' apps/web/app/ apps/web/components/ apps/web/data/ | grep -v "title\|metadata\|eyebrow\|header\|logo\|SOVEREIGN"

# Check for Workbench in user-facing copy
grep -rn "Workbench\|WORKBENCH" apps/web/app/ apps/web/components/

# Check for "workspace" where "space" is required
grep -rn "ENTER WORKBENCH\|Enter Workspace\|Open Workspace\|Go to Workspace" apps/web/
```

---

## Branch Policy

| Branch | Purpose | Deploy |
|---|---|---|
| `main` | Production | Cloudflare Workers Builds (auto) |
| `feat/*` | Feature work | Preview only |
| `codespace-*` | Codespace saves | Do not merge directly — review first |

### Branches Requiring Review Before Merge
- `feat/host-routing` — routing concept is valid but destination mapping conflicts with platform hierarchy. Must be updated before merge.
- `feat/api-wireup` — contains API wireup work. Review for naming compliance before merge.
- `codespace-expert-umbrella-*` — emergency saves. Cherry-pick useful commits only.
- `codespace-symmetrical-meme-*` — emergency saves. Cherry-pick useful commits only.