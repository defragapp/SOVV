"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BaselineRequest } from "@sovereign/core";
import { apiGetBaseline, apiSaveBaseline } from "@/lib/api";

const initialState: BaselineRequest = {
  dob: "",
  tob: { type: "exact", value: "" },
  pob: ""
};

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
          pob: result.baseline.pob
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
    <div className="min-h-screen bg-[#05070B] text-[#F6F5F3]">

      {/* Header */}
      <header className="border-b border-[#F6F5F3]/8 px-6 py-4 flex items-center justify-between glass sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-micro text-[#F6F5F3]/25 hover:text-[#F6F5F3]/50 transition-colors">
            Sovereign.os
          </Link>
          <span className="text-[#F6F5F3]/15 text-micro">/</span>
          <span className="text-micro text-[#F6F5F3]/40">Baseline Design</span>
        </div>
        <Link href="/apps/defrag" className="text-micro text-[#F6F5F3]/30 hover:text-[#F6F5F3]/60 transition-colors">
          ← Back to Defrag space
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* Title block */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="space-badge-defrag">Baseline Design</span>
            {hasBaseline && (
              <span className="text-micro text-[#F6F5F3]/60/70">Active</span>
            )}
          </div>
          <h1 className="text-headline">Your Baseline Design<br />is the source.</h1>
          <p className="text-body">
            Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. It is stored privately and used to keep every thread in Defrag and Covenant grounded. It is never exposed in outputs.
          </p>
          <div className="border-l border-white/15 pl-4">
            <p className="text-caption text-xs">
              Shared across Defrag and Covenant. Set once. Works across all sessions.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="border border-[#F6F5F3]/8 p-8 space-y-8">
          <p className="text-label">Enter your birth details</p>

          {/* Date of birth */}
          <div className="space-y-2">
            <label htmlFor="dob" className="sovv-label">Date of birth</label>
            <input
              id="dob"
              type="date"
              value={baseline.dob}
              onChange={(e) => setBaseline((prev) => ({ ...prev, dob: e.target.value }))}
              className="sovv-input"
              style={{ fontSize: "16px" }}
            />
            <p className="text-micro">YYYY-MM-DD</p>
          </div>

          {/* Time of birth */}
          <div className="space-y-2">
            <label className="sovv-label">Time of birth</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tob-type" className="sr-only">Time precision</label>
                <select
                  id="tob-type"
                  value={baseline.tob.type}
                  onChange={(e) => setBaseline((prev) => ({
                    ...prev,
                    tob: { ...prev.tob, type: e.target.value as "exact" | "approx" }
                  }))}
                  className="sovv-input"
                  style={{ fontSize: "16px" }}
                >
                  <option value="exact">Exact time</option>
                  <option value="approx">Approximate</option>
                </select>
              </div>
              <div>
                <label htmlFor="tob-value" className="sr-only">Time value</label>
                <input
                  id="tob-value"
                  type="time"
                  value={baseline.tob.value}
                  onChange={(e) => setBaseline((prev) => ({
                    ...prev,
                    tob: { ...prev.tob, value: e.target.value }
                  }))}
                  className="sovv-input"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>
            <p className="text-micro">If unknown, use approximate and enter a midpoint.</p>
          </div>

          {/* Place of birth */}
          <div className="space-y-2">
            <label htmlFor="pob" className="sovv-label">Place of birth</label>
            <input
              id="pob"
              type="text"
              value={baseline.pob}
              onChange={(e) => setBaseline((prev) => ({ ...prev, pob: e.target.value }))}
              placeholder="City, Country"
              className="sovv-input"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Privacy note */}
          <div className="border-t border-[#F6F5F3]/6 pt-6">
            <p className="text-caption text-xs leading-6">
              Your birth details are used only to generate your Baseline Design. They are stored privately and never exposed in outputs, shared with other users, or used outside your own session context.
            </p>
          </div>

          {/* Save */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !baseline.dob || !baseline.pob}
              className="sovv-button-primary py-3.5 px-8 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : hasBaseline ? "Update Baseline Design" : "Save Baseline Design"}
            </button>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-label ${message.ok ? "text-[#F6F5F3]/60" : "text-red-400/60"}`}
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* What it unlocks */}
        <div className="space-y-4">
          <p className="text-label">What your Baseline Design unlocks</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Grounded threads in Defrag",
              "Grounded reflection in Covenant",
              "Active pattern identification",
              "Best Next Response",
              "Compare With Someone",
              "Sovereign.os Library continuity",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2 border-b border-[#F6F5F3]/6">
                <div className="h-px w-3 bg-[#F6F5F3]/18 shrink-0" />
                <span className="text-caption text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}