/**
 * Entitlements — tier-aware access control for Sovereign.os pro spaces.
 *
 * Tier hierarchy:
 *   free       → Defrag space only (free daily limit applies)
 *   alignment  → Defrag + Alignment (monthly subscription)
 *   covenant   → Defrag + Alignment + Covenant (higher-tier subscription)
 *   pro        → legacy alias for "covenant" tier (full access)
 *
 * Environment requirements:
 *   STRIPE_ALIGNMENT_PRICE_ID — Stripe price ID for the Alignment tier plan.
 *   STRIPE_COVENANT_PRICE_ID  — Stripe price ID for the Covenant tier plan.
 *   STRIPE_PRICE_ID           — Legacy / default price ID (falls back for "pro").
 *
 * Usage:
 *   const check = checkEntitlement(user, "covenant");
 *   if (!check.allowed) return check.response;
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type Tier = "free" | "alignment" | "covenant" | "pro";

export type Space = "defrag" | "alignment" | "covenant";

/** Minimal user shape required for entitlement checks. */
export interface EntitlementUser {
  id: string;
  tier: string;
  subscription_status: string;
}

export interface EntitlementResult {
  allowed: true;
}

export interface EntitlementDenied {
  allowed: false;
  status: 401 | 402;
  code: "unauthorized" | "payment_required";
  message: string;
  upgradeUrl?: string;
  response: Response;
}

export type EntitlementCheck = EntitlementResult | EntitlementDenied;

// ── Constants ─────────────────────────────────────────────────────────────────

/** Spaces each tier grants access to. */
const TIER_SPACES: Record<Tier, Space[]> = {
  free:      ["defrag"],
  alignment: ["defrag", "alignment"],
  covenant:  ["defrag", "alignment", "covenant"],
  pro:       ["defrag", "alignment", "covenant"], // legacy alias
};

/** Routes that require a specific space to be unlocked. */
export const SPACE_ROUTE_PREFIXES: Record<Space, string[]> = {
  defrag:    ["/api/explain", "/api/patterns", "/api/history", "/api/chips"],
  alignment: ["/api/alignment"],
  covenant:  ["/api/covenant"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeTier(tier: string): Tier {
  const t = tier?.toLowerCase() as Tier;
  return TIER_SPACES[t] ? t : "free";
}

function isActive(status: string): boolean {
  return status === "active" || status === "trialing";
}

function canAccessSpace(user: EntitlementUser, space: Space): boolean {
  if (space === "defrag") return true; // defrag is always free
  const tier = normalizeTier(user.tier);
  if (!isActive(user.subscription_status) && tier !== "free") {
    // subscription exists but not active (past_due, canceled, etc.)
    return false;
  }
  return TIER_SPACES[tier].includes(space);
}

function spaceForPath(pathname: string): Space | null {
  for (const [space, prefixes] of Object.entries(SPACE_ROUTE_PREFIXES) as [Space, string[]][]) {
    if (prefixes.some((p) => pathname.startsWith(p))) return space;
  }
  return null;
}

function upgradeMessage(space: Space): string {
  if (space === "alignment") {
    return "The Alignment space requires an Alignment or Covenant subscription.";
  }
  return "The Covenant space requires a Covenant subscription.";
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Checks whether `user` is entitled to access `space`.
 *
 * Returns `{ allowed: true }` on success, or an `EntitlementDenied` object
 * with a pre-built `Response` (401/402) that can be returned directly.
 */
export function checkEntitlement(
  user: EntitlementUser | null,
  space: Space,
  appUrl?: string
): EntitlementCheck {
  if (!user) {
    const response = new Response(
      JSON.stringify({ error: "unauthorized", message: "Authentication required." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
    return { allowed: false, status: 401, code: "unauthorized", message: "Authentication required.", response };
  }

  if (!canAccessSpace(user, space)) {
    const message = upgradeMessage(space);
    const upgradeUrl = appUrl ? `${appUrl}/pricing` : undefined;
    const response = new Response(
      JSON.stringify({ error: "payment_required", message, ...(upgradeUrl ? { upgradeUrl } : {}) }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
    return { allowed: false, status: 402, code: "payment_required", message, upgradeUrl, response };
  }

  return { allowed: true };
}

/**
 * Convenience: infers the required space from the request path and checks
 * entitlement.  Returns `null` if the path is not a protected space route
 * (i.e. the route is publicly accessible and no check is needed).
 */
export function checkEntitlementForRequest(
  user: EntitlementUser | null,
  request: Request,
  appUrl?: string
): EntitlementCheck | null {
  const space = spaceForPath(new URL(request.url).pathname);
  if (!space || space === "defrag") return null; // free route — no check needed
  return checkEntitlement(user, space, appUrl);
}

/**
 * Returns the Stripe price ID to use for a given target tier.
 * Falls back to STRIPE_PRICE_ID (legacy) if tier-specific IDs are not set.
 */
export function priceIdForTier(
  tier: "alignment" | "covenant",
  env: {
    STRIPE_ALIGNMENT_PRICE_ID?: string;
    STRIPE_COVENANT_PRICE_ID?: string;
    STRIPE_PRICE_ID?: string;
  }
): string | undefined {
  if (tier === "alignment") {
    return env.STRIPE_ALIGNMENT_PRICE_ID ?? env.STRIPE_PRICE_ID;
  }
  return env.STRIPE_COVENANT_PRICE_ID ?? env.STRIPE_PRICE_ID;
}
