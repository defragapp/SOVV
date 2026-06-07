import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div style={{ background: "#05070B", borderBottom: "1px solid rgba(246,245,243,0.08)", padding: "7rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
        {eyebrow && (
          <p style={{ fontFamily: "monospace", fontSize: "0.5625rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(246,245,243,0.28)", marginBottom: "1.5rem" }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#F6F5F3", margin: "0 0 1.5rem 0" }}>
          {title}
        </h1>
        {body && (
          <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(246,245,243,0.55)", maxWidth: "36rem", margin: "0 auto" }}>
            {body}
          </p>
        )}
        {children && <div style={{ marginTop: "2.5rem" }}>{children}</div>}
      </div>
    </div>
  );
}