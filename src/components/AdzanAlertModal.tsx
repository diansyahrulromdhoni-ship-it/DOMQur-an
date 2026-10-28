import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, X, Bell, BookOpen, Check, Copy } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#E5BD58] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto text-[#222222]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#C49A3A] tracking-wider uppercase block">
                {alert.isTest ? 'Uji Coba Suara Audio' : 'Panggilan Waktu Ibadah'}
              </span>
              <span className="text-[11px] text-[#737373]">My Dom Qur'an Pengingat Salat</span>
            </div>
          </div>

          <button
            onClick={handleStop}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#EAEAEA] flex items-center justify-center transition"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Alert Details */}
        <div className="py-6 text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF3DF] border-2 border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-md animate-pulse">
            <Volume2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#222222] tracking-tight">{alert.title}</h2>
            <p className="text-sm font-semibold text-[#C49A3A]">{alert.subtitle}</p>
            <p className="text-xs text-[#737373] max-w-xs mx-auto leading-relaxed">{alert.locationName} • {alert.timeStr}</p>
          </div>
        </div>

        {/* Audio Controls Bar */}
        <div className="bg-[#F8F8F8] border border-[#EAEAEA] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-center text-[#737373]">
                {settings.volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#C49A3A]" />}
              </div>
              <span className="text-xs font-semibold text-[#222222]">Volume Audio:</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#C49A3A]">{Math.round(settings.volume * 100)}%</span>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={handleVolumeChange}
            aria-label="Atur volume audio"
            className="w-full h-2 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#C49A3A]"
          />

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF3DF] hover:bg-[#C49A3A] text-[#C49A3A] hover:text-white border border-[#E5BD58] font-bold text-xs transition shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-white/70 flex items-center justify-center">
                {alert.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </div>
              <span>{alert.isPlaying ? 'Jeda Suara' : 'Lanjutkan Putar'}</span>
            </button>

            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
                <Square className="w-3 h-3 fill-current" />
              </div>
              <span>Hentikan Suara</span>
            </button>
          </div>
        </div>

        {/* Toggle Dua Setelah Adzan Accordion */}
        <div className="mt-4 pt-4 border-t border-[#EAEAEA] space-y-3">
          <button
            onClick={() => setShowDua(!showDua)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF3DF]/60 border border-[#E5BD58]/40 hover:bg-[#FAF3DF] text-[#C49A3A] transition text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span>{showDua ? 'Sembunyikan Doa Setelah Adzan' : 'Tampilkan Doa Setelah Adzan & Fadhilah'}</span>
            </div>
            <span>{showDua ? '▲' : '▼'}</span>
          </button>

          {showDua && (
            <div className="p-4 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#222222]">Doa Setelah Adzan Sesuai Sunnah</span>
                <button
                  onClick={handleCopyDua}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] hover:border-[#E5BD58] text-[11px] text-[#737373] hover:text-[#C49A3A] transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Tersalin' : 'Salin Doa'}</span>
                </button>
              </div>

              <p className="font-quran text-right text-base sm:text-lg leading-loose text-[#222222]" dir="rtl">
                اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
              </p>

              <div className="space-y-1 text-xs">
                <p className="text-[#C49A3A] font-medium italic">
                  Allahumma rabba hadzihid-da'watit-tammah, wash-shalaatil-qa'imah, aati Muhammadanil-wasilata wal-fadhilah, wab'atshu maqamam mahmudalladzi wa'adtah.
                </p>
                <p className="text-[#555555] leading-relaxed">
                  "Ya Allah, Tuhan Pemilik seruan yang sempurna ini dan sholat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta tempatkanlah ia pada kedudukan terpuji yang telah Engkau janjikan."
                </p>
                <span className="text-[11px] text-[#737373] block pt-1">(HR. Bukhari no. 614)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
