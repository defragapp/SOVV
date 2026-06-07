import type { ReactNode } from "react";

// MotionSection — renders as a plain section with no animation dependency.
// framer-motion whileInView animations were causing content to remain
// permanently hidden (opacity:0) in the Cloudflare Workers SSR environment
// because JS hydration was not completing before first paint.
// All content must be visible on first server-side render.

export function MotionSection({
  children,
  className = "",
  delay: _delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}