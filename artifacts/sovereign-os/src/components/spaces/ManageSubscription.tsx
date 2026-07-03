
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
        className="w-full px-2 py-1 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors disabled:opacity-30"
      >
        {loading ? "···" : "Manage subscription"}
      </button>
      {error && (
        <p className="px-2 font-mono text-[9px] text-red-400/60 leading-4">
          {error}
        </p>
      )}
    </div>
  );
}