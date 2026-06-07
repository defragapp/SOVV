"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UpgradeButton } from "@/components/UpgradeButton";

export type UpgradeScenario =
  | "general"
  | "session_limit"
  | "compare"
  | "try_it_out"
  | "your_story"
  | "watch_it"
  | "payment_issue"
  | "canceled";

const COPY: Record<UpgradeScenario, {
  title: string;
  body: string;
  features?: string[];
  primaryLabel: string;
  secondaryLabel: string;
}> = {
  general: {
    title: "The pattern keeps moving until you see it.",
    body: "Free shows you what is active. Pro helps you work the pattern over time, save what changes, and go deeper with another person.",
    features: [
      "Unlimited sessions",
      "Your Story — full history",
      "Try It Out — practice before you send",
      "Compare With Someone",
      "Covenant space",
      "Audio and Watch It when available",
    ],
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep using Free",
  },
  session_limit: {
    title: "You've reached today's limit.",
    body: "What repeats matters more than what happened. Pro keeps the thread going so you can work the pattern over time — not just today.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Come back tomorrow",
  },
  compare: {
    title: "When both sides matter, invite privately.",
    body: "Defrag can work with your side of this. To compare both Baseline Designs, invite them privately — with consent, not assumption. Pro unlocks Compare With Someone.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Stay with just you",
  },
  try_it_out: {
    title: "Practice the response before you use it.",
    body: "Your next response can change the pattern. Try It Out helps you test a message, simulate how it could land, and choose the version that brings you back to center.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep using Free",
  },
  your_story: {
    title: "Save what you learn before the moment disappears.",
    body: "Your Story keeps your saved results, patterns, and Best Next Responses organized over time. Pro unlocks full history so the thread stays grounded.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Not now",
  },
  watch_it: {
    title: "Turn the insight into something you can keep.",
    body: "Pro can turn a result into a branded audio overview or short-form scene when media features are available.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep the text version",
  },
  payment_issue: {
    title: "Action needed for your Pro subscription.",
    body: "We couldn't process your latest payment. Update your payment method to keep Pro access active.",
    primaryLabel: "Update payment method",
    secondaryLabel: "Go to your space",
  },
  canceled: {
    title: "Your account is now on Free.",
    body: "Your Pro subscription is no longer active. Your Baseline Design and saved history remain available. You can still use Free to understand what is active in the moment.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Continue with Free",
  },
};

interface UpgradeModalProps {
  scenario: UpgradeScenario;
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ scenario, open, onClose }: UpgradeModalProps) {
  const copy = COPY[scenario];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1] }}
            className="fixed inset-x-4 bottom-8 z-50 mx-auto max-w-sm border border-[#F6F5F3]/15 bg-black p-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
          >
            <div className="mb-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                Pro feature
              </span>
            </div>

            <h2 className="mb-3 text-base font-light text-[#F6F5F3]">
              {copy.title}
            </h2>

            <p className="mb-4 text-sm font-light leading-6 text-white/50">
              {copy.body}
            </p>

            {copy.features && (
              <ul className="mb-5 space-y-1.5">
                {copy.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-light text-white/35">
                    <span className="mt-2 block h-1 w-1 shrink-0 bg-white/30" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              {scenario === "payment_issue" ? (
                <a
                  href="https://billing.stripe.com/p/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-[#F6F5F3]/20 px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] transition-colors hover:bg-[#F6F5F3]/5"
                >
                  {copy.primaryLabel}
                </a>
              ) : (
                <UpgradeButton label={copy.primaryLabel} />
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
              >
                {copy.secondaryLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}