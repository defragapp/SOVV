export function Chips({
  groups,
  onPick
}: {
  groups: { title: string; chips: string[] }[];
  onPick: (q: string) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((g, idx) => (
        <div key={idx}>
          <div className="text-xs text-white/50 mb-2">{g.title}</div>
          <div className="flex flex-wrap gap-2">
            {g.chips.slice(0, 6).map((c, i) => (
              <button
                key={i}
                onClick={() => onPick(c)}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/90 hover:bg-white hover:text-black transition"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
