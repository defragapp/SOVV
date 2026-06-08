"use client";

import Link from "next/link";
import { pricingTiers } from "../data/marketing";

const USE_CASES = [
  "Relationship", "Family", "Boundary", "Message",
  "Grief", "Parenting", "Team", "Repair",
];

const BENTO_ITEMS = [
  {
    title: "The message",
    body: "You have reread it too many times. Before you send it, understand the pattern.",
    size: "col-span-1",
  },
  {
    title: "The family role",
    body: "The conversation pulled you back into something older than the argument. Some family roles survive long after childhood.",
    size: "col-span-1 md:col-span-2",
  },
  {
    title: "The boundary",
    body: "Clear in your body. Impossible in your mouth. A boundary is not a punishment — it is a return to alignment.",
    size: "col-span-1 md:col-span-2",
  },
  {
    title: "The grief",
    body: "Grief changes how everything lands. The same words hit differently.",
    size: "col-span-1",
  },
  {
    title: "The other side",
    body: "Two people can live through the same conversation and leave with completely different truths. The other side may not be lying. They may be living from another map.",
    size: "col-span-1 md:col-span-3",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#EDEDED", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "64px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "JetBrains Mono, Cascadia Code, ui-monospace, Menlo, monospace", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#EDEDED", textDecoration: "none", fontWeight: 500 }}>
            SOVEREIGN.OS
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {[
              { href: "/product", label: "Product" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/pricing", label: "Pricing" },
              { href: "/covenant", label: "Covenant" },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ fontSize: "0.875rem", color: "#A1A1AA", textDecoration: "none", transition: "color 150ms" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EDEDED")}
                onMouseLeave={e => (e.currentTarget.style.color = "#A1A1AA")}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="https://app.defrag.app/app/login" style={{ fontSize: "0.875rem", color: "#71717A", textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" style={{
              background: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF",
              borderRadius: "8px", padding: "0.5rem 1.25rem",
              fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
              transition: "all 200ms",
              display: "inline-block",
            }}>
              Enter
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        paddingTop: "80px", paddingBottom: "80px",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.05) 0%, transparent 60%)",
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ maxWidth: "56rem" }}>
            <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "2rem" }}>
              The Platform
            </p>
            <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#EDEDED", marginBottom: "1.5rem" }}>
              Healing isn't optional.
              <br />
              <span style={{ color: "#52525B" }}>Holding the pain is.</span>
            </h1>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.75, color: "#A1A1AA", maxWidth: "40rem", marginBottom: "0.75rem" }}>
              Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries.
            </p>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "#71717A", maxWidth: "36rem", marginBottom: "3rem" }}>
              The moment happened once. The pattern keeps happening until you can see it.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3.5rem" }}>
              <Link href="https://app.defrag.app/app/login" style={{
                background: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF",
                borderRadius: "8px", padding: "0.75rem 1.75rem",
                fontSize: "0.9375rem", fontWeight: 500, textDecoration: "none",
                display: "inline-block",
              }}>
                Start Baseline Design
              </Link>
              <Link href="https://app.defrag.app/apps/defrag" style={{
                background: "transparent", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", padding: "0.75rem 1.75rem",
                fontSize: "0.9375rem", fontWeight: 500, textDecoration: "none",
                display: "inline-block",
              }}>
                Enter Defrag space
              </Link>
              <Link href="/product" style={{
                background: "transparent", color: "#71717A", border: "none",
                padding: "0.75rem 0.5rem", fontSize: "0.9375rem", textDecoration: "none",
                display: "inline-block",
              }}>
                See how it works →
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {USE_CASES.map(uc => (
                <span key={uc} style={{
                  fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace",
                  fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px", padding: "0.25rem 0.625rem",
                  background: "rgba(255,255,255,0.04)",
                }}>
                  {uc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento: Real moments ────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1rem" }}>The real moments</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EDEDED", marginBottom: "3rem", maxWidth: "40rem" }}>
            The pattern keeps moving<br />until you can see it.
          </h2>
          {/* Bento grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {/* Row 1 */}
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", transition: "border-color 300ms" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "#EDEDED", marginBottom: "0.75rem" }}>The message</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#71717A" }}>You have reread it too many times. Before you send it, understand the pattern.</p>
            </div>
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", gridColumn: "span 2" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "#EDEDED", marginBottom: "0.75rem" }}>The family role</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#71717A" }}>The conversation pulled you back into something older than the argument. Some family roles survive long after childhood.</p>
            </div>
            {/* Row 2 */}
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", gridColumn: "span 2" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "#EDEDED", marginBottom: "0.75rem" }}>The boundary</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#71717A" }}>Clear in your body. Impossible in your mouth. A boundary is not a punishment — it is a return to alignment.</p>
            </div>
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "#EDEDED", marginBottom: "0.75rem" }}>The grief</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#71717A" }}>Grief changes how everything lands. The same words hit differently.</p>
            </div>
            {/* Row 3 — full width */}
            <div style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #111111 100%)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px", padding: "2.5rem", gridColumn: "span 3", boxShadow: "0 0 40px -10px rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 400, color: "#EDEDED", marginBottom: "0.75rem" }}>The other side</h3>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#A1A1AA", maxWidth: "48rem" }}>Two people can live through the same conversation and leave with completely different truths. The other side may not be lying. They may be living from another map.</p>
              <p style={{ fontSize: "0.875rem", color: "#52525B", marginTop: "1rem", fontStyle: "italic" }}>When both sides matter, invite privately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Baseline Design ────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1rem" }}>The Source</p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EDEDED", marginBottom: "1.5rem" }}>
                Your Baseline Design<br />is the source.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#A1A1AA", marginBottom: "1rem" }}>
                It gives the system a starting point for how you tend to process pressure, conflict, connection, timing, repair, and alignment.
              </p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#52525B", marginBottom: "1rem" }}>
                Not as a label. Not as an excuse. As context.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#A1A1AA", marginBottom: "2rem" }}>
                So the work does not begin with "what is wrong with me?" It begins with "what pattern is active, and what response would actually change it?"
              </p>
              <Link href="https://app.defrag.app/settings" style={{
                background: "transparent", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", padding: "0.625rem 1.5rem",
                fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", display: "inline-block",
              }}>
                Set Your Baseline Design
              </Link>
            </div>
            {/* Structural map visual */}
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.5)" }}>
              <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#52525B", marginBottom: "1.5rem" }}>Active in this moment</p>
              {[
                { label: "Pattern", value: "Repeating loop — boundary negotiation" },
                { label: "Active role", value: "Fixer / carrier / peacekeeper" },
                { label: "What repeats", value: "Pressure → protect → distance → repair" },
                { label: "Next response", value: "Name the pattern before the conversation" },
              ].map((row, i) => (
                <div key={row.label} style={{ display: "flex", gap: "1.5rem", padding: "0.875rem 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#52525B", width: "6rem", flexShrink: 0, paddingTop: "0.1rem" }}>{row.label}</span>
                  <span style={{ fontSize: "0.875rem", color: "#A1A1AA", lineHeight: 1.5 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Spaces ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1rem" }}>The Spaces</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EDEDED", marginBottom: "3rem", maxWidth: "40rem" }}>
            Two guided spaces.<br />One platform.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Defrag */}
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.20)", borderRadius: "6px", padding: "0.25rem 0.625rem", background: "rgba(255,255,255,0.06)", display: "inline-block", marginBottom: "1rem" }}>Defrag space</span>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 400, color: "#EDEDED", letterSpacing: "-0.02em", lineHeight: 1.3 }}>Relational intelligence.</h3>
              </div>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#A1A1AA" }}>
                Defrag helps you work through relational dynamics, family dynamics, boundaries, messages, grief, parenting, and team dynamics. Find the next response that changes the pattern.
              </p>
              <div style={{ borderLeft: "2px solid rgba(255,255,255,0.15)", paddingLeft: "1rem" }}>
                <p style={{ fontSize: "0.8125rem", color: "#71717A" }}>Grounded in your Baseline Design. Saves to your Sovereign.os Library.</p>
              </div>
              <Link href="https://app.defrag.app/apps/defrag" style={{
                background: "#FFFFFF", color: "#000000", borderRadius: "8px",
                padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none", display: "inline-block", alignSelf: "flex-start",
              }}>
                Enter Defrag space
              </Link>
            </div>
            {/* Covenant */}
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "0.25rem 0.625rem", display: "inline-block", marginBottom: "1rem" }}>Covenant space</span>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 400, color: "#EDEDED", letterSpacing: "-0.02em", lineHeight: 1.3 }}>Faith-context reflection.</h3>
              </div>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#A1A1AA" }}>
                Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
              </p>
              <div style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: "1rem" }}>
                <p style={{ fontSize: "0.8125rem", color: "#71717A" }}>Optional. User-initiated. Uses the same Baseline Design as Defrag.</p>
              </div>
              <Link href="/covenant" style={{
                background: "transparent", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none", display: "inline-block", alignSelf: "flex-start",
              }}>
                Learn about Covenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Library ────────────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1rem" }}>The Library</p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EDEDED", marginBottom: "1.5rem" }}>
                Your Library keeps what<br />the moment taught you.
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#A1A1AA", marginBottom: "0.75rem" }}>
                The response you found. The pattern you finally saw. The boundary that became clear.
              </p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "#52525B" }}>
                Save to Sovereign before the moment disappears.
              </p>
            </div>
            <div style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#52525B" }}>Sovereign.os Library</span>
                <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#3F3F46" }}>Private</span>
              </div>
              {[
                { space: "Defrag", label: "Boundary — what I keep negotiating with myself", date: "Jun 6" },
                { space: "Defrag", label: "Family role — the fixer pattern", date: "Jun 4" },
                { space: "Covenant", label: "Covenant Brief — discernment before the decision", date: "Jun 2" },
                { space: "Defrag", label: "Message — before I sent it", date: "May 30" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: item.space === "Covenant" ? "#A1A1AA" : "#EDEDED", border: `1px solid ${item.space === "Covenant" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.20)"}`, borderRadius: "4px", padding: "0.15rem 0.5rem", background: item.space === "Covenant" ? "transparent" : "rgba(255,255,255,0.06)" }}>{item.space}</span>
                    <span style={{ fontSize: "0.8125rem", color: "#71717A" }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.5625rem", color: "#3F3F46", flexShrink: 0, marginLeft: "1rem" }}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1rem" }}>Access</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EDEDED", marginBottom: "0.75rem", maxWidth: "40rem" }}>
            Free is for beginning the work.
          </h2>
          <p style={{ fontSize: "1rem", color: "#71717A", marginBottom: "3rem" }}>Pro is for the patterns that need more than one pass.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: "48rem" }}>
            {pricingTiers.map((tier, i) => (
              <div key={tier.name} style={{
                background: tier.highlight ? "#0A0A0A" : "#050505",
                border: `1px solid ${tier.highlight ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px", padding: "2rem",
                display: "flex", flexDirection: "column", gap: "1.25rem",
                boxShadow: tier.highlight ? "0 0 40px -10px rgba(255,255,255,0.08)" : "none",
              }}>
                {tier.highlight && (
                  <span style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#000000", background: "#FFFFFF", borderRadius: "4px", padding: "0.2rem 0.5rem", display: "inline-block", alignSelf: "flex-start" }}>Recommended</span>
                )}
                <div>
                  <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#52525B", marginBottom: "0.75rem" }}>{tier.name}</p>
                  <div style={{ fontSize: "3rem", fontWeight: 300, letterSpacing: "-0.02em", color: "#EDEDED" }}>
                    {tier.price}<span style={{ fontSize: "0.875rem", color: "#52525B", fontWeight: 400, marginLeft: "0.375rem" }}>{tier.period}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#71717A" }}>{tier.description}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#52525B", marginTop: "0.1rem", flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: "0.8125rem", color: "#71717A" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} style={{
                  display: "block", textAlign: "center",
                  background: tier.highlight ? "#FFFFFF" : "transparent",
                  color: tier.highlight ? "#000000" : "#EDEDED",
                  border: tier.highlight ? "1px solid #FFFFFF" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px", padding: "0.75rem",
                  fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
                }}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "9rem 0", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 70%)" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#52525B", marginBottom: "1.5rem" }}>Start here</p>
          <h2 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#EDEDED", marginBottom: "1.5rem" }}>
            Healing isn't optional.
            <br />
            <span style={{ color: "#3F3F46" }}>Holding the pain is.</span>
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#71717A", maxWidth: "32rem", margin: "0 auto 2.5rem auto" }}>
            Enter Sovereign.os. Set your Baseline Design. Work through what is active. Save what changes.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="https://app.defrag.app/app/login" style={{
              background: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF",
              borderRadius: "8px", padding: "0.875rem 2.5rem",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none", display: "inline-block",
            }}>
              Enter Sovereign.os
            </Link>
            <Link href="https://app.defrag.app/app/login" style={{
              background: "transparent", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", padding: "0.875rem 2.5rem",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none", display: "inline-block",
            }}>
              Start Baseline Design
            </Link>
          </div>
          <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#3F3F46", marginTop: "1.5rem" }}>
            Free tier · No credit card required · 5 sessions/day
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525B", marginBottom: "0.25rem" }}>Sovereign.os</p>
            <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#3F3F46" }}>Defrag · Covenant · Baseline Design · Library</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {["/about", "/product", "/pricing", "/covenant", "/privacy", "/terms", "/contact"].map(href => (
              <Link key={href} href={href} style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#52525B", textDecoration: "none" }}>
                {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}