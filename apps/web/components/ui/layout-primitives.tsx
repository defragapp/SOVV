import * as React from "react"

export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 ${className}`}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export const Section = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={`py-16 md:py-24 lg:py-32 ${className}`}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"
