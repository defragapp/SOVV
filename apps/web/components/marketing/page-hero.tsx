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
    <div style={{
      background: "#05070B",
      borderBottom: "1px solid rgba(246,245,243,0.10)",
      padding: "6rem 2rem 5rem",
      textAlign: "center",
      backgroundImage: "linear-gradient(rgba(246,245,243,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(246,245,243,0.025) 1px, transparent 1px)",
      backgroundSize: "64px 64px",
    }}>
      <div style={{ maxWidth: "52rem", margin: "0 auto" }}>
        {eyebrow && (
          <p style={{
            fontFamily: "'JetBrains Mono', 'Cascadia Code', ui-monospace, Menlo, monospace",
            fontSize: "0.6875rem", letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(246,245,243,0.40)", marginBottom: "1.5rem",
          }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{
          fontSize: "clamp(2rem, 4vw, 3.25rem)",
          fontWeight: 300,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "#F6F5F3",
          marginBottom: body ? "1.5rem" : 0,
        }}>
          {title}
        </h1>
        {body && (
          <p style={{
            fontSize: "1.0625rem",
            lineHeight: 1.75,
            color: "rgba(246,245,243,0.55)",
            maxWidth: "38rem",
            margin: "0 auto",
          }}>
            {body}
          </p>
        )}
        {children && <div style={{ marginTop: "2.5rem" }}>{children}</div>}
      </div>
    </div>
  );
}