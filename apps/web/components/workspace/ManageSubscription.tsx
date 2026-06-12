"use client";

import { useState } from "react";

export default function ManageSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      });

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

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleOpen}
        disabled={loading}
        className="w-full px-2 py-1 text-left font-sans font-medium text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
      >
        {loading ? "···" : "Manage subscription"}
      </button>
      {error && (
        <p className="px-2 font-sans font-medium text-[8px] uppercase tracking-widest text-red-400/60 leading-4">
          {error}
        </p>
      )}
    </div>
  );
}