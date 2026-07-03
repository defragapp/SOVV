import React from 'react';

interface BestNextResponseProps {
  value: string;
  delay?: number;
}

export function BestNextResponse({ value, delay = 0 }: BestNextResponseProps) {
  return (
    <div
      className="p-6 bg-blue-50 border border-blue-100 rounded-lg mt-4 mb-4 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">
        Best Next Response
      </h3>
      <p className="text-blue-900 text-lg font-medium leading-relaxed">
        {value}
      </p>
    </div>
  );
}
