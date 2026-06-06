# Email Routing Standard

## Domain Status

| Domain | In Cloudflare Account | Email Routing Available |
|---|---|---|
| `defrag.app` | ✅ Yes | ✅ Configure via dashboard |
| `sovereign.os` | ❌ Not in account | ❌ Not available |
| `covenant.app` | ❌ Not in account | ❌ Not available |

**All email must use `defrag.app` until other domains are registered and added to Cloudflare.**

---

## Public Contact Standard

| Address | Purpose | Status |
|---|---|---|
| `info@defrag.app` | Primary public inbox — support, contact, privacy, legal | Required |
| `billing@defrag.app` | Optional billing fallback | Only if operationally needed |
| `security@defrag.app` | Optional security contact | Only if operationally needed |

Do not create or document `privacy@defrag.app`, `legal@defrag.app`, or `covenant.app` addresses. Route all public contact through `info@defrag.app`.

---

## Cloudflare Email Routing Setup (Dashboard Steps)

### Step 1 — Enable Email Routing on defrag.app

1. Cloudflare Dashboard → **Email** → **Email Routing**
2. Select zone: `defrag.app`
3. Click **Get started** or **Enable Email Routing**
4. Cloudflare will add required MX and SPF records automatically

### Step 2 — Add destination address

1. Email Routing → **Destination addresses**
2. Click **Add destination address**
3. Enter the private forwarding email address (do not commit this to the repo)
4. Verify the destination address via the confirmation email Cloudflare sends

### Step 3 — Create routing rule for info@defrag.app

1. Email Routing → **Routing rules**
2. Click **Create address**
3. Custom address: `info`
4. Action: **Send to an email** → select verified destination address
5. Save

### Step 4 — (Optional) Add send_email binding for transactional email

Only after Email Routing destination is verified:

1. Workers → `sovereign-os-api` → Settings → Variables
2. Add binding: Type = **Email**, Name = `EMAIL`, Destination = verified address
3. Update `apps/worker/wrangler.toml`:

```toml
[[send_email]]
name = "EMAIL"
destination_address = "info@defrag.app"
```

4. Redeploy `sovereign-os-api`

### Step 5 — (Optional) Create Email Worker for advanced routing

If routing rules are insufficient, create an Email Worker:

```ts
// apps/worker-email/src/index.ts
export default {
  async email(message, env, ctx) {
    // Route to destination or process
    await message.forward("destination@example.com");
  }
}
```

---

## Transactional Email Implementation

Current implementation uses **Resend API** (`RESEND_API_KEY` in Worker secrets).

**From address:** `Sovereign.os <info@defrag.app>`
**Reply-To:** `info@defrag.app`

The `send_email` binding (Cloudflare Email Workers) is declared in `types-env.ts` as `EMAIL?: SendEmail` but is not yet wired to `wrangler.toml`. It is available for future use once Email Routing destination is verified.

**Priority order for transactional email:**
1. Cloudflare `send_email` binding (preferred — no external dependency)
2. Resend API (current fallback — requires `RESEND_API_KEY` secret)

---

## Future: sovereign.os Email

If `sovereign.os` is registered and added to Cloudflare:
1. Enable Email Routing on `sovereign.os` zone
2. Add `info@sovereign.os` routing rule → same verified destination
3. Update transactional email From to `Sovereign.os <info@sovereign.os>`
4. Keep `info@defrag.app` as a valid alias

Do not configure `sovereign.os` email until the domain is in the Cloudflare account.