import React from 'react';
import { X, Star, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-[#EAEAEA] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] text-[#222222]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <Star className="w-5 h-5 fill-[#C49A3A]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#222222]">Surat-Surat Pilihan & Fadhilah</h3>
              <p className="text-xs text-[#737373]">Lompat cepat ke bacaan yang sering diamalkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#EAEAEA] flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of popular surahs */}
        <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
          {POPULAR_SURAHS.map((item) => (
            <button
              key={`${item.nomor}-${item.ayahTarget || ''}`}
              onClick={() => {
                onSelectSurah(item.nomor, item.ayahTarget);
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:bg-[#FAF3DF]/40 transition text-left group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] group-hover:bg-[#C49A3A] group-hover:text-white transition flex items-center justify-center text-xs font-bold text-[#C49A3A] font-mono shrink-0 shadow-2xs">
                  {item.ayahTarget ? '★' : String(item.nomor).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-[#737373] shrink-0">({item.ayat} ayat)</span>
                  </div>
                  <p className="text-xs text-[#737373] line-clamp-1 mt-0.5">{item.fadhilah}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="font-quran text-lg text-[#C49A3A] hidden sm:inline">
                  {item.arabic}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] group-hover:bg-[#FAF3DF] text-[#737373] group-hover:text-[#C49A3A] flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
