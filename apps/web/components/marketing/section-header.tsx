export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="h-px w-6 bg-[#e0743a]/60" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
            {eyebrow}
          </span>
        </div>
      ) : null}
      <h2 className="text-headline">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-body-lg">
          {body}
        </p>
      ) : null}
    </div>
  );
}