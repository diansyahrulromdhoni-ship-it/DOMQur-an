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
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 bg-white border border-[#EAEAEA] rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-4 text-[#222222]"
    >
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#EAEAEA]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C49A3A]">
          <div className="w-6 h-6 rounded-lg bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <span>Auto-Scroll Tilawah</span>
        </div>
        <button
          onClick={onCloseBar}
          className="text-[11px] text-[#737373] hover:text-[#222222] px-2 py-0.5 rounded-lg hover:bg-[#F8F8F8] transition"
        >
          Tutup
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2">
        {scrollState === 'idle' ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Mulai Gulir</span>
          </button>
        ) : scrollState === 'scrolling' ? (
          <button
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-xs"
          >
            <Pause className="w-3.5 h-3.5 fill-white" />
            <span>Jeda</span>
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Lanjut</span>
          </button>
        )}

        <button
          onClick={onStop}
          disabled={scrollState === 'idle'}
          title="Hentikan & Reset Posisi"
          aria-label="Hentikan gulir otomatis"
          className="w-8 h-8 rounded-xl bg-[#F8F8F8] hover:bg-rose-50 border border-[#EAEAEA] hover:border-rose-300 text-[#737373] hover:text-rose-600 flex items-center justify-center transition disabled:opacity-40"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Speed Selector Chips */}
      <div className="flex items-center gap-1 pt-0.5">
        <span className="text-[10px] text-[#737373] mr-0.5">Kecepatan:</span>
        {SPEED_OPTIONS.map((spd) => {
          const isActive = speedMultiplier === spd;
          return (
            <button
              key={spd}
              onClick={() => onSetSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition ${
                isActive
                  ? 'bg-[#FAF3DF] text-[#C49A3A] border border-[#E5BD58]'
                  : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border border-[#EAEAEA]'
              }`}
            >
              {spd}x
            </button>
          );
        })}
      </div>
    </aside>
  );
};
