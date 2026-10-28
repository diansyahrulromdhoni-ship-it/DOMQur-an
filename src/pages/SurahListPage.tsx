import React, { useState, useMemo } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw, Layers, BookOpen } from 'lucide-react';
import { SurahListItem } from '../types/quran';

interface Props {
  surahs: SurahListItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectSurah: (nomor: number) => void;
}

export const SurahListPage: React.FC<Props> = ({
  surahs,
  loading,
  error,
  onRetry,
  onSelectSurah
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'Mekah' | 'Madinah'>('all');

  const filteredSurahs = useMemo(() => {
    let result = surahs;

    if (filterType !== 'all') {
      result = result.filter((s) => s.tempatTurun === filterType);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const num = parseInt(q, 10);
      if (!isNaN(num)) {
        return result.filter((s) => s.nomor === num);
      }

      result = result.filter((s) => {
        return (
          s.namaLatin.toLowerCase().includes(q) ||
          s.arti.toLowerCase().includes(q) ||
          s.nama.includes(q)
        );
      });
    }

    return result;
  }, [surahs, searchQuery, filterType]);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EAEAEA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
                Daftar 114 Surat
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF3DF] border border-[#E5BD58]/40 text-[#C49A3A] font-mono font-bold">
                {surahs.length}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Mushaf Al-Qur'an lengkap dengan teks Arab bersumber resmi dari Kemenag RI
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8F8F8] rounded-2xl border border-[#EAEAEA] self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              filterType === 'all'
                ? 'bg-[#C49A3A] text-white shadow-xs font-bold'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            Semua (114)
          </button>
          <button
            onClick={() => setFilterType('Mekah')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              filterType === 'Mekah'
                ? 'bg-[#C49A3A] text-white shadow-xs font-bold'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            Makkiyah
          </button>
          <button
            onClick={() => setFilterType('Madinah')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              filterType === 'Madinah'
                ? 'bg-[#C49A3A] text-white shadow-xs font-bold'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            Madaniyah
          </button>
        </div>
      </div>

      {/* Search Input in Surah List */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center text-[#737373] pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama surat (contoh: Al-Kahf, Yasin), arti surat, atau nomor surat..."
          aria-label="Cari surat"
          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] focus:bg-white rounded-2xl pl-13 pr-4 py-3.5 text-xs sm:text-sm text-[#222222] placeholder:text-[#999] focus:outline-none transition shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#737373] hover:text-[#222222]"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-[#EAEAEA] animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8]" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-[#F8F8F8] rounded" />
                  <div className="w-32 h-3 bg-[#F1F1F1] rounded" />
                </div>
              </div>
              <div className="w-16 h-6 bg-[#F8F8F8] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#222222]">Gagal Memuat Daftar Surat</h2>
          <p className="text-xs text-[#737373] max-w-md mx-auto">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSurahs.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-[#EAEAEA] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] flex items-center justify-center text-[#737373] mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#222222]">Surat Tidak Ditemukan</h2>
          <p className="text-xs text-[#737373]">
            Tidak ada surat yang sesuai dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] text-xs font-semibold text-[#222222] transition"
          >
            Tampilkan Semua Surat
          </button>
        </div>
      )}

      {/* Surah Grid */}
      {!loading && !error && filteredSurahs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.nomor}
              onClick={() => onSelectSurah(surah.nomor)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition group text-left relative overflow-hidden shadow-2xs"
            >
              {/* Left Column: Number Badge in Rounded-Square Box & Names */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] group-hover:bg-[#FAF3DF] flex items-center justify-center shrink-0 transition shadow-2xs">
                  <span className="text-xs font-bold text-[#C49A3A] font-mono">
                    {String(surah.nomor).padStart(2, '0')}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors truncate">
                      {surah.namaLatin}
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#737373] truncate mt-0.5">
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                  <span className="inline-block text-[10px] text-[#737373] bg-[#F8F8F8] px-1.5 py-0.2 rounded border border-[#EAEAEA] font-medium mt-1">
                    {surah.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}
                  </span>
                </div>
              </div>

              {/* Right Column: Arabic Calligraphy Title */}
              <div className="shrink-0 text-right pl-2">
                <span className="font-quran text-lg sm:text-xl text-[#C49A3A] group-hover:scale-105 transition-transform inline-block" dir="rtl">
                  {surah.nama}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
