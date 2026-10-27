import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SurahListItem } from '../types/quran';
import { searchService, SearchResultItem } from '../services/searchService';

interface Props {
  surahs: SurahListItem[];
  onSelectResult: (surahNomor: number, ayahNomor?: number) => void;
}

const QUICK_SUGGESTIONS = ['Sabar', 'Shalat', 'Surga', 'Rezeki', 'Cahaya', 'Kiamat', 'Ibu Bapak', '2:255'];

export const SearchPage: React.FC<Props> = ({ surahs, onSelectResult }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);

  const performSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchRes = await searchService.searchVerses(trimmed, surahs);
      setResults(searchRes);
    } catch (e) {
      console.warn('Search execution error:', e);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      performSearch(val);
    }, 350);
  };

  const handleApplySuggestion = (text: string) => {
    setQuery(text);
    performSearch(text);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Search Header Banner */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Pencarian Global Al-Qur'an</span>
            <Sparkles className="w-4 h-4 text-[#F6C646]" />
          </h1>
          <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed">
            Temukan nama surat, nomor surat & ayat (contoh: <code className="text-[#F6C646]">2:255</code> atau <code className="text-[#F6C646]">18 10</code>), serta kata dalam terjemahan bahasa Indonesia resmi Kemenag.
          </p>
        </div>

        {/* Input Field */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            placeholder="Ketik kata kunci, nama surat, atau format surat:ayat..."
            aria-label="Cari kata kunci Al-Qur'an"
            className="w-full bg-black border border-[#262626] focus:border-[#F6C646] rounded-2xl pl-12 pr-10 py-3.5 text-xs sm:text-sm text-white placeholder:text-[#555] focus:outline-none transition shadow-inner"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-[#F6C646] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#777] mr-1">Rekomendasi pencarian:</span>
          {QUICK_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => handleApplySuggestion(sug)}
              className="px-2.5 py-1 text-xs rounded-lg bg-black hover:bg-[#1E1E1E] text-[#B8B8B8] hover:text-[#F6C646] border border-[#262626] transition"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {hasSearched && !isSearching && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-[#B8B8B8]">
            Ditemukan <strong className="text-[#F6C646] font-mono">{results.length}</strong> hasil untuk "{query}"
          </span>
          {results.length > 0 && (
            <span className="text-[11px] text-[#777]">Klik untuk langsung membuka ayat</span>
          )}
        </div>
      )}

      {/* Loading state during verse search */}
      {isSearching && (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#F6C646] animate-spin mx-auto" />
          <p className="text-xs text-[#B8B8B8]">Mencocokkan indeks terjemahan ayat...</p>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && hasSearched && results.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#151515] border border-[#262626] text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[#666] mx-auto" />
          <h2 className="text-base font-bold text-white">Tidak Ada Hasil</h2>
          <p className="text-xs text-[#B8B8B8] max-w-sm mx-auto">
            Tidak ditemukan ayat atau surat yang cocok dengan "{query}". Cobalah kata kunci lain seperti nama surat atau kata terjemahan bahasa Indonesia yang lebih umum.
          </p>
        </div>
      )}

      {/* Search Result Items */}
      {!isSearching && results.length > 0 && (
        <div className="space-y-3">
          {results.map((item, idx) => (
            <button
              key={`${item.surahNomor}-${item.ayahNomor || 0}-${idx}`}
              onClick={() => onSelectResult(item.surahNomor, item.ayahNomor)}
              className="w-full p-4 sm:p-5 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition group text-left flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-black text-[#F6C646] font-mono text-[11px] font-bold border border-[#F6C646]/30">
                    {item.type === 'surah' ? 'SURAT' : `QS. ${item.surahNomor}:${item.ayahNomor}`}
                  </span>
                  <h2 className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                    {item.surahLatin}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#888] group-hover:text-[#F6C646] transition">
                  <span className="font-quran text-sm text-[#FFD455] hidden sm:inline">
                    {item.surahName}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Arabic preview if verse */}
              {item.teksArab && (
                <p className="font-quran text-base sm:text-lg text-white/90 text-right py-1 leading-relaxed" dir="rtl">
                  {item.teksArab}
                </p>
              )}

              {/* Translation snippet */}
              {item.teksIndonesia && (
                <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed line-clamp-3">
                  "{item.teksIndonesia}"
                </p>
              )}

              {item.matchHighlight && !item.teksIndonesia && (
                <p className="text-xs text-[#999]">{item.matchHighlight}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Default State before search */}
      {!hasSearched && (
        <div className="p-8 rounded-2xl bg-[#151515]/60 border border-[#262626] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#F6C646]/60 mx-auto" />
          <h2 className="text-sm font-bold text-white">Panduan Pencarian</h2>
          <p className="text-xs text-[#888] max-w-md mx-auto leading-relaxed">
            Anda dapat mencari dengan mengetik nama surat (seperti <em>Al-Fatihah</em>, <em>Yasin</em>, <em>Al-Baqarah</em>),
            format nomor ayat (seperti <em>2:255</em> atau <em>18 10</em>), maupun tema terjemahan.
          </p>
        </div>
      )}
    </div>
  );
};
