# Browser Instructions for Remaining Manual Tasks

These are the only tasks that cannot be completed via API and require browser access.
Copy each prompt block and paste it into the relevant browser session.

---

## Task 1: Upgrade Cloudflare Zone to Pro Plan

**Why:** The Free plan has no custom cache rules, no zone-level rate limiting, and no Argo Smart Routing. For launch traffic, the Pro plan ($20/mo) unlocks these critical features.

**URL to open:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/plan

**Steps:**
1. Go to the URL above (Cloudflare Dashboard → defrag.app → Overview → Plan)
2. Click **"Change Plan"**
3. Select **"Pro"** ($20/month)
4. Confirm billing

**After upgrading, configure these cache rules:**

Go to: https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/caching/cache-rules

Create Rule 1 — **Bypass cache for app shell:**
- Name: `App shell - no cache`
- When: `Hostname equals app.defrag.app OR Hostname equals sovereign.defrag.app`
- Then: Cache Status = **Bypass**

Create Rule 2 — **Cache static assets aggressively:**
- Name: `Static assets - immutable`
- When: `URI Path starts with /_next/static/`
- Then: Cache Status = **Cache Everything**, Edge TTL = **1 year**, Browser TTL = **1 year**

Create Rule 3 — **Cache marketing pages:**
- Name: `Marketing pages - short cache`
- When: `Hostname equals defrag.app AND URI Path does not start with /api/`
- Then: Cache Status = **Cache Everything**, Edge TTL = **5 minutes**, Browser TTL = **0**

---

## Task 2: Enable Cloudflare Bot Fight Mode

**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/security/bots

**Steps:**
1. Go to Security → Bots
2. Enable **"Bot Fight Mode"** (free, available on all plans)
3. This blocks known bad bots from hitting your Workers

---

## Task 3: Configure Cloudflare Rate Limiting (Pro plan required)

**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/security/waf/rate-limiting-rules

Create Rule — **API rate limit:**
- Name: `API rate limit`
- When: `URI Path starts with /api/`
- Rate: **100 requests per 60 seconds** per IP
- Action: **Block** for 60 seconds

---

## Task 4: Verify Stripe Tax Nexus (US — California)

**URL:** https://dashboard.stripe.com/tax/registrations

**Current status:** Stripe Tax is active, head office set to Rancho Cucamonga, CA 91739.

**Steps:**
1. Go to the URL above
2. Verify California is listed as a tax registration (you are based in CA — you likely have nexus)
3. If not listed, click **"Add registration"** → United States → California
4. Set the registration date to your business start date
5. Stripe will automatically collect and remit CA sales tax on subscriptions

**Note:** SaaS/software subscriptions may be exempt from sales tax in California — consult a tax professional to confirm. Stripe Tax code `txcd_10000000` (General - Electronically Supplied Services) is currently set, which is correct for SaaS.

---

## Task 5: Run Live Checkout Test

**URL:** https://checkout.stripe.com/c/pay/cs_live_b1IEJ3CYOiTSYz1JNpURPrUzgZAIjG2mqM4AqnBjSVi1ug1MDswjb2urTn

A live checkout session was created during the audit. You can use this URL to verify the full checkout flow visually. **Do not complete payment** — just verify the page loads correctly with:
- ✅ "Sovereign.os" as the business name
- ✅ DEFRAG Pro product shown
- ✅ $20.00/month price
- ✅ 7-day trial option visible
- ✅ Automatic tax calculation shown

---

## Task 6: Set Up Cloudflare Email Alerts

**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/notifications

**Steps:**
1. Go to Notifications
2. Click **"Add"**
3. Create alerts for:
   - **Workers Error Rate** — threshold: >1% errors in 5 minutes → email info@defrag.app
   - **Workers CPU Time** — threshold: >50ms p99 → email info@defrag.app
   - **D1 Query Errors** — any errors → email info@defrag.app

These are free and require no plan upgrade.