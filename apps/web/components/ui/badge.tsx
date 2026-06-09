import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "pro" | "defrag" | "covenant" | "outline"
}

const variantClasses = {
  default: "bg-white/5 text-[#A1A1AA] border border-white/5",
  pro: "bg-gradient-to-br from-white/10 to-white/5 text-[#FDFDFD] border border-white/25 shadow-[0_0_10px_rgba(255,255,255,0.05)]",
  defrag: "bg-white/10 text-[#FDFDFD] border border-white/25",
  covenant: "bg-transparent text-[#A1A1AA] border border-white/10",
  outline: "bg-transparent text-[#71717A] border border-white/10",
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-widest uppercase transition-all ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
