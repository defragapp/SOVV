import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "premium"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const variantClasses = {
  primary: "bg-[#FDFDFD] text-[#020202] hover:bg-[#E5E5E5] active:scale-[0.97] shadow-[0_4px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_16px_rgba(255,255,255,0.25)] border border-transparent rounded-full",
  secondary: "bg-white/5 text-[#FDFDFD] border border-border hover:bg-white/10 hover:border-border active:scale-[0.98] backdrop-blur-md rounded-xl",
  ghost: "bg-transparent text-[#A1A1AA] hover:text-[#FDFDFD] hover:bg-white/5 border border-transparent rounded-lg",
  premium: "bg-white/5 text-[#FDFDFD] border border-border hover:bg-white/10 hover:border-border active:scale-[0.98] backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
