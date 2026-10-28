import React, { useState, useMemo } from 'react';
import {
  Heart,
  Search,
  Copy,
  Check,
  Share2,
  Bookmark,
  ZoomIn,
  ZoomOut,
  Sparkles,
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
    const text = `${dua.title}\n\n${dua.arabic}\n\nLatin: ${dua.latin}\n\nArtinya:\n"${dua.translation}"\n\n(Referensi: ${dua.reference})\n\nDibagikan dari My Dom Qur'an`;
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
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0 shadow-2xs">
            <Heart className="w-5 h-5 fill-[#C49A3A]/20" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
              Kumpulan Doa Harian & Dzikir
            </h1>
            <p className="text-xs text-[#737373] mt-0.5 max-w-xl">
              Doa-doa shahih dan pilihan dari Al-Qur'an serta As-Sunnah lengkap dengan teks Arab, transliterasi, dan terjemahan
            </p>
          </div>
        </div>

        {/* Quick Font Size Adjuster in Rounded Box */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F8F8F8] border border-[#EAEAEA] p-1.5 rounded-2xl">
          <span className="text-[11px] text-[#737373] font-bold pl-2 mr-1">Huruf Arab:</span>
          <button
            onClick={() => setArabicFontSize((s) => Math.max(20, s - 2))}
            className="w-7 h-7 rounded-lg bg-white border border-[#EAEAEA] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
            title="Perkecil huruf Arab"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-[#C49A3A] px-1 font-bold">{arabicFontSize}px</span>
          <button
            onClick={() => setArabicFontSize((s) => Math.min(38, s + 2))}
            className="w-7 h-7 rounded-lg bg-white border border-[#EAEAEA] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
            title="Perbesar huruf Arab"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] text-xs font-bold px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center text-[#737373] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul doa, arti, bacaan latin, atau riwayat hadis..."
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] focus:bg-white rounded-2xl pl-13 pr-10 py-3 text-xs sm:text-sm text-[#222222] placeholder-[#999] focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#737373] hover:text-[#222222]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border transition shrink-0 ${
              onlyBookmarked
                ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58] shadow-2xs'
                : 'bg-white text-[#737373] border-[#EAEAEA] hover:text-[#222222] hover:bg-[#F8F8F8]'
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${onlyBookmarked ? 'bg-white text-[#C49A3A]' : 'bg-[#F8F8F8] text-[#737373]'}`}>
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-[#C49A3A]' : ''}`} />
            </div>
            <span className="hidden sm:inline">Tersimpan</span>
            {bookmarkedIds.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#C49A3A] text-white">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-[#C49A3A] text-white border-[#C49A3A] shadow-xs'
                    : 'bg-white text-[#737373] border-[#EAEAEA] hover:text-[#222222] hover:bg-[#F8F8F8]'
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
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] flex items-center justify-center text-[#737373] mx-auto">
              <Heart className="w-6 h-6 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-[#222222]">Tidak ada doa ditemukan</h3>
            <p className="text-xs text-[#737373] max-w-sm mx-auto">
              {onlyBookmarked
                ? 'Anda belum menyimpan doa ke dalam daftar favorit. Tekan ikon bookmark pada kartu doa untuk menyimpannya.'
                : 'Coba gunakan kata kunci pencarian yang lain atau pilih kategori lain di atas.'}
            </p>
            {onlyBookmarked && (
              <button
                onClick={() => setOnlyBookmarked(false)}
                className="mt-2 text-xs font-bold text-[#C49A3A] hover:underline"
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
                className="bg-white border border-[#EAEAEA] hover:border-[#C49A3A]/40 rounded-3xl p-5 sm:p-6 space-y-4 transition shadow-xs"
              >
                {/* Card Top: Title, Category badge, Actions */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAEAEA]">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#C49A3A] border border-[#E5BD58]/40 font-bold uppercase tracking-wider">
                      {dua.categoryLabel}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#222222] tracking-tight">
                      {dua.title}
                    </h2>
                  </div>

                  {/* Action Buttons in rounded-square boxes */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(dua)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                        isCopied
                          ? 'bg-[#C49A3A] text-white border-[#C49A3A]'
                          : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#C49A3A] hover:bg-[#FAF3DF]'
                      }`}
                      title={isCopied ? 'Tersalin!' : 'Salin Doa'}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:bg-[#FAF3DF] hover:border-[#E5BD58] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
                      title="Bagikan Doa"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(dua.id)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                        isBookmarked
                          ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
                          : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#C49A3A] hover:bg-[#FAF3DF]'
                      }`}
                      title={isBookmarked ? 'Hapus Simpanan' : 'Simpan Doa'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#C49A3A]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text in Light Frame */}
                <div className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 sm:p-5 rounded-2xl">
                  <p
                    className="font-quran text-right text-[#222222] leading-[2.2] select-text font-normal"
                    style={{ fontSize: `${arabicFontSize}px` }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration (Latin) in Soft Gold */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">Transliterasi</span>
                  <p className="text-xs sm:text-sm text-[#9D7622] italic leading-relaxed">
                    {dua.latin}
                  </p>
                </div>

                {/* Indonesian Translation */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">Artinya</span>
                  <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                    "{dua.translation}"
                  </p>
                </div>

                {/* Reference Footer */}
                <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-[11px] text-[#737373]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#C49A3A]" />
                    <span>Sumber: <strong className="text-[#222222] font-semibold">{dua.reference}</strong></span>
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
