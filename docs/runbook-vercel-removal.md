# Runbook: Remove Vercel Integration from `defragapp/SOVV`

**Issue:** [#108](https://github.com/defragapp/SOVV/issues/108)  
**Status:** Pending admin action  
**Priority:** Medium — failing Vercel status check blocks PR merges  

---

## Background

`defragapp/SOVV` deploys exclusively through **Cloudflare** (Workers + Pages) and **GitHub Actions**. There are no Vercel config files or workflow steps in the repository. However, a Vercel GitHub App integration was previously connected to the repo, which means Vercel posts a commit-status check on every push/PR. If the Vercel project was deleted or misconfigured, its status check always fails or stays pending — blocking branch-protection rules that require it to pass.

---

## Required Admin Steps

These steps **must be performed by a repository owner or org admin**.

### 1. Disconnect repo from Vercel project

1. Log in to [vercel.com](https://vercel.com) with the account that owns the `defragapp/SOVV` project.
2. Go to **Project → Settings → Git** (or **Integrations**).
3. Under **Connected Git Repository**, click **Disconnect** next to `defragapp/SOVV`.
4. Confirm the disconnection.

> If no matching project exists, the Vercel GitHub App may still be installed on the GitHub account/org; proceed to step 2.

### 2. Remove the Vercel GitHub App from this repo

1. In GitHub, go to **Settings → Integrations → GitHub Apps** (for personal account) or **Organization → Settings → GitHub Apps** (for org).
2. Find **Vercel** in the list.
3. Click **Configure**.
4. Under **Repository access**, remove `defragapp/SOVV` from the allowed list (or uninstall the app entirely if Vercel is not used for any other repo under this account).
5. Save.

### 3. Remove Vercel from required branch-protection status checks

1. In GitHub, go to **Settings → Branches → Branch protection rules** for `main`.
2. Under **Require status checks to pass before merging**, find any check named `Vercel` (may appear as `Vercel – defragapp/SOVV` or similar).
3. Remove it from the required checks list.
4. Save changes.

### 4. Verify Cloudflare checks are the source of truth

After removing Vercel, confirm the following checks are still **required** (and passing) for `main`:

| Check name | Source |
|---|---|
| `Deploy API Worker` | `.github/workflows/deploy.yml` |
| `TypeScript Check + Tests` | `.github/workflows/deploy.yml` |
| `Deploy Web App (sovv-web)` | `.github/workflows/deploy.yml` |

Adjust required-checks list as needed.

---

## Verification

After completing the steps above:

1. Open a test PR against `main`.
2. Confirm no Vercel status checks appear on the PR.
3. Confirm the GitHub Actions `deploy.yml` checks run and pass.
4. Close this issue once verified.

---

## Code-side cleanup (already done)

- Verified no `vercel.json`, `.vercelignore`, or Vercel-specific env vars exist in the repo.
- `deploy.yml` workflow does not reference Vercel.
- No Vercel npm packages in any `package.json`.
