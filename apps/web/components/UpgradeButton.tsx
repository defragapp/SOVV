"use client";

import { useState } from "react";

export function UpgradeButton({
  label = "Upgrade to Pro",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError("Unable to start checkout. Try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`border border-[#F6F5F3]/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#F6F5F3] transition-colors hover:bg-[#F6F5F3]/5 disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? "···" : label}
      </button>
      {error && (
        <p className="font-mono text-[9px] uppercase tracking-widest text-red-400/70">
          {error}
        </p>
      )}
    </div>
  );
}