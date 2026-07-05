/**
 * entitlements.ts
 *
 * Server-authoritative entitlement resolution for Sovereign.os.
 *
 * Single source of truth for what a user can access based on their
 * subscription_status, tier, and role. All product routes must use
 * resolveEntitlements() instead of raw subscription_status checks.
 *
 * Stripe subscription lifecycle states handled:
 *   active       → full Pro access
 *   trialing     → full Pro access (trial period)
 *   past_due     → Pro access with grace period (72h after period_end)
 *   unpaid       → Pro access with grace period (72h after period_end)
 *   canceled     → free tier only
 *   incomplete   → free tier only (payment never completed)
 *   incomplete_expired → free tier only
 *   free         → free tier (no Stripe subscription)
 *
 * Manual/promo access:
 *   tier = "pro" with subscription_status = "free" → manual grant (admin override)
 *   role = "admin" → full access to everything
 */

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "free";

export type UserTier = "free" | "pro";
export type UserRole = "user" | "admin";

export interface EntitlementUser {
  id: string;
  tier: UserTier;
  role?: UserRole;
  subscription_status: string;
  subscription_current_period_end?: number | null;
  email_verified?: number | null;
}

export interface Entitlements {
  /** Can access Defrag space (free + pro) */
  canUseDefrag: boolean;
  /** Can access Covenant space (pro only) */
  canUseCovenant: boolean;
  /** Can access Alignment space (pro only) */
  canUseAlignment: boolean;
  /** Can save results to Library (pro only) */
  canUseLibrary: boolean;
  /** Can use Audio Overview (pro only) */
  canUseAudio: boolean;
  /** Can send invites (pro only) */
  canInvite: boolean;
  /** Is on a paid/active plan (active or trialing) */
  isActivePro: boolean;
  /** Is in grace period (past_due/unpaid within 72h of period_end) */
  isInGracePeriod: boolean;
  /** Is on manual/promo Pro grant */
  isManualPro: boolean;
  /** Is admin role */
  isAdmin: boolean;
  /** Effective tier for display */
  effectiveTier: UserTier;
  /** Reason for denial if not pro (for error messages) */
  denyReason: "not_subscribed" | "subscription_canceled" | "payment_failed" | "grace_expired" | null;
}

const GRACE_PERIOD_SECONDS = 72 * 60 * 60; // 72 hours

/**
 * Resolve full entitlements for a user.
 * Call this once per request and pass the result to all gate checks.
 */
export function resolveEntitlements(user: EntitlementUser): Entitlements {
  const isAdmin = user.role === "admin";
  const status = (user.subscription_status ?? "free") as SubscriptionStatus;
  const now = Math.floor(Date.now() / 1000);
  const periodEnd = user.subscription_current_period_end ?? 0;

  // Admin gets everything
  if (isAdmin) {
    return fullAccess(true, false, false, true);
  }

  // Unverified email: allow Defrag (free) but block Pro features
  // This prevents unverified accounts from accessing paid features
  // and ensures transactional emails (billing, password reset) are deliverable.
  const emailVerified = (user.email_verified ?? 0) === 1;

  // Active subscription
  if (status === "active") {
    if (!emailVerified) return freeOnly("not_subscribed");
    return fullAccess(false, false, false, false);
  }

  // Trial — full Pro access
  if (status === "trialing") {
    if (!emailVerified) return freeOnly("not_subscribed");
    return fullAccess(false, false, false, false);
  }

  // Past due or unpaid — check grace period
  if (status === "past_due" || status === "unpaid") {
    if (!emailVerified) return freeOnly("not_subscribed");
    const inGrace = periodEnd > 0 && now < periodEnd + GRACE_PERIOD_SECONDS;
    if (inGrace) {
      return fullAccess(false, true, false, false);
    }
    // Grace expired
    return freeOnly("grace_expired");
  }

  // Manual Pro grant: tier=pro but status=free (admin override / promo)
  if (user.tier === "pro" && status === "free") {
    if (!emailVerified) return freeOnly("not_subscribed");
    return fullAccess(false, false, true, false);
  }

  // Canceled, incomplete, incomplete_expired, or free
  if (status === "canceled") {
    return freeOnly("subscription_canceled");
  }

  if (status === "incomplete" || status === "incomplete_expired") {
    return freeOnly("not_subscribed");
  }

  // Default: free
  return freeOnly("not_subscribed");
}

function fullAccess(
  isAdmin: boolean,
  isInGracePeriod: boolean,
  isManualPro: boolean,
  adminRole: boolean
): Entitlements {
  return {
    canUseDefrag: true,
    canUseCovenant: true,
    canUseAlignment: true,
    canUseLibrary: true,
    canUseAudio: true,
    canInvite: true,
    isActivePro: !isInGracePeriod && !isManualPro,
    isInGracePeriod,
    isManualPro,
    isAdmin: adminRole,
    effectiveTier: "pro",
    denyReason: null,
  };
}

function freeOnly(reason: Entitlements["denyReason"]): Entitlements {
  return {
    canUseDefrag: true,
    canUseCovenant: false,
    canUseAlignment: false,
    canUseLibrary: false,
    canUseAudio: false,
    canInvite: false,
    isActivePro: false,
    isInGracePeriod: false,
    isManualPro: false,
    isAdmin: false,
    effectiveTier: "free",
    denyReason: reason,
  };
}

/**
 * Gate a Pro-only route. Returns a 403 Response if not entitled, null if allowed.
 * Use this in route handlers instead of requireActiveSubscription.
 */
export function requireEntitlement(
  entitlements: Entitlements,
  feature: keyof Pick<Entitlements, "canUseCovenant" | "canUseAlignment" | "canUseLibrary" | "canUseAudio" | "canInvite">,
  requestId?: string
): Response | null {
  if (entitlements[feature]) return null;

  const messages: Record<Entitlements["denyReason"] & string, string> = {
    not_subscribed: "This feature requires a Pro subscription.",
    subscription_canceled: "Your subscription has been canceled. Upgrade to regain access.",
    payment_failed: "Your payment failed. Please update your billing details.",
    grace_expired: "Your subscription payment is overdue. Please update your billing details.",
  };

  const message = messages[entitlements.denyReason ?? "not_subscribed"] ?? "Pro subscription required.";

  return new Response(
    JSON.stringify({
      error: "subscription_required",
      message,
      denyReason: entitlements.denyReason,
      ...(requestId ? { requestId } : {}),
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        ...(requestId ? { "x-request-id": requestId } : {}),
      },
    }
  );
}
