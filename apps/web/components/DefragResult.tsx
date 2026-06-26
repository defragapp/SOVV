import React, { useState } from 'react';
import { DefragPanel } from './DefragPanel';
import { BestNextResponse } from './BestNextResponse';

// Define the shape (could also import from the schema)
interface DefragResultData {
  title: string;
  summary: string;
  whatsActive: string;
  activePattern: string;
  theRepeat: string;
  pressure: string;
  whatHelps: string;
  bestNextResponse: string;
  limits: string;
  confidence: string;
}

interface DefragResultProps {
  data: DefragResultData;
  onSave?: () => Promise<void> | void;
  onRerun?: () => void;
}

export function DefragResult({ data, onSave, onRerun }: DefragResultProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Base delay for stagger effect
  const baseDelay = 150;

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-medium text-gray-500">Defrag</span>
        <span className="text-sm font-semibold text-gray-800">{data.title}</span>
        <div className="flex items-center space-x-3">
          {onRerun && (
             <button
             onClick={onRerun}
             className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
           >
             Rerun
           </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`text-sm font-medium transition-colors ${saveSuccess ? 'text-green-600' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Sovereign'}
          </button>
        </div>
      </div>

      {/* Summary Rail */}
      <div className="p-6 md:p-8 bg-gray-900 text-white animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <h2 className="text-xl md:text-2xl font-medium leading-tight text-white/90">
          {data.summary}
        </h2>
      </div>

      {/* Main Content Panels */}
      <div className="flex flex-col md:flex-row border-b border-gray-100">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100">
          <DefragPanel label="What's active" value={data.whatsActive} delay={baseDelay * 1} />
        </div>
        <div className="flex-1">
          <DefragPanel label="Active pattern" value={data.activePattern} delay={baseDelay * 2} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row border-b border-gray-100">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100">
          <DefragPanel label="The Repeat" value={data.theRepeat} delay={baseDelay * 3} />
        </div>
        <div className="flex-1">
          <DefragPanel label="Where the pressure is" value={data.pressure} delay={baseDelay * 4} />
        </div>
      </div>

      <div className="px-2">
        <DefragPanel label="What gives this moment a better chance" value={data.whatHelps} delay={baseDelay * 5} />
      </div>

      {/* Best Next Response (Highlighted) */}
      <div className="px-6 pb-2">
         <BestNextResponse value={data.bestNextResponse} delay={baseDelay * 6} />
      </div>

      {/* Bottom Utility Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm">
        <button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className={`w-full sm:w-auto mb-3 sm:mb-0 px-4 py-2 font-medium rounded transition-colors ${saveSuccess ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved to Library ✓' : 'Save to Sovereign'}
        </button>

        <div className="flex items-center space-x-4 text-gray-500">
          <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium text-gray-700">
            Confidence: {data.confidence}
          </span>
          <span className="text-xs max-w-xs text-right hidden md:block" title={data.limits}>
            About this result
          </span>
        </div>
      </div>

    </div>
  );
}
