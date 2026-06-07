import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative border-b border-white/8 px-6 py-28 text-center sm:py-36 grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070B] via-transparent to-[#05070B] pointer-events-none" />
      <div className="relative mx-auto max-w-3xl">
        {eyebrow && (
          <p className="mb-4 text-label mx-auto">
            {eyebrow}
          </p>
        )}
        <h1 className="text-headline text-white mt-4">
          {title}
        </h1>
        {body && (
          <p className="mt-6 text-body max-w-xl mx-auto">
            {body}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </div>
  );
}