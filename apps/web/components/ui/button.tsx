import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "premium"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

// No pill/capsule shapes. All variants use controlled radius.
const variantClasses = {
  primary:
    "bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] border border-transparent",
  secondary:
    "bg-white/5 text-[#f4efe9] border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
  ghost:
    "bg-transparent text-[#a8a29a] hover:text-[#f4efe9] hover:bg-white/5 border border-transparent",
  premium:
    "bg-[#e0743a]/10 text-[#f0a06a] border border-[#e0743a]/20 hover:bg-[#e0743a]/20 hover:border-[#e0743a]/40 backdrop-blur-md shadow-[0_0_20px_rgba(224,116,58,0.1)]",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

// Radius: 8px for primary/secondary/premium, 6px for ghost
const radiusClasses = {
  primary: "rounded-[8px]",
  secondary: "rounded-[8px]",
  ghost: "rounded-[6px]",
  premium: "rounded-[8px]",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e0743a]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${radiusClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"