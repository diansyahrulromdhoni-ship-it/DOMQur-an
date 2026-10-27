import React from 'react';
import { X, BookOpen, Star, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (surahNomor: number, ayahNomor?: number) => void;
}

export const POPULAR_SURAHS = [
  { nomor: 36, name: 'Yasin', arabic: 'يس', ayat: 83, fadhilah: 'Jantungnya Al-Qur\'an, sering dibaca malam Jum\'at' },
  { nomor: 18, name: 'Al-Kahf', arabic: 'الكهف', ayat: 110, fadhilah: 'Penerang di hari Jum\'at & pelindung dari fitnah Dajjal' },
  { nomor: 67, name: 'Al-Mulk', arabic: 'الملك', ayat: 30, fadhilah: 'Penyelamat dan pemberi syafaat dari siksa kubur' },
  { nomor: 55, name: 'Ar-Rahman', arabic: 'الرحمن', ayat: 78, fadhilah: 'Pengingat nikmat-nikmat Allah yang tak terhitung' },
  { nomor: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة', ayat: 96, fadhilah: 'Penangkal kefakiran dan pembuka pintu rezeki' },
  { nomor: 2, name: 'Ayat Kursi (Al-Baqarah: 255)', arabic: 'آية الكرسي', ayat: 286, ayahTarget: 255, fadhilah: 'Ayat paling agung dalam Al-Qur\'an, pelindung dari setan' },
  { nomor: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', ayat: 7, fadhilah: 'Ummul Kitab (Induk Al-Qur\'an) & Asy-Syifa (Penyembuh)' },
  { nomor: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', ayat: 4, fadhilah: 'Menyamai sepertiga dari seluruh Al-Qur\'an' },
  { nomor: 113, name: 'Al-Falaq', arabic: 'الفلق', ayat: 5, fadhilah: 'Al-Mu\'awwidzatain pelindung dari kejahatan makhluk' },
  { nomor: 114, name: 'An-Nas', arabic: 'الناس', ayat: 6, fadhilah: 'Pelindung dari godaan bisikan setan dan manusia' }
];

export const SurahFavoritesModal: React.FC<Props> = ({ isOpen, onClose, onSelectSurah }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#141414] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F6C646]/20 text-[#F6C646]">
              <Star className="w-4 h-4 fill-[#F6C646]" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Surat-Surat Pilihan & Fadhilah</h3>
              <p className="text-[11px] text-[#888]">Lompat cepat ke bacaan yang sering diamalkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of popular surahs */}
        <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
          {POPULAR_SURAHS.map((item) => (
            <button
              key={`${item.nomor}-${item.ayahTarget || ''}`}
              onClick={() => {
                onSelectSurah(item.nomor, item.ayahTarget);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-black border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1A1A1A] transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#151515] border border-[#333] group-hover:border-[#F6C646]/40 flex items-center justify-center text-xs font-bold text-[#F6C646] font-mono shrink-0">
                  {String(item.nomor).padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#B8B8B8] border border-[#262626]">
                      {item.ayat} Ayat
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] line-clamp-1 mt-0.5">
                    {item.fadhilah}
                  </p>
                </div>
              </div>

              <div className="text-right pl-2 shrink-0">
                <span className="font-quran text-lg text-[#FFD455]">
                  {item.arabic}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
