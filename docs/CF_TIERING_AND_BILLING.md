# Sovereign.os Tiering and Billing

## Product Tiers

### Free Tier
- **Access**: Basic Defrag space, Baseline Design setup.
- **Limits**: Enforced by KV counters (`FREE_DAILY_LIMIT` = 15).
- **Features**: Active pattern surface, Best Next Response, basic session history.

### Pro Tier
- **Access**: Full access to Defrag, Alignment, and Covenant spaces.
- **Limits**: Unlimited standard sessions.
- **Features**: Full history, Your Story, Compare With Someone, premium media exports, priority processing.

## Implementation Rules

1. **Server-Side Enforcement**: Entitlement checks must happen in the API worker (`apps/worker`), never solely on the client.
2. **Stripe Webhooks**: Subscription status changes are processed via a dedicated Stripe webhook endpoint in the API worker, updating the user's record in D1.
3. **Soft UI Gating**: The frontend can hide or lock features based on a server-provided entitlement flag, but the API must strictly reject unauthorized requests.
4. **Usage Tracking**: Free tier usage increments a KV counter on every successful API completion; if the counter exceeds the limit, the API returns a `429 Too Many Requests` or `402 Payment Required`.
