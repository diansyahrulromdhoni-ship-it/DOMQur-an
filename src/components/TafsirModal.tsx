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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-[#151515] border border-[#262626] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tafsir-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#F6C646]/40 flex items-center justify-center text-[#F6C646]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="tafsir-title" className="text-base font-bold text-white">
                Tafsir {surahLatin} : Ayat {ayahNomor}
              </h3>
              <p className="text-xs text-[#B8B8B8]">Sumber: Kemenag RI (equran.id API v2)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#B8B8B8] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition"
            aria-label="Tutup tafsir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed text-[#EDEDED] space-y-4">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#B8B8B8]">
              <Loader2 className="w-7 h-7 text-[#F6C646] animate-spin" />
              <p className="text-xs">Memuat penjelasan tafsir...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200">{error}</p>
              <button
                onClick={fetchTafsir}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#262626] text-white text-xs rounded-lg transition border border-[#333333]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {!loading && !error && (
            <div>
              {ayahTafsir ? (
                <div className="whitespace-pre-line text-sm text-[#E0E0E0] leading-relaxed selection:bg-[#F6C646] selection:text-black">
                  {ayahTafsir.teks}
                </div>
              ) : (
                <div className="text-center py-10 text-[#B8B8B8] text-xs">
                  Tafsir untuk ayat ini belum tersedia di basis data Kemenag.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#262626] bg-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-white transition border border-[#333333]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
