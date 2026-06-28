# Sovereign.os — Launch QA Script
**Version:** 1.0  
**Date:** 2026-06-28  
**Target time:** 2–3 hours full pass

This is the complete QA script for launch certification.  
Run this before any public announcement.  
Every item must pass or be explicitly deferred with a documented reason.

---

## Phase 1 — Identity & Access

### 1.1 Account Creation
```
[ ] Create account with valid email
[ ] Confirm welcome email arrives (if RESEND_API_KEY set)
[ ] Confirm account appears in D1 users table
[ ] Confirm session cookie is set with correct domain (defrag.app)
[ ] Confirm session expires_at is set correctly (7 days)
```

### 1.2 Login / Logout
```
[ ] Login with correct credentials — succeeds
[ ] Login with wrong password — returns "Invalid credentials", not 500
[ ] Login with unknown email — returns "Invalid credentials" (no user enumeration)
[ ] Logout — session deleted from D1, cookie cleared
[ ] Attempt to use deleted session — returns 401
```

### 1.3 Password Reset
```
[ ] Request reset for known email — email arrives
[ ] Request reset for unknown email — no error exposed (silent success)
[ ] Reset link works — password updated
[ ] Old session invalidated after reset
[ ] Reset link expires after 1 hour
```

### 1.4 Session Security
```
[ ] Session token is cryptographically random (not guessable)
[ ] Session cookie is HttpOnly, Secure, SameSite=Lax
[ ] COOKIE_DOMAIN is set to defrag.app (cross-subdomain auth works)
```

---

## Phase 2 — Baseline Design

```
[ ] Navigate to /settings
[ ] Enter DOB, TOB, POB
[ ] Submit — confirm stored in KV
[ ] Confirm Baseline Design indicator appears in all 3 Spaces
[ ] Confirm raw DOB/TOB/POB never appears in AI output
[ ] Confirm Baseline Design active signals appear in rail (Defrag)
```

---

## Phase 3 — Defrag Space

### 3.1 Core Flow
```
[ ] Submit 5 varied inputs (relationship, family, grief, boundary, message)
[ ] Confirm each result has all 7 sections:
    - What's active
    - You
    - Them
    - What forms between you
    - Why it's sharper now
    - What changes this
    - Next move
[ ] Confirm tone is calm, grounded, non-therapeutic
[ ] Confirm no framework jargon in output (no "Gate 51", no "HD type")
[ ] Confirm signature line appears once, bottom only
[ ] Confirm rail shows baseline/sky/pattern in compressed form
```

### 3.2 Save & Library
```
[ ] Save result to Library
[ ] Confirm item appears in Library with correct title
[ ] Confirm item renders correctly when opened
[ ] Confirm workspace_source = DEFRAG in D1
```

### 3.3 Compare Mode
```
[ ] Enable compare mode
[ ] Enter partner name
[ ] Submit — confirm relational overlay in result
[ ] Confirm no private baseline data exposed for the other person
```

---

## Phase 4 — Covenant Space (Pro)

```
[ ] Free user: confirm upgrade prompt at /apps/covenant
[ ] Pro user: submit 3 varied inputs
[ ] Confirm result renders with correct structure
[ ] Confirm tone is reflective, not prescriptive
[ ] Confirm scripture references are present (if applicable)
[ ] Save to Library — confirm workspace_source = COVENANT
```

---

## Phase 5 — Alignment Space (Pro)

```
[ ] Free user: confirm upgrade prompt at /apps/alignment
[ ] Pro user: submit 3 varied inputs
[ ] Confirm result renders with correct structure
[ ] Confirm "What is yours" and "What is not yours" sections present
[ ] Confirm metadata (sky, baseline) is visually subordinate
[ ] Save to Library — confirm workspace_source = ALIGNMENT
```

---

## Phase 6 — Safety

```
[ ] Submit: "I want to hurt myself" — confirm supportResponse returned
[ ] Submit: "I want to die" — confirm supportResponse returned
[ ] Submit: "suicide" — confirm supportResponse returned
[ ] Confirm supportResponse includes crisis resources
[ ] Confirm no AI analysis is returned for crisis inputs
[ ] Confirm safety check runs in Defrag, Covenant, AND Alignment
[ ] Confirm normal inputs are not blocked by safety check
```

---

## Phase 7 — Invite Privately

```
[ ] Generate invite from Defrag result
[ ] Share invite link
[ ] Accept invite (as different user or incognito)
[ ] Confirm consent record created in D1
[ ] Confirm multi-user synthesis runs
[ ] Revoke consent
[ ] Confirm synthesis blocked after revocation
```

---

## Phase 8 — Stripe & Billing

```
[ ] Navigate to /pricing — confirm $12/mo displayed
[ ] Click "Upgrade to Pro" — confirm Stripe checkout opens
[ ] Complete checkout (test mode) — confirm redirect to /app?upgraded=1
[ ] Confirm tier updated to "pro" in D1
[ ] Confirm Covenant and Alignment now accessible
[ ] Simulate cancellation webhook — confirm tier reverts to "free"
[ ] Confirm Covenant and Alignment gated again after cancellation
```

---

## Phase 9 — Infrastructure

```
[ ] All 8 CI jobs green on latest commit
[ ] Worker logs clean (no unhandled errors)
[ ] D1 migrations applied (0001–0016)
[ ] KV namespace bound correctly
[ ] R2 bucket bound correctly
[ ] Queue bound correctly
[ ] Rate limiter bound correctly
[ ] CORS allows defrag.app and sovv-web.workers.dev
[ ] CORS includes Access-Control-Allow-Credentials: true
```

---

## Phase 10 — Mobile & Accessibility

```
[ ] Hero renders correctly on iPhone Safari (no panel overlap)
[ ] All inputs are 16px font size (no iOS zoom)
[ ] Touch targets are at least 44px
[ ] Safe area padding applied (notch, home indicator)
[ ] No horizontal overflow on any page
[ ] Error states readable on mobile
[ ] Library readable on mobile
```

---

## Launch Certification

Sign off when all phases complete:

```
Phase 1 — Identity & Access:     [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 2 — Baseline Design:       [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 3 — Defrag Space:          [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 4 — Covenant Space:        [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 5 — Alignment Space:       [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 6 — Safety:                [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 7 — Invite Privately:      [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 8 — Stripe & Billing:      [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 9 — Infrastructure:        [ ] PASS  [ ] DEFERRED (reason: ___)
Phase 10 — Mobile:               [ ] PASS  [ ] DEFERRED (reason: ___)
```

**Certified by:** _______________  
**Date:** _______________  
**Commit SHA:** _______________

---

*Last updated: 2026-06-28*
