import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, X, Bell, BookOpen, Check, Heart } from 'lucide-react';
import { audioManager, ActiveAudioAlert } from '../services/audioManager';

interface Props {
  alert: ActiveAudioAlert;
  onClose: () => void;
}

export const AdzanAlertModal: React.FC<Props> = ({ alert, onClose }) => {
  const [showDua, setShowDua] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const settings = audioManager.getSettings();

  const handleTogglePlay = () => {
    audioManager.togglePlayPause();
  };

  const handleStop = () => {
    audioManager.stopAudio();
    onClose();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioManager.saveSettings({ volume: val });
  };

  const handleCopyDua = () => {
    const text = `Doa Setelah Adzan:\n\nاللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ\n\nAllahumma rabba hadzihid-da'watit-tammah, wash-shalaatil-qa'imah, aati Muhammadanil-wasilata wal-fadhilah, wab'atshu maqamam mahmudalladzi wa'adtah.\n\n"Ya Allah, Tuhan Pemilik seruan yang sempurna ini dan sholat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta tempatkanlah ia pada kedudukan terpuji yang telah Engkau janjikan." (HR. Bukhari no. 614)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141414] border-2 border-[#F6C646]/70 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-[#F6C646]/20 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#F6C646]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F6C646]/20 text-[#F6C646]">
              <Bell className="w-4 h-4 animate-bounce" />
            </span>
            <span className="text-xs font-bold text-[#F6C646] tracking-wider uppercase">
              {alert.isTest ? 'Uji Coba Sistem Audio' : 'Panggilan Waktu Ibadah'}
            </span>
          </div>

          <button
            onClick={handleStop}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#262626] transition"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Announcement Banner */}
        <div className="text-center py-4 space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-black/60 border border-[#F6C646]/40 text-xs font-semibold text-[#FFD455]">
            {alert.locationName} • Pukul {alert.timeStr}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {alert.title}
          </h2>

          <p className="font-quran text-2xl text-[#FFD455] py-1 leading-relaxed">
            حَيَّ عَلَى ٱلصَّلَاةِ • حَيَّ عَلَى ٱلْفَلَاحِ
          </p>
          <p className="text-xs text-[#B8B8B8] italic">
            "{alert.subtitle}"
          </p>
        </div>

        {/* Audio Player Controls */}
        <div className="bg-black/70 border border-[#262626] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#B8B8B8] font-medium">Status Pemutaran Audio:</span>
            <span className={`font-semibold flex items-center gap-1.5 ${alert.isPlaying ? 'text-[#F6C646]' : 'text-[#888]'}`}>
              {alert.isPlaying ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#F6C646] animate-pulse" />
                  Sedang Mengumandangkan Suara
                </>
              ) : (
                'Dijeda / Berhenti'
              )}
            </span>
          </div>

          {alert.error && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
              <VolumeX className="w-4 h-4 shrink-0 text-red-400" />
              <span>{alert.error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTogglePlay}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-[#F6C646]/20"
            >
              {alert.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Lanjutkan Audio</span>
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              className="py-2.5 px-4 rounded-xl bg-[#262626] hover:bg-[#333] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 pt-2">
            <Volume2 className="w-4 h-4 text-[#888]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              defaultValue={settings.volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#F6C646] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#AAA] w-8 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        {/* Collapsible Doa Setelah Adzan */}
        <div className="mt-4 pt-3 border-t border-[#262626]">
          <button
            onClick={() => setShowDua(!showDua)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#FFD455] hover:text-[#F6C646] transition py-1"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{showDua ? 'Sembunyikan Doa Setelah Adzan' : 'Tampilkan Doa Setelah Adzan'}</span>
            </span>
            <span className="text-[10px] text-[#888]">{showDua ? '▲' : '▼'}</span>
          </button>

          {showDua && (
            <div className="mt-3 p-4 rounded-2xl bg-black/60 border border-[#262626] space-y-3 animate-in fade-in duration-150">
              <p className="font-quran text-right text-base sm:text-lg text-white leading-loose select-text" dir="rtl">
                اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
              </p>
              <p className="text-xs text-[#FFD455] italic">
                Allahumma rabba hadzihid-da'watit-tammah, wash-shalaatil-qa'imah, aati Muhammadanil-wasilata wal-fadhilah, wab'atshu maqamam mahmudalladzi wa'adtah.
              </p>
              <p className="text-xs text-[#AAA]">
                "Ya Allah, Tuhan yang memiliki seruan yang sempurna ini, dan sholat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta tempatkanlah ia pada kedudukan terpuji yang telah Engkau janjikan." (HR. Bukhari no. 614)
              </p>
              <button
                onClick={handleCopyDua}
                className="w-full py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-xs font-medium text-[#CCC] hover:text-white flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{copied ? 'Doa Berhasil Disalin' : 'Salin Teks Doa'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
