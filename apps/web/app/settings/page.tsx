"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BaselineRequest } from "@sovereign/core";
import { apiGetBaseline, apiSaveBaseline } from "@/lib/api";

const initialState: BaselineRequest = {
  dob: "",
  tob: { type: "exact", value: "" },
  pob: ""
};

export default function SettingsPage() {
  const [baseline, setBaseline] = useState<BaselineRequest>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetBaseline().then((result) => {
      if (result?.baseline) {
        setBaseline({
          dob: result.baseline.dob,
          tob: { type: result.baseline.tob.type, value: result.baseline.tob.value },
          pob: result.baseline.pob
        });
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const result = await apiSaveBaseline(baseline);
      if (result?.baseline) {
        setMessage("Baseline saved.");
      } else {
        setMessage("Unable to save baseline.");
      }
    } catch (error) {
      setMessage("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <h1 className="text-3xl font-semibold">Baseline settings</h1>
            <p className="mt-2 text-sm text-white/70">
              Store a hidden personal baseline that helps answers stay consistent without exposing private details.
            </p>
          </div>
          <Link href="/app" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10">
            Back to workspace
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Date of birth (DOB)</label>
            <input
              value={baseline.dob}
              onChange={(e) => setBaseline((prev) => ({ ...prev, dob: e.target.value }))}
              placeholder="YYYY-MM-DD"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Time of birth (TOB)</label>
              <div className="grid gap-2">
                <select
                  value={baseline.tob.type}
                  onChange={(e) => setBaseline((prev) => ({ ...prev, tob: { ...prev.tob, type: e.target.value as "exact" | "approx" } }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option value="exact">Exact time</option>
                  <option value="approx">Approximate</option>
                </select>
                <input
                  value={baseline.tob.value}
                  onChange={(e) => setBaseline((prev) => ({ ...prev, tob: { ...prev.tob, value: e.target.value } }))}
                  placeholder="14:30 or morning"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Place of birth (POB)</label>
              <input
                value={baseline.pob}
                onChange={(e) => setBaseline((prev) => ({ ...prev, pob: e.target.value }))}
                placeholder="City, state or region"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 text-sm text-white/70">
            <p>
              This data is used only as hidden context to keep your explanations consistent. It is not displayed in the workspace, and it is stored only in your worker KV state.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-white px-5 py-3 text-black font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save baseline"}
            </button>
            {message ? <div className="text-sm text-white/80">{message}</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
