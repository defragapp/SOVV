import { describe, it, expect } from "vitest";
import {
  checkEntitlement,
  checkEntitlementForRequest,
  priceIdForTier,
  type EntitlementUser,
} from "../entitlements.js";

function makeUser(tier: string, status: string): EntitlementUser {
  return { id: "u1", tier, subscription_status: status };
}

function makeRequest(path: string): Request {
  return new Request(`https://api.defrag.app${path}`);
}

describe("checkEntitlement — defrag (free) space", () => {
  it("allows free user on defrag", () => {
    const r = checkEntitlement(makeUser("free", "none"), "defrag");
    expect(r.allowed).toBe(true);
  });
  it("allows pro user on defrag", () => {
    const r = checkEntitlement(makeUser("pro", "active"), "defrag");
    expect(r.allowed).toBe(true);
  });
});

describe("checkEntitlement — alignment space", () => {
  it("denies free user", () => {
    const r = checkEntitlement(makeUser("free", "none"), "alignment");
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.status).toBe(402);
      expect(r.code).toBe("payment_required");
    }
  });

  it("allows alignment user with active subscription", () => {
    const r = checkEntitlement(makeUser("alignment", "active"), "alignment");
    expect(r.allowed).toBe(true);
  });

  it("denies alignment user with canceled subscription", () => {
    const r = checkEntitlement(makeUser("alignment", "canceled"), "alignment");
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.status).toBe(402);
  });

  it("allows covenant user on alignment", () => {
    const r = checkEntitlement(makeUser("covenant", "active"), "alignment");
    expect(r.allowed).toBe(true);
  });

  it("allows legacy pro user on alignment", () => {
    const r = checkEntitlement(makeUser("pro", "active"), "alignment");
    expect(r.allowed).toBe(true);
  });
});

describe("checkEntitlement — covenant space", () => {
  it("denies free user", () => {
    const r = checkEntitlement(makeUser("free", "none"), "covenant");
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.status).toBe(402);
  });

  it("denies alignment user", () => {
    const r = checkEntitlement(makeUser("alignment", "active"), "covenant");
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.status).toBe(402);
  });

  it("allows covenant user with active subscription", () => {
    const r = checkEntitlement(makeUser("covenant", "active"), "covenant");
    expect(r.allowed).toBe(true);
  });

  it("allows legacy pro user", () => {
    const r = checkEntitlement(makeUser("pro", "active"), "covenant");
    expect(r.allowed).toBe(true);
  });
});

describe("checkEntitlement — null user", () => {
  it("returns 401 when user is null", () => {
    const r = checkEntitlement(null, "alignment");
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.status).toBe(401);
      expect(r.code).toBe("unauthorized");
    }
  });
});

describe("checkEntitlement — response shape", () => {
  it("returns a real Response object on denial", async () => {
    const r = checkEntitlement(makeUser("free", "none"), "covenant");
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.response).toBeInstanceOf(Response);
      expect(r.response.status).toBe(402);
      const body = await r.response.json() as { error: string };
      expect(body.error).toBe("payment_required");
    }
  });

  it("includes upgradeUrl when appUrl is provided", () => {
    const r = checkEntitlement(makeUser("free", "none"), "covenant", "https://app.defrag.app");
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.upgradeUrl).toBe("https://app.defrag.app/pricing");
    }
  });
});

describe("checkEntitlementForRequest", () => {
  it("returns null for defrag routes", () => {
    const r = checkEntitlementForRequest(makeUser("free", "none"), makeRequest("/api/explain"));
    expect(r).toBeNull();
  });

  it("returns null for unrecognized routes", () => {
    const r = checkEntitlementForRequest(makeUser("free", "none"), makeRequest("/api/unknown"));
    expect(r).toBeNull();
  });

  it("returns denied check for /api/alignment", () => {
    const r = checkEntitlementForRequest(makeUser("free", "none"), makeRequest("/api/alignment"));
    expect(r).not.toBeNull();
    expect(r?.allowed).toBe(false);
  });

  it("returns allowed check for /api/covenant when pro", () => {
    const r = checkEntitlementForRequest(makeUser("pro", "active"), makeRequest("/api/covenant"));
    expect(r).not.toBeNull();
    expect(r?.allowed).toBe(true);
  });
});

describe("priceIdForTier", () => {
  it("returns alignment-specific price ID when set", () => {
    const id = priceIdForTier("alignment", {
      STRIPE_ALIGNMENT_PRICE_ID: "price_align_123",
      STRIPE_PRICE_ID: "price_legacy",
    });
    expect(id).toBe("price_align_123");
  });

  it("falls back to STRIPE_PRICE_ID when alignment-specific is not set", () => {
    const id = priceIdForTier("alignment", { STRIPE_PRICE_ID: "price_legacy" });
    expect(id).toBe("price_legacy");
  });

  it("returns covenant-specific price ID when set", () => {
    const id = priceIdForTier("covenant", {
      STRIPE_COVENANT_PRICE_ID: "price_cov_456",
      STRIPE_PRICE_ID: "price_legacy",
    });
    expect(id).toBe("price_cov_456");
  });

  it("returns undefined when no price IDs are configured", () => {
    const id = priceIdForTier("covenant", {});
    expect(id).toBeUndefined();
  });
});
