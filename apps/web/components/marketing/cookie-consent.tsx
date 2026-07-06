"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const COOKIE_KEY = "sovv_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(COOKIE_KEY) as ConsentState | null;
    setConsent(stored);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setConsent("accepted");
    // Fire analytics init if accepted
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setConsent("declined");
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }
  };

  if (!mounted || consent !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[200]"
        role="dialog"
        aria-label="Cookie consent"
        aria-live="polite"
      >
        <div
          className="border border-white/[0.10] bg-[#0c0a0d]/95 p-5 flex flex-col gap-4"
          style={{
            borderRadius: 14,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 shrink-0 flex items-center justify-center border border-white/[0.08] bg-white/[0.03] mt-0.5"
              style={{ borderRadius: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="rgba(224,116,58,0.6)" strokeWidth="1.2" />
                <circle cx="7" cy="7" r="2" fill="rgba(224,116,58,0.5)" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70 mb-1">
                Privacy
              </p>
              <p className="text-[13px] text-[#c8c2bc] leading-relaxed">
                We use cookies to keep you signed in and understand how the platform is used.
              </p>
            </div>
          </div>

          {/* Privacy link */}
          <p className="text-[11px] text-[#4f4b47] leading-relaxed pl-10">
            Read our{" "}
            <Link href="/privacy" className="text-[#76716b] hover:text-[#a8a29a] underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>{" "}
            to learn what we collect and why.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pl-10">
            <button
              onClick={handleAccept}
              className="flex-1 h-9 text-[12px] tracking-[-0.01em] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200 font-medium"
              style={{ borderRadius: 8 }}
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 h-9 text-[12px] tracking-[-0.01em] border border-white/[0.08] text-[#76716b] hover:text-[#a8a29a] hover:border-white/[0.14] transition-colors duration-200"
              style={{ borderRadius: 8 }}
            >
              Decline
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}