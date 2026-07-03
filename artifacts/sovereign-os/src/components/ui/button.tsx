import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * buttonVariants — CVA function used by alert-dialog, calendar, pagination.
 *
 * Token alignment (Phase 22):
 *   Shape  : slab (rounded-2xl = 16px) for all solid variants; input (rounded-xl = 12px) for ghost
 *   Colors : strictly from the Sovereign palette — no #f0a06a, no #e8e2da, no ad-hoc opacities
 *   Hover  : opacity-based only — no fill transitions
 *   Font   : font-mono uppercase for all variants (OS aesthetic)
 */
export const buttonVariants = cva(
  // Base — structural + interaction
  "inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.12em] font-semibold transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e0743a]/30 disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Cream primary — top-level CTAs
        default:     "rounded-2xl bg-[#f4efe9] text-[#08070a] hover:opacity-90",
        primary:     "rounded-2xl bg-[#f4efe9] text-[#08070a] hover:opacity-90",
        // Glass secondary — frosted surface
        secondary:   "rounded-2xl bg-white/[0.04] text-[#f4efe9] ring-1 ring-inset ring-white/[0.10] backdrop-blur-md hover:opacity-80",
        // Outline — same glass surface, muted text
        outline:     "rounded-2xl bg-white/[0.04] text-[#a8a29a] ring-1 ring-inset ring-white/[0.10] backdrop-blur-sm hover:opacity-80",
        // Ghost — transparent, minimal
        ghost:       "rounded-xl bg-transparent text-[#a8a29a] hover:opacity-70",
        // Premium — amber accent ring
        premium:     "rounded-2xl bg-[#e0743a]/10 text-[#f4efe9] ring-1 ring-inset ring-[#e0743a]/20 backdrop-blur-md hover:opacity-90",
        // Destructive — red tint
        destructive: "rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20 hover:opacity-80",
        // Link — underline only
        link:        "text-[#a8a29a] underline-offset-4 hover:underline hover:opacity-80",
      },
      size: {
        default: "px-6 py-3 text-sm",
        sm:      "px-3 py-2 text-xs",
        md:      "px-6 py-3 text-sm",
        lg:      "px-8 py-4 text-base",
        icon:    "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
