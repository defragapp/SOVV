import React from 'react';

interface DefragPanelProps {
  label: string;
  value: string;
  delay?: number;
}

export function DefragPanel({ label, value, delay = 0 }: DefragPanelProps) {
  return (
    <div
      className="p-4 border-b border-gray-100 last:border-b-0 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </h3>
      <p className="text-gray-800 text-base leading-relaxed">
        {value}
      </p>
    </div>
  );
}
