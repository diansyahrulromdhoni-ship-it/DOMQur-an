import React, { useEffect, useState } from 'react';
import { X, BookOpen, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { quranApi } from '../services/quranApi';
import { TafsirDetail } from '../types/quran';

interface Props {
  surahNomor: number;
  surahLatin: string;
  ayahNomor: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TafsirModal: React.FC<Props> = ({
  surahNomor,
  surahLatin,
  ayahNomor,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirDetail | null>(null);

  const fetchTafsir = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quranApi.getTafsirDetail(surahNomor);
      setTafsirData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat tafsir dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && surahNomor) {
      fetchTafsir();
    }
  }, [isOpen, surahNomor]);

  if (!isOpen) return null;

  // Find specific ayah tafsir
  const ayahTafsir = tafsirData?.tafsir?.find((t) => t.ayat === ayahNomor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-white border border-[#EAEAEA] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-[#222222]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tafsir-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tafsir-title" className="text-sm sm:text-base font-bold text-[#222222]">
                Tafsir Kemenag RI — QS. {surahLatin}:{ayahNomor}
              </h2>
              <p className="text-xs text-[#737373]">
                Kementerian Agama Republik Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#EAEAEA] flex items-center justify-center transition"
            aria-label="Tutup tafsir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-[#C49A3A] animate-spin" />
              <p className="text-xs text-[#737373]">Memuat teks tafsir resmi Kemenag RI...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-rose-700">{error}</p>
              <button
                onClick={fetchTafsir}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-300 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : ayahTafsir ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
                <span className="px-3 py-1 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-bold text-xs border border-[#E5BD58]/30">
                  Ayat ke-{ayahTafsir.ayat}
                </span>
                <span className="text-xs text-[#737373]">Tafsir Ringkas / Tahlili</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] text-xs sm:text-sm text-[#222222] leading-relaxed sm:leading-loose whitespace-pre-line font-serif">
                {ayahTafsir.teks}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#737373]">
              Tafsir untuk ayat ini belum tersedia dari penyedia data.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#EAEAEA] bg-[#F8F8F8] flex items-center justify-between text-xs text-[#737373]">
          <span>Sumber: EQuran.id & Kemenag RI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] text-xs font-semibold text-[#222222] transition shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
