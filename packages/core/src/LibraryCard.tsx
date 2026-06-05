import { DefragPayload, LibraryItem } from "@sovv/core";

interface LibraryCardProps {
  item: LibraryItem;
}

export function LibraryCard({ item }: LibraryCardProps) {
  const isDefrag = item.workspace_source === "DEFRAG";

  return (
    <div className="border border-white bg-black rounded-none p-4 font-mono text-white text-sm">
      {item.title && <h3 className="font-bold text-lg mb-2">{item.title}</h3>}

      {isDefrag ? (
        <div className="space-y-3">
          <div>
            <p className="text-white/60">What Got Lit Up:</p>
            <p>{(item.payload as DefragPayload).active_now}</p>
          </div>
          <div>
            <p className="text-white/60">Alignment:</p>
            <p>{(item.payload as DefragPayload).alignment}</p>
          </div>
          <div>
            <p className="text-white/60">Best Next Response:</p>
            <p>{(item.payload as DefragPayload).best_next_response}</p>
          </div>
        </div>
      ) : (
        <pre className="text-xs text-white/50 whitespace-pre-wrap">{JSON.stringify(item.payload, null, 2)}</pre>
      )}
    </div>
  );
}