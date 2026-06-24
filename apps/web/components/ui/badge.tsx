import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "pro" | "defrag" | "covenant" | "outline"
}

const variantClasses = {
  default: "bg-white/5 text-[#a8a29a] border border-white/[0.06]",
  pro: "bg-gradient-to-br from-[#e0743a]/15 to-[#e0743a]/5 text-[#f0a06a] border border-[#e0743a]/20 shadow-[0_0_10px_rgba(224,116,58,0.1)]",
  defrag: "bg-[#e0743a]/10 text-[#f0a06a] border border-[#e0743a]/20",
  covenant: "bg-transparent text-[#a8a29a] border border-white/[0.06]",
  outline: "bg-transparent text-[#76716b] border border-white/[0.06]",
}

// No pill/capsule shapes. Badges use 3px radius — compact, restrained.
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-all ${variantClasses[variant]} ${className}`}
        style={{ borderRadius: 3 }}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"