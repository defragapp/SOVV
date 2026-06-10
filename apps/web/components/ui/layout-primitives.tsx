import * as React from "react";

export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full max-w-full ${className}`}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

export const Section = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={`${className}`}
        {...props}
      />
    );
  }
);
Section.displayName = "Section";
