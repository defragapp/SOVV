"use client";

import { useState } from "react";

export function Composer({
  onSubmit,
  disabled,
  hint
}: {
  onSubmit: (q: string) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="mt-8 sticky bottom-0 bg-black pt-4">
      <div className="rounded-2xl border border-white/10 p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? "Complete baseline settings first" : "What do you want to understand right now?"}
          className="w-full bg-transparent outline-none resize-none min-h-[70px]"
          disabled={disabled}
        />
        {hint ? <div className="mt-2 text-sm text-white/60">{hint}</div> : null}
        <div className="flex justify-end mt-2">
          <button
            onClick={() => {
              if (!disabled && value.trim()) {
                onSubmit(value.trim());
                setValue("");
              }
            }}
            disabled={disabled}
            className="rounded-xl bg-white px-4 py-2 text-black font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Explain
          </button>
        </div>
      </div>
    </div>
  );
}
