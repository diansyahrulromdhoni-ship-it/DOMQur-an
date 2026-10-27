import React, { useState, useMemo } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151515] p-5 rounded-2xl border border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Daftar 114 Surat
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-black border border-[#F6C646]/40 text-[#F6C646] font-mono font-bold">
              {surahs.length}
            </span>
          </div>
          <p className="text-xs text-[#B8B8B8] mt-1">
            Mushaf Al-Qur'an lengkap dengan teks Arab bersumber dari Kemenag RI
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-black rounded-xl border border-[#262626] self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'all'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            Semua (114)
          </button>
          <button
            onClick={() => setFilterType('Mekah')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'Mekah'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            Makkiyah
          </button>
          <button
            onClick={() => setFilterType('Madinah')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === 'Madinah'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            Madaniyah
          </button>
        </div>
      </div>

      {/* Search Input in Surah List */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama surat (contoh: Al-Kahf, Yasin), arti surat, atau nomor surat..."
          aria-label="Cari surat"
          className="w-full bg-[#151515] border border-[#262626] focus:border-[#F6C646] rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder:text-[#666] focus:outline-none transition shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-white"
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
              className="p-4 rounded-2xl bg-[#151515] border border-[#262626] animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#262626]" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-[#262626] rounded" />
                  <div className="w-32 h-3 bg-[#202020] rounded" />
                </div>
              </div>
              <div className="w-16 h-6 bg-[#262626] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 rounded-2xl bg-[#151515] border border-rose-900/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Gagal Memuat Daftar Surat</h2>
          <p className="text-xs text-[#B8B8B8] max-w-md mx-auto">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F6C646] text-black font-bold text-xs hover:bg-[#FFD455] transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSurahs.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#151515] border border-[#262626] text-center space-y-3">
          <Layers className="w-10 h-10 text-[#666] mx-auto" />
          <h2 className="text-base font-bold text-white">Surat Tidak Ditemukan</h2>
          <p className="text-xs text-[#B8B8B8]">
            Tidak ada surat yang sesuai dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-xs font-semibold text-white transition"
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
              className="flex items-center justify-between p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition group text-left relative overflow-hidden"
            >
              {/* Left Column: Number Badge & Names */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-black border border-[#262626] group-hover:border-[#F6C646] flex items-center justify-center shrink-0 transition">
                  <span className="text-xs font-bold text-[#F6C646] font-mono">
                    {String(surah.nomor).padStart(2, '0')}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors truncate">
                      {surah.namaLatin}
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#B8B8B8] truncate mt-0.5">
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                  <span className="inline-block text-[10px] text-[#888] font-medium">
                    {surah.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}
                  </span>
                </div>
              </div>

              {/* Right Column: Arabic Calligraphy Title */}
              <div className="shrink-0 text-right pl-2">
                <span className="font-quran text-lg sm:text-xl text-[#FFD455] group-hover:scale-105 transition-transform inline-block">
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
