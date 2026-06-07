# Email Routing Standard

## Domain Status

| Domain | In Cloudflare Account | Email Routing Available |
|---|---|---|
| `defrag.app` | ✅ Yes | ✅ Configure via dashboard |
| `sovereign.os` | ❌ Not in account | ❌ Not available until domain is registered and zone added |
| `covenant.app` | ❌ Not in account | ❌ Not available — do not configure |

**All email must use `defrag.app` until `sovereign.os` is registered and added to Cloudflare.**

---

## Cloudflare send_email Binding — Constraints

Per Cloudflare documentation:

- `send_email` bindings require **Email Routing to be enabled** on the sending domain.
- The **destination address must be verified** before the binding can be used.
- The **sender address must be from the domain where Email Routing is active** (e.g., `info@defrag.app` requires Email Routing active on `defrag.app`).
- You cannot send from an unverified or unconfigured domain.
- The binding is declared in `wrangler.toml` as `[[send_email]]` with `name` and `destination_address`.
- Do not add the binding until Email Routing is enabled and the destination is verified.

---

## Public Contact Standard

| Address | Purpose | Status |
|---|---|---|
| `info@defrag.app` | Primary public inbox — all support, contact, privacy, legal | ✅ Required |
| `info@sovereign.os` | Preferred platform sender when sovereign.os zone is active | ⏳ Future only |
| `billing@defrag.app` | Optional billing fallback | Only if operationally needed |
| `security@defrag.app` | Optional security contact | Only if operationally needed |

**Do not create or document** `privacy@defrag.app`, `legal@defrag.app`, `support@defrag.app`, `admin@defrag.app`, `hello@defrag.app`, or `info@covenant.app`. Route all public contact through `info@defrag.app`.

---

## Cloudflare Email Routing Setup — Dashboard Steps

### Step 1 — Enable Email Routing on defrag.app

1. Cloudflare Dashboard → **Email** → **Email Routing**
2. Select zone: `defrag.app`
3. Click **Get started** or **Enable Email Routing**
4. Cloudflare will automatically add required MX and SPF/DMARC records
5. Verify the DNS records are active before proceeding

### Step 2 — Add and verify destination address

1. Email Routing → **Destination addresses**
2. Click **Add destination address**
3. Enter the private forwarding email address (do **not** commit this to the repo)
4. Cloudflare sends a verification email — click the link to verify
5. Status must show **Verified** before proceeding to Step 3

### Step 3 — Create routing rule for info@defrag.app

1. Email Routing → **Routing rules**
2. Click **Create address**
3. Custom address: `info`
4. Action: **Send to an email** → select verified destination address
5. Save and confirm rule is active

### Step 4 — (Optional) Bind Email Worker for inbound handling

If you need custom inbound logic (auto-reply, queue notification, routing):

1. Create `apps/worker-email/src/index.ts` with an `email` handler
2. Deploy as a separate Worker or add to `sovereign-os-api`
3. In Email Routing → Routing rules → set action to **Send to a Worker**
4. Select the deployed Worker

**Cloudflare constraint:** The Email Worker receives inbound messages. It can forward them (`message.forward()`), reply, or queue a job. It cannot send outbound email to arbitrary addresses without a verified `send_email` binding.

### Step 5 — Add send_email binding (after Step 2 is complete)

Only after Email Routing destination is verified:

Add to `apps/worker/wrangler.toml`:
```toml
[[send_email]]
name = "EMAIL"
destination_address = "info@defrag.app"
```

Then redeploy `sovereign-os-api`:
```bash
cd apps/worker && wrangler deploy
```

**Cloudflare constraint:** The `destination_address` in `[[send_email]]` must match a verified destination address in Email Routing. The sender (`From:`) must be from the domain where Email Routing is active (`defrag.app`).

### Step 6 — (Future) sovereign.os Email Routing

Only when `sovereign.os` is registered and added to Cloudflare:

1. Enable Email Routing on `sovereign.os` zone
2. Add `info@sovereign.os` routing rule → same verified destination
3. Update transactional email `From` to `Sovereign.os <info@sovereign.os>`
4. Keep `info@defrag.app` as a valid alias
5. Add `[[send_email]]` binding for `sovereign.os` sender

**Do not configure sovereign.os email until the domain is in the Cloudflare account.**

---

## Transactional Email Implementation

Current implementation: `apps/worker/src/email.ts`

**Delivery path (priority order):**
1. Cloudflare `send_email` binding (`env.EMAIL`) — preferred, pending Email Routing setup
2. Resend API (`env.RESEND_API_KEY`) — current active fallback

**From:** `Sovereign.os <info@defrag.app>`
**Reply-To:** `info@defrag.app`

When `sovereign.os` Email Routing is active:
**From:** `Sovereign.os <info@sovereign.os>`
**Reply-To:** `info@sovereign.os`

---

## Inbound Auto-Response Constraint

Cloudflare Email Workers can receive inbound email and forward it. However:

- **Outbound auto-reply** from an Email Worker requires a verified `send_email` binding.
- The binding sender must be from the Email Routing-active domain.
- If `send_email` binding is not yet configured, auto-reply is **not possible** with Cloudflare native tooling alone.
- **Workaround:** Queue an inbound notification job via `PATTERN_QUEUE` and process it in the queue consumer, which can call Resend API as a fallback.

Document this blocker clearly: auto-reply to `info@defrag.app` inbound messages requires completing Steps 1–5 above before it can be implemented natively.

---

## Drift Prevention

```bash
# Verify no extra role inboxes in user-facing copy
grep -rn "privacy@\|legal@\|support@defrag\|admin@defrag\|hello@defrag\|billing@defrag\|security@defrag" \
  apps/web/app/ apps/web/components/ apps/worker/src/ \
  | grep -v "node_modules\|# Future\|optional future\|email-routing-standard\|contact-and-email\|05_PRODUCT\|03_AI"
```

Expected result: zero matches.