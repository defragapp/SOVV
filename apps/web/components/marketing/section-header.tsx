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
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/30">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl leading-tight">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
          {body}
        </p>
      ) : null}
    </div>
  );
}