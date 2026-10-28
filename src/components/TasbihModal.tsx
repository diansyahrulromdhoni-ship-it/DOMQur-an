import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, VolumeX, Sparkles, Check, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DHIKR_PRESETS = [
  { id: 'subhanallah', arab: 'سُبْحَانَ اللَّهِ', latin: 'Subhanallah', arti: 'Maha Suci Allah', target: 33 },
  { id: 'alhamdulillah', arab: 'الْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', arti: 'Segala Puji Bagi Allah', target: 33 },
  { id: 'allahuakbar', arab: 'اللَّهُ أَكْبَرُ', latin: 'Allahu Akbar', arti: 'Allah Maha Besar', target: 33 },
  { id: 'istighfar', arab: 'أَسْتَغْفِرُ اللَّهَ', latin: 'Astaghfirullah', arti: 'Aku memohon ampun kepada Allah', target: 33 },
  { id: 'tahlil', arab: 'لَا إِلَهَ إِلَّا اللَّهُ', latin: 'La ilaha illallah', arti: 'Tiada Tuhan selain Allah', target: 100 }
];

export const TasbihModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [rounds, setRounds] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);

  useEffect(() => {
    setCount(0);
    setTarget(selectedDhikr.target);
  }, [selectedDhikr]);

  if (!isOpen) return null;

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio error
    }
  };

  const handleIncrement = () => {
    playClickSound();

    if (vibrateEnabled && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }

    const nextCount = count + 1;
    if (nextCount >= target) {
      if (vibrateEnabled && 'vibrate' in navigator) {
        navigator.vibrate([60, 50, 60]);
      }
      setCount(0);
      setRounds((prev) => prev + 1);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    setRounds(0);
  };

  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-[#222222] relative">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <Sparkles className="w-4 h-4 fill-[#C49A3A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#222222]">Tasbih Digital</h3>
              <p className="text-[11px] text-[#737373]">Hitung dzikir & wirid harian</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                soundEnabled ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A]' : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
              }`}
              title={soundEnabled ? 'Suara aktif' : 'Suara nonaktif'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dhikr Selector Chips */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs">
          {DHIKR_PRESETS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDhikr(item)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
                selectedDhikr.id === item.id
                  ? 'bg-[#C49A3A] text-white shadow-xs'
                  : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border border-[#EAEAEA]'
              }`}
            >
              {item.latin}
            </button>
          ))}
        </div>

        {/* Active Dhikr Display */}
        <div className="w-full text-center py-2 space-y-1">
          <p className="font-quran text-2xl sm:text-3xl text-[#C49A3A] font-bold">
            {selectedDhikr.arab}
          </p>
          <p className="text-xs font-semibold text-[#222222]">{selectedDhikr.latin}</p>
          <p className="text-[11px] text-[#737373] italic">"{selectedDhikr.arti}"</p>
        </div>

        {/* Main Counter Interactive Circle */}
        <div className="py-4 relative flex flex-col items-center justify-center">
          <button
            onClick={handleIncrement}
            className="w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-white to-[#FAF3DF] border-4 border-[#E5BD58] shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer group select-none relative"
            aria-label="Tekan untuk menambah hitungan tasbih"
          >
            {/* Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                className="text-[#EAEAEA]"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                className="text-[#C49A3A] transition-all duration-150"
                strokeWidth="4"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <span className="font-mono text-5xl sm:text-6xl font-black text-[#222222] tracking-tighter">
              {count}
            </span>
            <span className="text-xs text-[#737373] font-medium mt-1">
              Target: <strong className="text-[#C49A3A]">{target}</strong>
            </span>
            <span className="text-[11px] text-[#C49A3A] font-semibold mt-0.5 group-hover:scale-105 transition-transform">
              Ketuk untuk Dzikir
            </span>
          </button>
        </div>

        {/* Target Buttons & Rounds Counter */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-[#EAEAEA] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#737373]">Putaran Selesai:</span>
            <span className="px-2 py-0.5 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-bold border border-[#E5BD58]/40">
              {rounds}x
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[33, 99, 100].map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                  target === t
                    ? 'bg-[#C49A3A] text-white shadow-2xs'
                    : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border border-[#EAEAEA]'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="w-7 h-7 rounded-lg bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition ml-1"
              title="Reset hitungan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
