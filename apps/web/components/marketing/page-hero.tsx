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
    <div className="relative grid-bg border-b border-white/8 px-6 py-28 text-center sm:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070B] via-transparent to-[#05070B] pointer-events-none" />
      <div className="relative mx-auto max-w-3xl">
        {eyebrow && (
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/40">
            {eyebrow}
          </p>
        )}
        <h1 className="hero-glow text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
          {title}
        </h1>
        {body && (
          <p className="mt-6 text-base leading-relaxed text-white/50 sm:text-lg max-w-xl mx-auto">
            {body}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </div>
  );
}