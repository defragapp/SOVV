import * as React from "react"
import { cn } from "@/lib/utils"

// ── Container ─────────────────────────────────────────────────────────────────
// A centered, horizontally padded wrapper with a sensible max-width.

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Override the default max-width class */
  maxWidth?: string
}

export function Container({
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 md:px-8 lg:px-10", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
// A full-width semantic <section> element. Pair with Container for inset content.

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {}

export function Section({
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </section>
  )
}
