"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserData {
  tier: string;
  subscription_status: string;
  is_in_grace_period?: boolean;
}

export default function ManageSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => d && setUser(d))
      .catch(() => {});
  }, []);

  const handleOpen = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
      const data = await res.json() as { url?: string; error?: string };
      if (res.status === 404 && data.error === "no_billing_account") {
        setError("No billing account found. Upgrade to Pro first.");
        return;
      }
      if (!res.ok || !data.url) {
        setError("We couldn't open the billing portal right now.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("We couldn't open the billing portal right now.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.tier === "pro";
  const isGrace = user?.is_in_grace_period;

  return (
    <div className="flex flex-col gap-4">
      {/* Current plan */}
      {user && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Current plan</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${isPro ? "text-[#e0743a]/80" : "text-[#76716b]"}`}>
                {isPro ? "Pro" : "Free"}
              </span>
              {isGrace && (
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-red-400/60 border border-red-400/20 px-1.5 py-0.5" style={{ borderRadius: 3 }}>
                  Payment overdue
                </span>
              )}
            </div>
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4efe9] bg-[#e0743a]/20 hover:bg-[#e0743a]/30 transition-colors border border-[#e0743a]/30 px-4 py-2"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              Upgrade →
            </Link>
          )}
        </div>
      )}

      {/* Manage billing (Pro only) */}
      {isPro && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleOpen}
            disabled={loading}
            className="w-full px-2 py-1 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors disabled:opacity-30"
          >
            {loading ? "···" : "Manage billing →"}
          </button>
          {error && (
            <p className="px-2 font-mono text-[9px] text-red-400/60 leading-4">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
