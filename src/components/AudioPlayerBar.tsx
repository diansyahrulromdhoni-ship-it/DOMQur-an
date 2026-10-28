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
    <div className="fixed bottom-16 landscape:bottom-12 md:bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#EAEAEA] backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-lg transition-all text-[#222222]">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        {/* Progress Bar (interactive slider) */}
        <div className="flex items-center gap-2 text-[11px] text-[#737373]">
          <span className="w-10 text-right font-mono text-[#222222] font-semibold">{formatTime(audioState.currentTime)}</span>
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
              className="w-full h-1.5 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#C49A3A] hover:h-2 transition-all"
              style={{
                background: `linear-gradient(to right, #C49A3A ${progressPercent}%, #EAEAEA ${progressPercent}%)`
              }}
            />
          </div>
          <span className="w-10 font-mono text-[#737373]">{formatTime(audioState.duration)}</span>
        </div>

        {/* Info & Main Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Track metadata */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center font-mono font-bold text-xs text-[#C49A3A] shrink-0 shadow-2xs">
              {audioState.surahNomor ? String(audioState.surahNomor).padStart(2, '0') : '♪'}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-[#222222] truncate">
                {audioState.surahName ? `Surat ${audioState.surahName}` : 'Murottal Al-Qur\'an'}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#737373] truncate">
                {audioState.error ? (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" /> {audioState.error}
                  </span>
                ) : (
                  currentQari
                )}
              </p>
            </div>
          </div>

          {/* Player action controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => audioService.togglePlayPause()}
              disabled={audioState.isLoading}
              aria-label={audioState.isPlaying ? 'Jeda murottal' : 'Putar murottal'}
              className="w-9 h-9 rounded-xl bg-[#FAF3DF] hover:bg-[#C49A3A] text-[#C49A3A] hover:text-white border border-[#E5BD58] flex items-center justify-center transition shadow-2xs disabled:opacity-50"
            >
              {audioState.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#C49A3A]" />
              ) : audioState.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={() => audioService.stop()}
              aria-label="Hentikan audio"
              className="w-9 h-9 rounded-xl bg-[#F8F8F8] hover:bg-rose-50 text-[#737373] hover:text-rose-600 border border-[#EAEAEA] hover:border-rose-300 flex items-center justify-center transition"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
