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

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-mono uppercase tracking-[0.14em] text-[#76716b] mb-2"
    >
      {children}
    </label>
  );
}

function HintText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-[#4f4b47]">
      {children}
    </p>
  );
}

const inputBase =
  "w-full bg-white/[0.04] border border-white/[0.1] text-[#f4efe9] text-base font-sans " +
  "px-4 py-3.5 rounded-[10px] outline-none transition-all duration-200 " +
  "placeholder:text-[#4f4b47] " +
  "focus:border-white/25 focus:bg-white/[0.07] " +
  "disabled:opacity-30 disabled:cursor-not-allowed " +
  "[color-scheme:dark]";

export default function SettingsPage() {
  const [baseline, setBaseline] = useState<BaselineRequest>(initialState);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasBaseline, setHasBaseline] = useState(false);

  useEffect(() => {
    apiGetBaseline().then((result) => {
      if (result?.baseline) {
        setBaseline({
          dob: result.baseline.dob,
          tob: { type: result.baseline.tob.type, value: result.baseline.tob.value },
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
    <div className="min-h-screen bg-[#08070a] text-[#f4efe9]">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08070a]/90 backdrop-blur-md safe-top">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-2.5 font-mono text-xs tracking-[0.2em] uppercase" aria-label="Breadcrumb">
            <Link href="/apps/defrag" className="text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Sovereign.os
            </Link>
            <span className="text-[#4f4b47]" aria-hidden>/</span>
            <span className="text-[#a8a29a]">Baseline Design</span>
          </nav>
          <Link
            href="/apps/defrag"
            className="text-xs font-mono tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            ← Defrag
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 md:py-24">

        {/* Title */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#76716b] border border-white/[0.08] px-2.5 py-1" style={{ borderRadius: 6 }}>
              Baseline Design
            </span>
            <AnimatePresence>
              {hasBaseline && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#a8a29a]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/60 inline-block" />
                  Active
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-[#f4efe9] leading-tight tracking-[-0.02em] mb-5">
            Your Baseline Design is the starting point.
          </h1>

          <p className="text-base leading-relaxed text-[#a8a29a] max-w-prose mb-6">
            Your Baseline Design is the starting map — how you tend to process,
            respond, connect, protect, communicate, and return to center. It is
            stored privately and used to keep every thread in Defrag and
            Covenant grounded. It is never exposed in outputs.
          </p>

          <div className="flex items-start gap-3 pl-4 border-l-2 border-[#e0743a]/20">
            <p className="text-sm leading-relaxed text-[#76716b]">
              Shared across Defrag and Covenant. Set once. Works across all sessions.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[14px] p-8 md:p-10 mb-14">

          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#76716b] mb-8">
            Enter your birth details
          </p>

          <div className="space-y-8">

            {/* Date of birth */}
            <div>
              <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
              <input
                id="dob"
                type="date"
                value={baseline.dob}
                onChange={(e) => setBaseline((prev) => ({ ...prev, dob: e.target.value }))}
                className={inputBase}
                style={{ fontSize: "16px" }}
              />
              <HintText>YYYY-MM-DD</HintText>
            </div>

            {/* Time of birth */}
            <div>
              <FieldLabel>Time of birth</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={baseline.tob.type}
                  onChange={(e) =>
                    setBaseline((prev) => ({
                      ...prev,
                      tob: { ...prev.tob, type: e.target.value as "exact" | "approx" },
                    }))
                  }
                  className={inputBase}
                  style={{ fontSize: "16px" }}
                >
                  <option value="exact">I know the exact time</option>
                  <option value="approx">I know roughly when</option>
                </select>
                <input
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
                />
              </div>
              <HintText>If you don't know the exact time, choose what you know. The system will hold uncertain details lightly.</HintText>
            </div>

            {/* Place of birth */}
            <div>
              <FieldLabel htmlFor="pob">Place of birth</FieldLabel>
              <input
                id="pob"
                type="text"
                value={baseline.pob}
                onChange={(e) => setBaseline((prev) => ({ ...prev, pob: e.target.value }))}
                placeholder="City, Country"
                className={inputBase}
                style={{ fontSize: "16px" }}
              />
            </div>

          </div>

          {/* Privacy note */}
          <div className="mt-8 pt-7 border-t border-white/[0.06]">
            <p className="text-sm leading-relaxed text-[#76716b]">
              Your birth details are used only to generate your Baseline Design.
              They are stored privately and never exposed in outputs, shared with
              other users, or used outside your own session context.
            </p>
          </div>

          {/* Save */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !baseline.dob || !baseline.pob}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed" style={{ borderRadius: "var(--radius-button)" }}
            >
              {saving ? (
                <>
                  <span className="w-3 h-3 border border-[#08070a]/30 border-t-[#08070a]/70 rounded-full animate-spin" aria-hidden />
                  Saving
                </>
              ) : hasBaseline ? "Update Baseline Design" : "Save Baseline Design"}
            </button>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`text-sm ${message.ok ? "text-[#a8a29a]" : "text-red-400/80"}`}
                  role="status"
                  aria-live="polite"
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* What it unlocks */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#76716b] mb-6">
            What your Baseline Design unlocks
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[
              "Grounded threads in Defrag",
              "Grounded reflection in Covenant",
              "Active pattern identification",
              "Best Next Response",
              "Invite Privately",
              "Sovereign.os Library continuity",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3.5 py-4 border-b border-white/[0.06] group">
                <span className="w-4 h-px bg-[#e0743a]/30 shrink-0 transition-all duration-300 group-hover:bg-[#e0743a]/60 group-hover:w-6" aria-hidden />
                <span className="text-sm text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors duration-200">
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