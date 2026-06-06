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
    title: "See the full pattern",
    body: "Free helps you understand what is active in the moment. Pro helps you work the pattern over time, save what changes, and go deeper with another person.",
    features: [
      "Expanded Defrag space use",
      "Your Space notebook",
      "Try It Out",
      "Compare With Someone",
      "Full saved history",
      "Branded audio and Watch It when available",
    ],
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep using Free",
  },
  session_limit: {
    title: "You've reached today's Free limit",
    body: "Free gives you a starting view of what is active in the moment. Pro keeps the thread going so you can work the pattern over time.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Come back later",
  },
  compare: {
    title: "Compare With Someone is a Pro feature",
    body: "Defrag can show the pattern between you when another person, family member, group, or team layer is available and permitted. Pro unlocks the ability to compare loops, see where the pattern meets, and practice a better response.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Stay with Just You",
  },
  try_it_out: {
    title: "Practice the response before you use it",
    body: "Try It Out helps you test a message, simulate how it could land, and choose the version that brings you back to center.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep using Free",
  },
  your_story: {
    title: "Save what changes over time",
    body: "Your Story keeps your notes, patterns, Best Next Responses, and progress in one place. Pro unlocks deeper history so the thread can stay grounded over time.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Not now",
  },
  watch_it: {
    title: "Turn the insight into audio or video",
    body: "Pro can turn an answer into a branded audio overview or short-form scene when media features are available.",
    primaryLabel: "Upgrade to Pro",
    secondaryLabel: "Keep the text version",
  },
  payment_issue: {
    title: "Action needed for your Pro subscription",
    body: "We couldn't process your latest payment. Update your payment method to keep Pro access active.",
    primaryLabel: "Update payment method",
    secondaryLabel: "Go to your space",
  },
  canceled: {
    title: "Your account is now on Free",
    body: "Your Pro subscription is no longer active. You can still use Free to understand what is active in the moment and get a basic Best Next Response.",
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