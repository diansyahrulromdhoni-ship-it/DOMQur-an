import React, { useState, useMemo } from 'react';
import {
  Heart,
  Search,
  Copy,
  Check,
  Share2,
  Bookmark,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { AUTHENTIC_DUAS, DUA_CATEGORIES, DuaItem, duaService } from '../services/duaService';

export const DoaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => duaService.getBookmarkedIds());
  const [arabicFontSize, setArabicFontSize] = useState<number>(26);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleToggleBookmark = (id: string) => {
    duaService.toggleBookmark(id);
    setBookmarkedIds(duaService.getBookmarkedIds());
  };

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\nLatin: ${dua.latin}\n\nArtinya:\n"${dua.translation}"\n\n(Referensi: ${dua.reference})\n\nDibagikan dari AA Dom Qur'an`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\nLatin: ${dua.latin}\n\nArtinya:\n"${dua.translation}"\n\n(Referensi: ${dua.reference})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Doa: ${dua.title}`,
          text
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      handleCopy(dua);
      setShareToast('Teks doa berhasil disalin ke clipboard untuk dibagikan.');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const filteredDuas = useMemo(() => {
    return AUTHENTIC_DUAS.filter((item) => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Bookmark filter
      if (onlyBookmarked && !bookmarkedIds.includes(item.id)) {
        return false;
      }

      // Search match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchLatin = item.latin.toLowerCase().includes(q);
        const matchTrans = item.translation.toLowerCase().includes(q);
        const matchRef = item.reference.toLowerCase().includes(q);
        return matchTitle || matchLatin || matchTrans || matchRef;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, onlyBookmarked, bookmarkedIds]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F6C646]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#F6C646]/10 text-[#F6C646] border border-[#F6C646]/20">
                <Heart className="w-5 h-5 fill-[#F6C646]/20" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kumpulan Doa Harian & Dzikir
              </h1>
            </div>
            <p className="text-xs text-[#B8B8B8] mt-1.5 max-w-xl">
              Doa-doa shahih dan pilihan dari Al-Qur'an serta As-Sunnah lengkap dengan teks Arab berharakat, transliterasi, arti, dan referensi terpercaya.
            </p>
          </div>

          {/* Quick Font Size Adjuster */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/60 border border-[#262626] px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-[#888] font-medium mr-1">Ukuran Arab:</span>
            <button
              onClick={() => setArabicFontSize((s) => Math.max(20, s - 2))}
              className="p-1 rounded text-[#B8B8B8] hover:text-[#F6C646] hover:bg-[#222] transition"
              title="Perkecil huruf Arab"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#F6C646] px-1 font-bold">{arabicFontSize}px</span>
            <button
              onClick={() => setArabicFontSize((s) => Math.min(38, s + 2))}
              className="p-1 rounded text-[#B8B8B8] hover:text-[#F6C646] hover:bg-[#222] transition"
              title="Perbesar huruf Arab"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="bg-[#F6C646] text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul doa, arti, bacaan latin, atau hadis..."
              className="w-full bg-[#151515] border border-[#262626] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#F6C646] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
              onlyBookmarked
                ? 'bg-[#F6C646] text-black border-[#F6C646]'
                : 'bg-[#151515] text-[#B8B8B8] border-[#262626] hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-black' : ''}`} />
            <span className="hidden sm:inline">Tersimpan</span>
            {bookmarkedIds.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                onlyBookmarked ? 'bg-black text-[#F6C646]' : 'bg-[#222] text-[#F6C646]'
              }`}>
                {bookmarkedIds.length}
              </span>
            )}
          </button>
        </div>

        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {DUA_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-[#F6C646] text-black border-[#F6C646] shadow-sm'
                    : 'bg-[#151515] text-[#B8B8B8] border-[#262626] hover:text-white hover:bg-[#1f1f1f]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-8 text-center space-y-3">
            <Heart className="w-10 h-10 text-[#555] mx-auto stroke-1" />
            <h3 className="text-base font-bold text-white">Tidak ada doa ditemukan</h3>
            <p className="text-xs text-[#888] max-w-sm mx-auto">
              {onlyBookmarked
                ? 'Anda belum menyimpan doa ke dalam daftar favorit. Tekan ikon bookmark pada kartu doa untuk menyimpannya.'
                : 'Coba gunakan kata kunci pencarian yang lain atau pilih kategori lain di atas.'}
            </p>
            {onlyBookmarked && (
              <button
                onClick={() => setOnlyBookmarked(false)}
                className="mt-2 text-xs font-bold text-[#F6C646] hover:underline"
              >
                Tampilkan Semua Doa
              </button>
            )}
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isBookmarked = bookmarkedIds.includes(dua.id);
            const isCopied = copiedId === dua.id;

            return (
              <div
                key={dua.id}
                className="bg-[#151515] border border-[#262626] hover:border-[#F6C646]/40 rounded-2xl p-5 space-y-4 transition shadow-sm"
              >
                {/* Card Top: Title, Category badge, Actions */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#222]">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#222] text-[#FFD455] border border-[#F6C646]/20 font-semibold uppercase tracking-wider">
                      {dua.categoryLabel}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {dua.title}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(dua)}
                      className={`p-2 rounded-xl transition ${
                        isCopied
                          ? 'bg-[#F6C646] text-black font-bold'
                          : 'text-[#B8B8B8] hover:text-[#F6C646] hover:bg-[#222]'
                      }`}
                      title={isCopied ? 'Tersalin!' : 'Salin Doa'}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      className="p-2 text-[#B8B8B8] hover:text-[#F6C646] hover:bg-[#222] rounded-xl transition"
                      title="Bagikan Doa"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(dua.id)}
                      className={`p-2 rounded-xl transition ${
                        isBookmarked
                          ? 'text-[#F6C646] bg-[#F6C646]/10'
                          : 'text-[#B8B8B8] hover:text-[#F6C646] hover:bg-[#222]'
                      }`}
                      title={isBookmarked ? 'Hapus Simpanan' : 'Simpan Doa'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#F6C646]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="bg-black/40 border border-[#222] p-4 sm:p-5 rounded-xl">
                  <p
                    className="font-quran text-right text-white leading-[2.2] select-text"
                    style={{ fontSize: `${arabicFontSize}px` }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration (Latin) */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#777] uppercase font-bold tracking-wider">Transliterasi</span>
                  <p className="text-xs sm:text-sm text-[#FFD455] italic leading-relaxed">
                    {dua.latin}
                  </p>
                </div>

                {/* Indonesian Translation */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#777] uppercase font-bold tracking-wider">Artinya</span>
                  <p className="text-xs sm:text-sm text-[#DDD] leading-relaxed">
                    "{dua.translation}"
                  </p>
                </div>

                {/* Reference Footer */}
                <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px] text-[#888]">
                  <span className="flex items-center gap-1.5 font-medium text-[#B8B8B8]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F6C646]" />
                    <span>Sumber: <strong className="text-white font-semibold">{dua.reference}</strong></span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
