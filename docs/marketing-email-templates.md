# Marketing Email Templates

## Standard

- **From:** `Sovereign.os <info@defrag.app>`
- **Reply-To:** `info@defrag.app`
- **Contact:** `info@defrag.app`

When `sovereign.os` Email Routing is active, update From/Reply-To to `info@sovereign.os`.

Marketing emails are not yet implemented as automated sends. This document defines the approved templates for future use.

---

## Templates

### 1. Onboarding — Baseline Design Reminder

**Subject:** `Your Baseline Design is waiting — Sovereign.os`

**Trigger:** User registered but has not set Baseline Design after 24 hours

**Body:**
```
You signed up for Sovereign.os.

Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center.

Without it, the thread has no ground to stand on.

It takes about 2 minutes to set.

[Start Your Baseline Design] → https://app.defrag.app/settings

Questions? info@defrag.app
```

---

### 2. Re-engagement — Return to Your Space

**Subject:** `Your space is still here — Sovereign.os`

**Trigger:** User has not logged in for 14+ days (future automation)

**Body:**
```
Your Baseline Design and saved history are still here.

Defrag helps you understand what is active in the moment — before you send the message, when the conversation keeps repeating, when you need to see the pattern clearly.

[Return to your space] → https://app.defrag.app/apps/defrag

Questions? info@defrag.app
```

---

### 3. Upgrade Prompt — Session Limit Reached

**Subject:** `You've reached today's limit — Sovereign.os`

**Trigger:** User hits free tier session limit (currently handled in-app; email is future)

**Body:**
```
You've used your free sessions for today.

Pro keeps the thread going — unlimited sessions, Your Story, Compare With Someone, Try It Out, and the Covenant reflection space.

[Upgrade to Pro] → https://app.defrag.app/login

Questions? info@defrag.app
```

---

## Implementation Notes

Marketing emails are not yet wired to an automated send path. When implementing:

1. Use the same `sendEmail()` function in `apps/worker/src/email.ts`
2. Queue marketing email jobs via `PATTERN_QUEUE` or a dedicated marketing queue
3. Process in a queue consumer — do not send synchronously from request handlers
4. Respect unsubscribe preferences — add `List-Unsubscribe` header
5. Do not send marketing email to users who have not opted in

---

## Language Rules for All Marketing Email

- Use "Defrag" not "DEFRAG" in body copy
- Use "Baseline Design" not "baseline" or "Your Baseline"
- Use "your space" not "workspace" or "Workbench"
- Use "Defrag helps you understand what is active in the moment" not "got lit up"
- Do not make claims about outcomes, accuracy, or clinical standing
- Do not use therapy, diagnosis, or guarantee language
- Keep tone: calm, direct, restrained, product-led