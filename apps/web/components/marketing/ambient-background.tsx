"use client"

import { useEffect, useRef } from "react"

interface AmbientBackgroundProps {
  variant?: "warm" | "cool" | "neutral"
  intensity?: "low" | "medium" | "high"
  className?: string
}

/**
 * AmbientBackground — subtle animated radial gradient background.
 * Creates the "holding space" feeling through slow, breathing motion.
 * Respects prefers-reduced-motion.
 */
export function AmbientBackground({
  variant = "warm",
  intensity = "low",
  className = "",
}: AmbientBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)

  const colors = {
    warm: {
      primary: "rgba(224,116,58,",
      secondary: "rgba(240,160,106,",
    },
    cool: {
      primary: "rgba(200,194,188,",
      secondary: "rgba(168,162,154,",
    },
    neutral: {
      primary: "rgba(255,255,255,",
      secondary: "rgba(200,194,188,",
    },
  }

  const opacities = {
    low: { primary: 0.06, secondary: 0.03 },
    medium: { primary: 0.10, secondary: 0.05 },
    high: { primary: 0.15, secondary: 0.08 },
  }

  const c = colors[variant]
  const o = opacities[intensity]

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Primary orb — top left */}
      <div
        className="absolute float"
        style={{
          width: "60%",
          height: "60%",
          top: "-10%",
          left: "-10%",
          background: `radial-gradient(ellipse at center, ${c.primary}${o.primary}) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Secondary orb — bottom right */}
      <div
        className="absolute float-slow"
        style={{
          width: "50%",
          height: "50%",
          bottom: "-10%",
          right: "-10%",
          background: `radial-gradient(ellipse at center, ${c.secondary}${o.secondary}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Center vignette — creates depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(8,7,10,0.4) 100%)",
        }}
      />
    </div>
  )
}

/**
 * SectionGlow — a single warm glow for section CTAs and hero areas.
 */
export function SectionGlow({
  position = "top",
  color = "warm",
}: {
  position?: "top" | "bottom" | "center"
  color?: "warm" | "cool"
}) {
  const positionStyles = {
    top: { top: 0, left: "50%", transform: "translateX(-50%)" },
    bottom: { bottom: 0, left: "50%", transform: "translateX(-50%)" },
    center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  }

  const gradients = {
    warm: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.08) 0%, transparent 70%)",
    cool: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,194,188,0.05) 0%, transparent 70%)",
  }

  return (
    <div
      className="pointer-events-none absolute w-full h-full"
      style={{
        ...positionStyles[position],
        background: gradients[color],
      }}
      aria-hidden
    />
  )
}
