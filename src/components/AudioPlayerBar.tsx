import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, AlertCircle, Loader2 } from 'lucide-react';
import { audioService, AudioState } from '../services/audioService';
import { RECITERS } from '../config';

export const AudioPlayerBar: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Do not show if no audio has ever been loaded
  if (!audioState.surahNomor && !audioState.isPlaying && !audioState.isLoading && !audioState.error) {
    return null;
  }

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQari = RECITERS.find((r) => r.id === audioState.reciterId)?.name || 'Murottal Al-Qur\'an';

  const progressPercent = audioState.duration > 0
    ? (audioState.currentTime / audioState.duration) * 100
    : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    audioService.seek(newTime);
  };

  return (
    <div className="fixed bottom-16 landscape:bottom-12 md:bottom-0 left-0 right-0 z-40 bg-[#121212]/95 border-t border-[#262626] backdrop-blur-md px-3 sm:px-6 py-2 landscape:py-1.5 md:py-2.5 shadow-2xl transition-all">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        {/* Progress Bar (interactive slider) */}
        <div className="flex items-center gap-2 text-[11px] text-[#B8B8B8]">
          <span className="w-9 text-right font-mono">{formatTime(audioState.currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={audioState.duration || 100}
              step={0.5}
              value={audioState.currentTime}
              onChange={handleSeek}
              disabled={!audioState.duration}
              aria-label="Seek audio"
              className="w-full h-1.5 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-[#F6C646] hover:h-2 transition-all"
              style={{
                background: `linear-gradient(to right, #F6C646 ${progressPercent}%, #262626 ${progressPercent}%)`
              }}
            />
          </div>
          <span className="w-9 font-mono">{formatTime(audioState.duration)}</span>
        </div>

        {/* Controls and Track Info */}
        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#F6C646]/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#F6C646] font-mono">
                {audioState.surahNomor ? String(audioState.surahNomor).padStart(2, '0') : 'Q'}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                {audioState.surahName || 'Surat'}
                {audioState.ayahNomor !== null && (
                  <span className="text-[#F6C646] ml-1.5 font-normal">
                    : Ayat {audioState.ayahNomor}
                  </span>
                )}
                {audioState.ayahNomor === null && (
                  <span className="text-[#B8B8B8] ml-1.5 text-[11px] font-normal">
                    (Murottal Lengkap)
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[#B8B8B8] truncate">{currentQari}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {audioState.error ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 px-2 py-1 rounded-md border border-rose-800/40">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Koneksi bermasalah</span>
              </div>
            ) : null}

            {audioState.isLoading ? (
              <button
                disabled
                className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#262626] flex items-center justify-center text-[#F6C646]"
                aria-label="Memuat audio"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </button>
            ) : audioState.isPlaying ? (
              <button
                onClick={() => audioService.pause()}
                className="w-9 h-9 rounded-full bg-[#F6C646] hover:bg-[#FFD455] text-black flex items-center justify-center transition shadow-md"
                aria-label="Jeda pemutaran"
              >
                <Pause className="w-4 h-4 fill-black" />
              </button>
            ) : (
              <button
                onClick={() => audioService.resume()}
                className="w-9 h-9 rounded-full bg-[#F6C646] hover:bg-[#FFD455] text-black flex items-center justify-center transition shadow-md"
                aria-label="Lanjutkan pemutaran"
              >
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              </button>
            )}

            <button
              onClick={() => audioService.stop()}
              className="p-2 text-[#B8B8B8] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition"
              title="Tutup pemutar audio"
              aria-label="Tutup pemutar audio"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
