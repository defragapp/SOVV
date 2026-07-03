"use client";

import * as React from "react";
import ManageSubscription from "@/components/spaces/ManageSubscription"
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



function DeleteAccountSection() {
  const [confirming, setConfirming] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error || "Failed to delete account")
        return
      }
      window.location.href = "/"
    } catch {
      setError("Connection failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] hover:text-red-400/60 transition-colors"
      >
        Delete account
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-[#a8a29a] leading-relaxed">
        This will permanently delete your account, all saved results, and your Baseline Design. This cannot be undone.
      </p>
      {error && <p className="text-[12px] text-red-400/70">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
        >
          {loading ? "Deleting…" : "Yes, delete my account"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}



function ActiveSessionsList() {
  const [sessions, setSessions] = React.useState<Array<{ id: string; createdAt: string; expiresAt: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [revoking, setRevoking] = React.useState<string | null>(null)

  const loadSessions = () => {
    fetch("/api/auth/sessions", { credentials: "include" })
      .then(r => r.ok ? r.json() : { sessions: [] })
      .then((d: any) => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  React.useEffect(() => { loadSessions() }, [])

  const revokeSession = async (id: string) => {
    setRevoking(id)
    try {
      await fetch(`/api/auth/sessions/${id}`, { method: "DELETE", credentials: "include" })
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch { /* silent */ } finally {
      setRevoking(null)
    }
  }

  if (loading) return <span className="font-mono text-[10px] text-[#4f4b47]">Loading…</span>
  if (sessions.length === 0) return <span className="font-mono text-[10px] text-[#4f4b47]">No active sessions</span>

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s, i) => (
        <div key={s.id} className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-[#4f4b47]">
              Session ···{s.id}
            </span>
            <span className="font-mono text-[9px] text-[#4f4b47]/60">
              Expires {new Date(s.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={() => revokeSession(s.id)}
            disabled={revoking === s.id}
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47] hover:text-red-400/60 transition-colors disabled:opacity-30"
          >
            {revoking === s.id ? "…" : "Revoke"}
          </button>
        </div>
      ))}
    </div>
  )
}

function EmailVerificationStatus() {
  const [status, setStatus] = React.useState<"loading" | "verified" | "unverified" | "unknown">("loading")
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => {
        if (!d) { setStatus("unknown"); return }
        setStatus(d.emailVerified ? "verified" : "unverified")
      })
      .catch(() => setStatus("unknown"))
  }, [])

  const sendVerification = async () => {
    setSending(true)
    try {
      await fetch("/api/auth/send-verification", { method: "POST", credentials: "include" })
      setSent(true)
    } catch { /* silent */ } finally {
      setSending(false)
    }
  }

  if (status === "loading") return <span className="font-mono text-[10px] text-[#4f4b47]">Checking…</span>
  if (status === "verified") return <span className="font-mono text-[10px] text-[#76716b]">Email verified ✓</span>
  if (status === "unverified") return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] text-[#4f4b47]">Email not verified</span>
      {!sent ? (
        <button onClick={sendVerification} disabled={sending}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] hover:text-[#f4efe9] transition-colors disabled:opacity-30">
          {sending ? "Sending…" : "Send verification"}
        </button>
      ) : (
        <span className="font-mono text-[10px] text-[#76716b]">Check your email</span>
      )}
    </div>
  )
  return null
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error || "Failed to change password")
        return
      }
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError("Connection failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="sovv-label">Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="sovv-input w-full"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="sovv-label">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="sovv-input w-full"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="sovv-label">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="sovv-input w-full"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-[12px] text-red-400/70">{error}</p>}
      {success && <p className="text-[12px] text-[#76716b]">Password updated successfully.</p>}
      <button
        type="submit"
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        className="btn-secondary h-10 px-6 text-[12px] disabled:opacity-30"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  )
}

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
        setMessage({ text: "Baseline Design saved. Your pattern map is compiling — this takes 30–60 seconds.", ok: true });
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

        {/* Email verification */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] mb-3">Email</p>
          <EmailVerificationStatus />
        </div>

        {/* Active sessions */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] mb-3">Active Sessions</p>
          <ActiveSessionsList />
        </div>

        {/* Subscription */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[14px] p-8 md:p-10 mt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-6">
            Subscription
          </p>
          <ManageSubscription />
        </div>

        {/* Change Password */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[14px] p-8 md:p-10 mt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-6">
            Change Password
          </p>
          <ChangePasswordForm />
        </div>

        {/* Danger zone */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] mb-4">
            Account
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="/api/auth/export"
              download
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
            >
              Export my data
            </a>
            <DeleteAccountSection />
          </div>
        </div>

      </main>
    </div>
  );
}