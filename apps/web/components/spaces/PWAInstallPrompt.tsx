"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "sovv_pwa_dismissed";
const INSTALLED_KEY = "sovv_pwa_installed";
const COOKIE_CONSENT_KEY = "sovv_cookie_consent";
const PROMPT_DELAY_MS = 30_000;

export function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Installation is a product-level prompt, not a marketing-page interruption.
    const isProductExperience =
      pathname?.startsWith("/apps/") ||
      (pathname?.startsWith("/app/") && pathname !== "/app/login" && pathname !== "/app/signup");

    if (!isProductExperience) return;

    // Check if already installed or dismissed
    if (
      localStorage.getItem(INSTALLED_KEY) ||
      localStorage.getItem(DISMISSED_KEY)
    ) return;

    // Check if running as PWA already
    if (window.matchMedia("(display-mode: standalone)").matches) {
      localStorage.setItem(INSTALLED_KEY, "1");
      return;
    }

    // iOS detection (Safari doesn't support beforeinstallprompt)
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    const safari = /safari/i.test(ua) && !/chrome/i.test(ua);

    if (ios && safari) {
      setIsIOS(true);
      // Wait until the user has spent time in the product and resolved privacy consent.
      const timer = window.setTimeout(() => {
        if (localStorage.getItem(COOKIE_CONSENT_KEY)) setShow(true);
      }, PROMPT_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    // Android/Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      window.setTimeout(() => {
        if (localStorage.getItem(COOKIE_CONSENT_KEY)) setShow(true);
      }, PROMPT_DELAY_MS);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [pathname]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShow(false);
  };

  if (isInstalled || (!deferredPrompt && !isIOS)) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[200] md:left-auto md:right-6 md:bottom-6 md:max-w-sm"
          role="dialog"
          aria-label="Install Sovereign.os"
        >
          <div
            className="border border-white/[0.10] bg-[#0c0a0d]/96 p-5 flex flex-col gap-4"
            style={{
              borderRadius: 14,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div
                className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#08070a] border border-white/[0.08]"
                style={{ borderRadius: 10 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand-mark.svg" alt="Sovereign.os" className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#f4efe9] font-medium leading-snug mb-0.5">
                  Sovereign.os
                </p>
                <p className="text-[12px] text-[#76716b] leading-relaxed">
                  {isIOS
                    ? "Save to your home screen for direct access."
                    : "Save to your home screen."}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-[#4f4b47] hover:text-[#76716b] transition-colors shrink-0 mt-0.5"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* iOS instructions */}
            {isIOS ? (
              <div className="flex flex-col gap-2 border border-white/[0.06] bg-[#08070a] p-4" style={{ borderRadius: 8 }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-1">How to install</p>
                {[
                  { step: "1", text: "Tap the Share button in Safari" },
                  { step: "2", text: "Scroll down and tap \"Add to Home Screen\"" },
                  { step: "3", text: "Tap \"Add\" to confirm" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="font-mono text-[9px] text-[#e0743a]/60 shrink-0 mt-0.5">{s.step}</span>
                    <p className="text-[12px] text-[#a8a29a] leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Android/Chrome install button */
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 h-9 text-[12px] tracking-[-0.01em] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200 font-medium"
                  style={{ borderRadius: 8 }}
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 h-9 text-[12px] tracking-[-0.01em] border border-white/[0.08] text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200"
                  style={{ borderRadius: 8 }}
                >
                  Not now
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}