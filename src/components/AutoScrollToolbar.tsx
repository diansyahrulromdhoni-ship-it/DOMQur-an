import React from 'react';
import { Play, Pause, Square, Gauge } from 'lucide-react';
import { AutoScrollState } from '../hooks/useAutoScroll';

interface Props {
  scrollState: AutoScrollState;
  speedMultiplier: number;
  onSetSpeed: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCloseBar: () => void;
}

const SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0, 3.0];

export const AutoScrollToolbar: React.FC<Props> = ({
  scrollState,
  speedMultiplier,
  onSetSpeed,
  onStart,
  onPause,
  onResume,
  onStop,
  onCloseBar
}) => {
  return (
    <aside
      aria-label="Kontrol gulir otomatis tilawah"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 bg-[#151515] border border-[#F6C646]/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-[#262626]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#F6C646]">
          <Gauge className="w-3.5 h-3.5" />
          <span>Auto-Scroll</span>
        </div>
        <button
          onClick={onCloseBar}
          className="text-[11px] text-[#B8B8B8] hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1E1E1E]"
        >
          Sembunyikan
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-1.5">
        {scrollState === 'idle' ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6C646] hover:bg-[#FFD455] text-black font-bold text-xs transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Mulai</span>
          </button>
        ) : scrollState === 'scrolling' ? (
          <button
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6C646] hover:bg-[#FFD455] text-black font-bold text-xs transition shadow-sm"
          >
            <Pause className="w-3.5 h-3.5 fill-black" />
            <span>Jeda</span>
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6C646] hover:bg-[#FFD455] text-black font-bold text-xs transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Lanjutkan</span>
          </button>
        )}

        {scrollState !== 'idle' && (
          <button
            onClick={onStop}
            className="flex items-center justify-center p-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs transition"
            title="Berhenti dan reset"
            aria-label="Berhenti dan reset"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Speed Multipliers */}
      <div className="flex items-center gap-1 pt-1">
        <span className="text-[10px] text-[#888] mr-1">Kecepatan:</span>
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSetSpeed(speed)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
              speedMultiplier === speed
                ? 'bg-[#F6C646] text-black font-bold'
                : 'text-[#B8B8B8] hover:text-white bg-[#1E1E1E]'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </aside>
  );
};
