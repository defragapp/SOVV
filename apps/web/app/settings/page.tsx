"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BaselineRequest } from "@sovereign/core";
import { apiGetBaseline, apiSaveBaseline } from "@/lib/api";

const initialState: BaselineRequest = {
  dob: "",
  tob: { type: "exact", value: "" },
  pob: "",
};

/* ─────────────────────────────────────────────
   Micro-components — purely presentational,
   all business logic lives in the parent
───────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.1em] uppercase text-[#F6F5F3]/30 font-sans font-medium">
      {children}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] tracking-[0.1em] uppercase text-[#F6F5F3]/40 font-sans font-medium mb-2"
    >
      {children}
    </label>
  );
}

function HintText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] leading-relaxed text-[#F6F5F3]/25 font-sans font-medium tracking-wide">
      {children}
    </p>
  );
}

const inputBase =
  "w-full bg-surface border border-border text-[#F6F5F3]/85 text-[13px] font-sans font-medium " +
  "px-3.5 py-3 rounded-none outline-none transition-all duration-200 " +
  "placeholder:text-[#F6F5F3]/18 " +
  "focus:border-border focus:bg-surface " +
  "disabled:opacity-30 disabled:cursor-not-allowed " +
  "[color-scheme:dark]";

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */

export default function SettingsPage() {
  const [baseline, setBaseline] = useState<BaselineRequest>(initialState);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [hasBaseline, setHasBaseline] = useState(false);

  useEffect(() => {
    apiGetBaseline().then((result) => {
      if (result?.baseline) {
        setBaseline({
          dob: result.baseline.dob,
          tob: {
            type: result.baseline.tob.type,
            value: result.baseline.tob.value,
          },
          pob: result.baseline.pob,
        });
        setHasBaseline(true);
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const result = await apiSaveBaseline(baseline);
      if (result?.baseline) {
        setHasBaseline(true);
        setMessage({ text: "Baseline Design saved.", ok: true });
      } else {
        setMessage({ text: "Unable to save Baseline Design.", ok: false });
      }
    } catch {
      setMessage({ text: "Save failed. Try again.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-[#f4efe9]">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-2.5" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-[11px] font-sans font-medium tracking-widest uppercase text-[#f4efe9]/40 hover:text-[#f4efe9]/70 transition-colors duration-200"
            >
              Sovereign.os
            </Link>
            <span className="text-[#f4efe9]/20 text-[11px] font-sans font-medium" aria-hidden>
              /
            </span>
            <span className="text-[11px] font-sans font-medium tracking-widest uppercase text-[#f4efe9]/60">
              Baseline Design
            </span>
          </nav>

          <Link
            href="/apps/defrag"
            className="text-[11px] font-sans font-medium tracking-wide text-[#f4efe9]/40 hover:text-[#f4efe9]/80 transition-colors duration-200"
          >
            ← Defrag
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">

        {/* ── Title block ── */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] tracking-[0.1em] uppercase font-sans font-medium text-[#76716b] border border-border px-2.5 py-1 bg-transparent">
              Baseline Design
            </span>
            <AnimatePresence>
              {hasBaseline && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 text-[10px] font-sans font-medium tracking-[0.1em] uppercase text-[#a8a29a]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] inline-block" />
                  Active
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <h1 className="text-[28px] md:text-[34px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#f4efe9] mb-5 text-balance">
            Your Baseline Design<br className="hidden sm:block" /> is the source.
          </h1>

          <p className="text-[14px] leading-[1.7] text-[#a8a29a] max-w-prose mb-6">
            Your Baseline Design is the starting map — how you tend to process,
            respond, connect, protect, communicate, and return to center. It is
            stored privately and used to keep every thread in Defrag and
            Covenant grounded. It is never exposed in outputs.
          </p>

          <div className="flex items-start gap-3 pl-4 border-l border-border">
            <p className="text-[11px] leading-relaxed text-[#76716b] font-sans font-medium tracking-wide">
              Shared across Defrag and Covenant. Set once. Works across all sessions.
            </p>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="bg-surface border border-border p-8 md:p-10 mb-14">

          <SectionLabel>Enter your birth details</SectionLabel>

          <div className="mt-8 space-y-8">

            {/* Date of birth */}
            <div>
              <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
              <input
                id="dob"
                type="date"
                value={baseline.dob}
                onChange={(e) =>
                  setBaseline((prev) => ({ ...prev, dob: e.target.value }))
                }
                className={inputBase}
                style={{ fontSize: "16px" }}
                aria-describedby="dob-hint"
              />
              <HintText>
                <span id="dob-hint">YYYY-MM-DD</span>
              </HintText>
            </div>

            {/* Time of birth */}
            <div>
              <FieldLabel>Time of birth</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tob-type" className="sr-only">
                    Time precision
                  </label>
                  <select
                    id="tob-type"
                    value={baseline.tob.type}
                    onChange={(e) =>
                      setBaseline((prev) => ({
                        ...prev,
                        tob: {
                          ...prev.tob,
                          type: e.target.value as "exact" | "approx",
                        },
                      }))
                    }
                    className={inputBase}
                    style={{ fontSize: "16px" }}
                  >
                    <option value="exact">Exact time</option>
                    <option value="approx">Approximate</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tob-value" className="sr-only">
                    Time value
                  </label>
                  <input
                    id="tob-value"
                    type="time"
                    value={baseline.tob.value}
                    onChange={(e) =>
                      setBaseline((prev) => ({
                        ...prev,
                        tob: { ...prev.tob, value: e.target.value },
                      }))
                    }
                    className={inputBase}
                    style={{ fontSize: "16px" }}
                    aria-describedby="tob-hint"
                  />
                </div>
              </div>
              <HintText>
                <span id="tob-hint">
                  If unknown, use approximate and enter a midpoint.
                </span>
              </HintText>
            </div>

            {/* Place of birth */}
            <div>
              <FieldLabel htmlFor="pob">Place of birth</FieldLabel>
              <input
                id="pob"
                type="text"
                value={baseline.pob}
                onChange={(e) =>
                  setBaseline((prev) => ({ ...prev, pob: e.target.value }))
                }
                placeholder="City, Country"
                className={inputBase}
                style={{ fontSize: "16px" }}
              />
            </div>

          </div>

          {/* Privacy note */}
          <div className="mt-8 pt-7 border-t border-border">
            <p className="text-[11px] leading-[1.75] text-[#76716b] font-sans font-medium tracking-wide">
              Your birth details are used only to generate your Baseline Design.
              They are stored privately and never exposed in outputs, shared with
              other users, or used outside your own session context.
            </p>
          </div>

          {/* Save row */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !baseline.dob || !baseline.pob}
              className={[
                "inline-flex items-center justify-center gap-2",
                "text-[11px] font-sans font-medium tracking-[0.1em] uppercase",
                "bg-[#f4efe9] text-[#08070a] px-7 py-3.5",
                "border border-transparent",
                "transition-all duration-200",
                "hover:bg-[#e8e2da] active:scale-[0.98]",
                "disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
              ].join(" ")}
            >
              {saving ? (
                <>
                  <span
                    className="w-3 h-3 border border-[#050505]/30 border-t-[#050505]/70 rounded-full animate-spin"
                    aria-hidden
                  />
                  Saving
                </>
              ) : hasBaseline ? (
                "Update Baseline Design"
              ) : (
                "Save Baseline Design"
              )}
            </button>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={[
                    "text-[11px] font-sans font-medium tracking-wide",
                    message.ok
                      ? "text-[#a8a29a]"
                      : "text-red-400/80",
                  ].join(" ")}
                  role="status"
                  aria-live="polite"
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Unlocks section ── */}
        <div>
          <SectionLabel>What your Baseline Design unlocks</SectionLabel>

          <ul
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-0"
            aria-label="Features unlocked by Baseline Design"
          >
            {[
              "Grounded threads in Defrag",
              "Grounded reflection in Covenant",
              "Active pattern identification",
              "Best Next Response",
              "Compare With Someone",
              "Sovereign.os Library continuity",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3.5 py-3.5 border-b border-border group"
              >
                <span
                  className="w-[18px] h-px bg-white/[0.12] shrink-0 transition-all duration-300 group-hover:bg-white/[0.3] group-hover:w-[24px]"
                  aria-hidden
                />
                <span className="text-[12px] leading-relaxed text-[#a8a29a] font-sans font-medium tracking-wide group-hover:text-[#f4efe9] transition-colors duration-200">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  );
}
