# Browser Instructions — Remaining Manual Tasks

These tasks cannot be completed via API and require browser access.
All steps below are free unless noted.

---

## Task 1: Enable Bot Fight Mode — FREE, 2 min
**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/security/bots

1. Go to Security → Bots
2. Toggle **Bot Fight Mode** ON
3. Save

Blocks known scrapers and bots from hitting your Workers at no cost.

---

## Task 2: Set Up Cloudflare Email Alerts — FREE, 5 min
**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/notifications

Create three alerts (click Add for each):

**Alert 1 — Workers Error Rate**
- Product: Workers
- Event: Error Rate
- Threshold: >1% in 5 minutes
- Notify: info@defrag.app

**Alert 2 — Workers CPU Time**
- Product: Workers
- Event: CPU Time p99
- Threshold: >50ms
- Notify: info@defrag.app

**Alert 3 — Health Check Failure**
- Product: Health Checks
- Event: Health Check Status
- Notify: info@defrag.app

---

## Task 3: Verify Stripe Tax CA Nexus — FREE, 5 min
**URL:** https://dashboard.stripe.com/tax/registrations

Stripe Tax is already active. Head office: Rancho Cucamonga, CA 91739.

1. Go to the URL above
2. Verify California is listed as a tax registration
3. If not listed: click **Add registration** → United States → California
4. Set registration date to your business start date

Note: SaaS subscriptions may be exempt from CA sales tax — consult a tax professional.
Current tax code `txcd_10000000` (General - Electronically Supplied Services) is correct for SaaS.

---

## Task 4: Visual Checkout Test — FREE, 3 min
**URL:** https://defrag.app/pricing

1. Open the pricing page
2. Click **Upgrade to Pro**
3. Verify the Stripe checkout page shows:
   - ✅ "Sovereign.os" as business name
   - ✅ DEFRAG Pro product
   - ✅ $20.00/month price
   - ✅ 7-day trial option
   - ✅ Tax calculation shown
4. Do NOT complete payment — just verify the UI

---

## Task 5: Upgrade Cloudflare Zone to Pro — $20/mo (when ready)
**URL:** https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/plan

1. Click **Change Plan**
2. Select **Pro** ($20/month)
3. Confirm billing

After upgrading, configure cache rules at:
https://dash.cloudflare.com/8b1954d216d65077c6480d62583fe2c2/defrag.app/caching/cache-rules

**Rule 1 — App shell (no cache):**
- When: Hostname = `app.defrag.app` OR `sovereign.defrag.app`
- Then: Cache Status = Bypass

**Rule 2 — Static assets (immutable):**
- When: URI Path starts with `/_next/static/`
- Then: Cache Everything, Edge TTL = 1 year, Browser TTL = 1 year

**Rule 3 — Marketing pages (short cache):**
- When: Hostname = `defrag.app` AND URI Path does not start with `/api/`
- Then: Cache Everything, Edge TTL = 5 minutes, Browser TTL = 0

Not blocking launch — do within first week of revenue.