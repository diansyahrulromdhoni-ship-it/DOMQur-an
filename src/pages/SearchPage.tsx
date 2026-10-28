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
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight flex items-center gap-2">
              <span>Pencarian Al-Qur'an</span>
              <Sparkles className="w-4 h-4 text-[#C49A3A]" />
            </h1>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Cari nama surat, format nomor (misal <code className="text-[#C49A3A] font-semibold">2:255</code> atau <code className="text-[#C49A3A] font-semibold">18 10</code>), serta tema terjemahan Kemenag RI.
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F8F8F8] border border-[#EAEAEA] flex items-center justify-center text-[#737373]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            placeholder="Ketik kata kunci terjemahan, surat, atau ayat (misal: 2:255)..."
            aria-label="Cari kata kunci Al-Qur'an"
            className="w-full bg-[#FFFFFF] border border-[#EAEAEA] focus:border-[#C49A3A] focus:ring-2 focus:ring-[#FAF3DF] rounded-2xl pl-14 pr-10 py-3.5 text-xs sm:text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none transition shadow-xs"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-[#C49A3A] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-[#737373] mr-1">Rekomendasi pencarian:</span>
          {QUICK_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => handleApplySuggestion(sug)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FAF3DF] text-[#C49A3A] hover:bg-[#C49A3A] hover:text-white border border-[#E5BD58]/30 transition shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {hasSearched && !isSearching && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-[#737373]">
            Ditemukan <strong className="text-[#C49A3A] font-bold">{results.length}</strong> hasil untuk "{query}"
          </span>
          {results.length > 0 && (
            <span className="text-xs text-[#737373]">Klik hasil untuk membuka ayat</span>
          )}
        </div>
      )}

      {/* Loading state during verse search */}
      {isSearching && (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#C49A3A] animate-spin mx-auto" />
          <p className="text-xs text-[#737373]">Mencocokkan indeks ayat dan terjemahan...</p>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && hasSearched && results.length === 0 && (
        <div className="p-12 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#222222]">Tidak Ada Hasil Ditemukan</h2>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
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
              className="w-full p-5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:shadow-md transition group text-left flex flex-col gap-3"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-mono text-xs font-bold border border-[#E5BD58]/30">
                    {item.type === 'surah' ? 'SURAT' : `QS. ${item.surahNomor}:${item.ayahNomor}`}
                  </span>
                  <h2 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                    {item.surahLatin}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-quran text-base text-[#C49A3A] hidden sm:inline">
                    {item.surahName}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] group-hover:bg-[#FAF3DF] text-[#737373] group-hover:text-[#C49A3A] flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Arabic preview if verse */}
              {item.teksArab && (
                <p className="font-quran text-lg sm:text-xl text-[#222222] text-right py-1 leading-loose" dir="rtl">
                  {item.teksArab}
                </p>
              )}

              {/* Translation snippet */}
              {item.teksIndonesia && (
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed line-clamp-3">
                  "{item.teksIndonesia}"
                </p>
              )}

              {item.matchHighlight && !item.teksIndonesia && (
                <p className="text-xs text-[#737373]">{item.matchHighlight}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Default State before search */}
      {!hasSearched && (
        <div className="p-8 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-[#222222]">Petunjuk Pencarian Al-Qur'an</h2>
          <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
            Ketik nama surat seperti <em>Al-Kahf</em>, <em>Yasin</em>, atau nomor ayat seperti <em>2:255</em> (Ayat Kursi), atau topik seperti <em>sabar</em>, <em>rezeki</em>, <em>hidayah</em>.
          </p>
        </div>
      )}
    </div>
  );
};
