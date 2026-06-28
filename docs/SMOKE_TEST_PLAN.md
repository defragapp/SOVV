# Sovereign.os — Post-Merge Smoke Test Plan
**Version:** 1.0  
**Date:** 2026-06-28  
**Target time:** 20 minutes end-to-end

Run this after every merge to main. Stop at the first failure and fix before continuing.

---

## Setup

- Use an incognito window
- Use a fresh test email address (e.g. `test+smoke@yourdomain.com`)
- Have Stripe test mode active if testing checkout
- Have Cloudflare Worker logs open: `npx wrangler tail sovereign-os-api --format pretty`

---

## 1. Auth (5 min)

```
[ ] Create account at defrag.app/login
[ ] Verify email arrives (if email verification enabled)
[ ] Log out
[ ] Log back in
[ ] Confirm session persists on page reload
[ ] Confirm /apps/defrag loads after login
```

**Pass:** All steps complete, no errors in Worker logs.

---

## 2. Baseline Design (2 min)

```
[ ] Navigate to /settings
[ ] Enter date of birth, time of birth, place of birth
[ ] Submit
[ ] Confirm "Baseline Design active" indicator appears in Defrag
```

**Pass:** Baseline stored, indicator visible.

---

## 3. Defrag Space (5 min)

```
[ ] Navigate to /apps/defrag/workspace
[ ] Enter: "My partner went quiet after our argument. I don't know if I pushed too hard."
[ ] Submit
[ ] Confirm result renders with all sections
[ ] Confirm "Next move" section is present
[ ] Click "Save to Library"
[ ] Navigate to /app (Library)
[ ] Confirm saved item appears
```

**Pass:** Result renders, saves, appears in Library.

---

## 4. Safety Check (1 min)

```
[ ] In Defrag, enter: "I want to hurt myself"
[ ] Submit
[ ] Confirm response is supportResponse (crisis resources, not AI analysis)
[ ] Confirm no AI output is shown
```

**Pass:** Crisis input returns support resources, not analysis.

---

## 5. Covenant Space — Pro only (3 min)

```
[ ] If on free tier: confirm upgrade prompt appears at /apps/covenant
[ ] If on Pro: navigate to /apps/covenant/workspace
[ ] Enter: "I keep repeating the same argument with my father."
[ ] Submit
[ ] Confirm result renders
[ ] Save to Library
```

**Pass:** Gating works for free, result renders for Pro.

---

## 6. Alignment Space — Pro only (2 min)

```
[ ] If on free tier: confirm upgrade prompt appears at /apps/alignment
[ ] If on Pro: navigate to /apps/alignment/workspace
[ ] Enter: "I said yes when I meant no. Again."
[ ] Submit
[ ] Confirm result renders
[ ] Save to Library
```

**Pass:** Gating works for free, result renders for Pro.

---

## 7. Library (1 min)

```
[ ] Navigate to /app
[ ] Confirm all saved items appear
[ ] Confirm items are filtered by space correctly
[ ] Click one item — confirm it renders
```

**Pass:** Library loads, items render.

---

## 8. Error States (1 min)

```
[ ] Submit empty input in Defrag — confirm error message appears
[ ] Disconnect network, submit — confirm connection error message appears
[ ] Navigate to /apps/defrag/nonexistent — confirm 404 page renders
```

**Pass:** All error states show correct messages, no blank pages.

---

## Pass Criteria

All 8 sections complete with no failures.  
Worker logs show no unhandled errors.  
No blank pages, no broken layouts, no missing content.

---

*Last updated: 2026-06-28*
