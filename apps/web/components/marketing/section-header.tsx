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
        <p className="mb-3 text-label mx-auto">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-headline text-white">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-body">
          {body}
        </p>
      ) : null}
    </div>
  );
}