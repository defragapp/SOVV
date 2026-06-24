# Sovereign.os Billing and Gating Plan

## 1. D1 System of Record
All subscription entitlement data (plan type, active status, period end dates) must be stored in the `vibesdk-db` D1 database.

## 2. Stripe Webhooks
The `apps/worker` must implement a robust Stripe webhook handler at `/api/billing/webhook`. This handler will be responsible for securely verifying Stripe signatures and updating the corresponding user records in D1 when subscription events occur (e.g., `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).

## 3. Server-Side Enforcement
All premium routes (e.g., Covenant space, exports, unlimited history) must perform a server-side check against the user's D1 record before processing the request. Client-side state is for UI presentation only and cannot be trusted for access control.

## 4. Free Tier Usage Tracking
For free tier users, usage limits (e.g., 15 sessions/day) will be tracked using Cloudflare KV. The `SOVV_DATA` KV namespace will store daily counters per user. Before processing a free-tier request, the API must verify the counter is below the limit.
