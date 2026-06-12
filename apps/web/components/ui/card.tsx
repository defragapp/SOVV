import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "premium" | "ghost"
}

const variantClasses = {
  default: "bg-surface border border-border",
  elevated: "bg-surface border border-border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
  premium: "bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-border backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
  ghost: "bg-transparent border border-border hover:bg-white/5 transition-colors",
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl overflow-hidden text-[#FDFDFD] ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 flex flex-col space-y-1.5 ${className}`} {...props} />
)

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-semibold leading-none tracking-tight text-[#FDFDFD] ${className}`} {...props} />
)

export const CardDescription = ({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-[#A1A1AA] ${className}`} {...props} />
)

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 flex items-center ${className}`} {...props} />
)
