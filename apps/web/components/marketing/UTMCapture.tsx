"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUTM } from "@/lib/utm";

/**
 * UTMCapture — invisible component that captures UTM params on mount.
 * Place in marketing layout or any page that receives traffic from ads/campaigns.
 */
export function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Trigger capture whenever search params change (handles client-side navigation)
    captureUTM();
  }, [searchParams]);

  return null;
}