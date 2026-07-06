"use client";

import { useEffect, useState } from "react";
import { getVariant, trackABEvent, PRICING_PAGE_TEST } from "@/lib/ab-test";

/**
 * ABPricingVariant — wraps pricing page content with A/B variant logic.
 * Variants:
 *   control        — default pricing layout (annual toggle at top)
 *   annual_first   — annual billing pre-selected, savings badge prominent
 *   trial_emphasis — "7-day free trial" messaging front and center
 */
export function useABPricingVariant() {
  const [variant, setVariant] = useState<string>("control");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const v = getVariant(PRICING_PAGE_TEST);
    setVariant(v);
    setMounted(true);
    trackABEvent(PRICING_PAGE_TEST.id, v, "viewed");
  }, []);

  return { variant, mounted };
}

/** Track a pricing page conversion (upgrade click) */
export function trackPricingConversion(variant: string, plan: string) {
  trackABEvent(PRICING_PAGE_TEST.id, variant, "converted", { plan });
}