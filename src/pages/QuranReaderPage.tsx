import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Share2,
  Copy,
  BookOpen,
  StickyNote,
  Sliders,
  Check,
  RotateCcw,
  Headphones,
  ScrollText,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { quranApi } from '../services/quranApi';
import { audioService } from '../services/audioService';
import { quranStorage } from '../storage/quranStorage';
import { searchService } from '../services/searchService';
import { SurahDetail, AyahItem, UserSettings } from '../types/quran';
import { TafsirModal } from '../components/TafsirModal';
import { NoteModal } from '../components/NoteModal';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { AutoScrollToolbar } from '../components/AutoScrollToolbar';

interface Props {
  surahNomor: number;
  initialAyah?: number;
  onBack: () => void;
  onSelectSurah: (nomor: number, ayah?: number) => void;
}

export const QuranReaderPage: React.FC<Props> = ({
  surahNomor,
  initialAyah,
  onBack,
  onSelectSurah
}) => {
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(quranStorage.getSettings());
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Modals state
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [noteAyah, setNoteAyah] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
  const [notesAyahs, setNotesAyahs] = useState<Set<number>>(new Set());

  // Auto-scroll hook
  const {
    scrollState,
    speedMultiplier,
    setSpeedMultiplier,
    start: startAutoScroll,
    pause: pauseAutoScroll,
    resume: resumeAutoScroll,
    stop: stopAutoScroll
  } = useAutoScroll();
  const [showAutoScrollToolbar, setShowAutoScrollToolbar] = useState<boolean>(false);

  // Audio track state
  const [activeAyahAudio, setActiveAyahAudio] = useState<number | null>(null);

  // References to verses for auto-scrolling to target ayah
  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Load surah detail
  const loadSurah = async (nomor: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quranApi.getSurahDetail(nomor);
      setDetail(data);
      searchService.cacheLoadedSurah(data);

      // Record reading history & last read
      const lastAyah = initialAyah || 1;
      quranStorage.setLastRead({
        surahNomor: data.nomor,
        surahName: data.nama,
        surahLatin: data.namaLatin,
        ayahNomor: lastAyah,
        timestamp: Date.now()
      });

      // Update bookmarks and notes cache for quick lookup
      refreshBookmarksAndNotes(data.nomor);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat rincian ayat Al-Qur\'an.');
    } finally {
      setLoading(false);
    }
  };

  const refreshBookmarksAndNotes = (sNomor: number) => {
    const allBookmarks = quranStorage.getBookmarks();
    const bSet = new Set<number>();
    allBookmarks.forEach((b) => {
      if (b.surahNomor === sNomor) bSet.add(b.ayahNomor);
    });
    setBookmarkedAyahs(bSet);

    const allNotes = quranStorage.getNotes();
    const nSet = new Set<number>();
    allNotes.forEach((n) => {
      if (n.surahNomor === sNomor) nSet.add(n.ayahNomor);
    });
    setNotesAyahs(nSet);
  };

  useEffect(() => {
    loadSurah(surahNomor);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      stopAutoScroll();
    };
  }, [surahNomor]);

  // Jump to specific ayah if specified
  useEffect(() => {
    if (!loading && initialAyah && ayahRefs.current.has(initialAyah)) {
      setTimeout(() => {
        const el = ayahRefs.current.get(initialAyah);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-[#FAF3DF]');
          setTimeout(() => el.classList.remove('bg-[#FAF3DF]'), 2500);
        }
      }, 300);
    }
  }, [loading, initialAyah]);

  // Subscribe to audioService to reflect active playing ayah
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      if (state.surahNomor === surahNomor && state.isPlaying) {
        setActiveAyahAudio(state.ayahNomor);
      } else {
        setActiveAyahAudio(null);
      }
    });
    return unsubscribe;
  }, [surahNomor]);

  // Copy Ayah to clipboard
  const handleCopyAyah = async (ayah: AyahItem) => {
    const textToCopy = `${ayah.teksArab}\n\n${ayah.teksLatin}\n\n"${ayah.teksIndonesia}" (QS. ${detail?.namaLatin}: ${ayah.nomorAyat})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback(ayah.nomorAyat);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  // Share Ayah
  const handleShareAyah = async (ayah: AyahItem) => {
    const shareData = {
      title: `QS. ${detail?.namaLatin} Ayat ${ayah.nomorAyat} - My Dom Qur'an`,
      text: `${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\n(QS. ${detail?.namaLatin}: ${ayah.nomorAyat}) - Baca di My Dom Qur'an`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyAyah(ayah);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (ayah: AyahItem) => {
    if (!detail) return;
    quranStorage.toggleBookmark({
      surahNomor: detail.nomor,
      surahName: detail.namaLatin,
      ayahNomor: ayah.nomorAyat,
      teksArab: ayah.teksArab,
      teksIndonesia: ayah.teksIndonesia
    });
    refreshBookmarksAndNotes(detail.nomor);
  };

  // Play audio for an ayah
  const handlePlayAyahAudio = (ayah: AyahItem) => {
    if (!detail) return;
    const qariId = settings.selectedQari;
    const audioUrl = ayah.audio[qariId] || ayah.audio['05'] || Object.values(ayah.audio)[0];

    if (!audioUrl) {
      alert('URL audio untuk ayat ini tidak tersedia dari server.');
      return;
    }

    audioService.playTrack({
      url: audioUrl,
      surahNomor: detail.nomor,
      surahName: detail.namaLatin,
      ayahNomor: ayah.nomorAyat,
      reciterId: qariId
    });
  };

  // Play full surah audio
  const handlePlayFullSurah = () => {
    if (!detail) return;
    const qariId = settings.selectedQari;
    const audioUrl = detail.audioFull[qariId] || detail.audioFull['05'] || Object.values(detail.audioFull)[0];

    if (!audioUrl) {
      alert('URL audio penuh surat ini tidak tersedia.');
      return;
    }

    audioService.playTrack({
      url: audioUrl,
      surahNomor: detail.nomor,
      surahName: detail.namaLatin,
      ayahNomor: null,
      reciterId: qariId
    });
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    quranStorage.saveSettings(updated);
  };

  // Mark current ayah as last read when tapped
  const handleAyahReadClick = (ayahNum: number) => {
    if (!detail) return;
    quranStorage.setLastRead({
      surahNomor: detail.nomor,
      surahName: detail.nama,
      surahLatin: detail.namaLatin,
      ayahNomor: ayahNum,
      timestamp: Date.now()
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A]">
          <Loader2 className="w-6 h-6 animate-spin text-[#C49A3A]" />
        </div>
        <h3 className="text-base font-bold text-[#222222]">Memuat Mushaf Surat Ke-{surahNomor}...</h3>
        <p className="text-xs text-[#737373]">Mengambil teks Arab asli dan terjemahan resmi Kemenag</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-16 p-6 rounded-3xl bg-white border border-red-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#222222]">Gagal Membuka Surat</h3>
        <p className="text-xs text-[#737373]">{error || 'Data surat tidak ditemukan.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#F1F1F1] text-[#222222] text-xs font-semibold border border-[#EAEAEA]"
          >
            Kembali ke Daftar
          </button>
          <button
            onClick={() => loadSurah(surahNomor)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  const prevSurah = detail.suratSebelumnya;
  const nextSurah = detail.suratSelanjutnya;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 bg-white p-3 sm:p-4 rounded-3xl border border-[#EAEAEA] sticky top-16 z-20 backdrop-blur-md shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-xs font-semibold text-[#222222] transition"
        >
          <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline">Daftar Surat</span>
        </button>

        {/* Center Surah Info */}
        <div className="text-center min-w-0 px-2">
          <h2 className="text-sm sm:text-base font-black text-[#222222] truncate">
            {detail.nomor}. {detail.namaLatin}
          </h2>
          <p className="text-[11px] text-[#C49A3A] truncate font-medium">
            {detail.arti} • {detail.jumlahAyat} Ayat
          </p>
        </div>

        {/* Action Controls (Icons in rounded-square boxes) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAutoScrollToolbar((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
              showAutoScrollToolbar || scrollState !== 'idle'
                ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#C49A3A] font-bold'
                : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border-[#EAEAEA]'
            }`}
            title="Auto-Scroll Tilawah"
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${showAutoScrollToolbar ? 'bg-white text-[#C49A3A]' : 'text-[#737373]'}`}>
              <ScrollText className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Scroll</span>
          </button>

          <button
            onClick={() => setShowSettingsDrawer((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
              showSettingsDrawer
                ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#C49A3A] font-bold'
                : 'bg-[#F8F8F8] text-[#737373] hover:text-[#222222] border-[#EAEAEA]'
            }`}
            title="Pengaturan Tampilan Ayat"
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${showSettingsDrawer ? 'bg-white text-[#C49A3A]' : 'text-[#737373]'}`}>
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Tampilan</span>
          </button>
        </div>
      </div>

      {/* Surah Header Banner (White & Soft Gold Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#EAEAEA] p-6 sm:p-8 text-center shadow-xs">
        <div className="relative z-10 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FAF3DF] border border-[#E5BD58]/40 text-xs font-mono text-[#C49A3A] font-bold">
            Surat Ke-{detail.nomor} • {detail.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}
          </div>

          <h1 className="font-quran text-4xl sm:text-5xl text-[#C49A3A] tracking-wide py-2" dir="rtl">
            {detail.nama}
          </h1>

          <h2 className="text-xl sm:text-2xl font-black text-[#222222]">
            {detail.namaLatin}
          </h2>

          <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto">
            "{detail.arti}" — Terdiri atas {detail.jumlahAyat} ayat
          </p>

          {/* Audio Murottal Full Surah Button */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={handlePlayFullSurah}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs sm:text-sm transition shadow-sm"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <span>Putar Murottal Penuh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Drawer / Quick Controls */}
      {showSettingsDrawer && (
        <aside
          aria-label="Panel pengaturan tampilan ayat"
          className="bg-white border border-[#E5BD58]/60 p-5 rounded-3xl space-y-4 animate-in slide-in-from-top-2 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
            <h3 className="text-xs font-bold text-[#C49A3A] uppercase tracking-wider">
              Pengaturan Teks & Keterbacaan
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-xs font-semibold text-[#737373] hover:text-[#222222]"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Arabic Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#737373]">
                <span>Ukuran Tulisan Arab:</span>
                <span className="text-[#C49A3A] font-mono font-bold">{settings.arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min={22}
                max={48}
                step={2}
                value={settings.arabicFontSize}
                onChange={(e) => handleUpdateSettings({ arabicFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C49A3A] cursor-pointer"
              />
            </div>

            {/* Translation Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#737373]">
                <span>Ukuran Terjemahan:</span>
                <span className="text-[#C49A3A] font-mono font-bold">{settings.translationFontSize}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={22}
                step={1}
                value={settings.translationFontSize}
                onChange={(e) => handleUpdateSettings({ translationFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C49A3A] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#EAEAEA]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#222222]">
              <input
                type="checkbox"
                checked={settings.showTranslation}
                onChange={(e) => handleUpdateSettings({ showTranslation: e.target.checked })}
                className="accent-[#C49A3A] w-4 h-4 rounded"
              />
              <span>Tampilkan Terjemahan Indonesia</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#222222]">
              <input
                type="checkbox"
                checked={settings.showTransliteration}
                onChange={(e) => handleUpdateSettings({ showTransliteration: e.target.checked })}
                className="accent-[#C49A3A] w-4 h-4 rounded"
              />
              <span>Tampilkan Teks Latin (Transliterasi)</span>
            </label>
          </div>
        </aside>
      )}

      {/* Bismillah Header (Except Surah At-Taubah / Surah 9) */}
      {detail.nomor !== 9 && detail.nomor !== 1 && (
        <div className="py-6 text-center border-y border-[#EAEAEA] bg-[#F8F8F8] rounded-3xl">
          <p className="font-quran text-2xl sm:text-3xl text-[#C49A3A] tracking-widest leading-loose" dir="rtl">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="text-xs text-[#737373] mt-1 font-serif">
            Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
          </p>
        </div>
      )}

      {/* Verses (Ayat-Ayat) List */}
      <div className="space-y-4">
        {detail.ayat.map((ayah) => {
          const isBookmarked = bookmarkedAyahs.has(ayah.nomorAyat);
          const hasNote = notesAyahs.has(ayah.nomorAyat);
          const isPlayingThis = activeAyahAudio === ayah.nomorAyat;

          return (
            <article
              key={ayah.nomorAyat}
              ref={(el) => {
                if (el) ayahRefs.current.set(ayah.nomorAyat, el);
                else ayahRefs.current.delete(ayah.nomorAyat);
              }}
              onClick={() => handleAyahReadClick(ayah.nomorAyat)}
              className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all shadow-xs ${
                isPlayingThis
                  ? 'border-[#C49A3A] bg-[#FAF3DF]/40 shadow-sm'
                  : 'border-[#EAEAEA] hover:border-[#C49A3A]/50'
              }`}
            >
              {/* Ayah Header Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] gap-2">
                {/* Verse Number Badge in Rounded-Square Box */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center font-mono font-bold text-xs text-[#C49A3A] shadow-2xs">
                    {ayah.nomorAyat}
                  </div>
                  <span className="text-[11px] text-[#737373] hidden sm:inline">
                    QS. {detail.nomor}:{ayah.nomorAyat}
                  </span>
                </div>

                {/* Ayat Action Buttons (All in rounded-square boxes) */}
                <div className="flex items-center gap-1.5">
                  {/* Audio Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAyahAudio(ayah);
                    }}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                      isPlayingThis
                        ? 'bg-[#C49A3A] text-white border-[#C49A3A]'
                        : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#C49A3A] hover:bg-[#FAF3DF]'
                    }`}
                    title={isPlayingThis ? 'Jeda Audio' : 'Putar Audio Ayat'}
                    aria-label={`Putar audio ayat ${ayah.nomorAyat}`}
                  >
                    {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(ayah);
                    }}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                      isBookmarked
                        ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
                        : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#C49A3A] hover:bg-[#FAF3DF]'
                    }`}
                    title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
                    aria-label={`Bookmark ayat ${ayah.nomorAyat}`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#C49A3A]' : ''}`} />
                  </button>

                  {/* Tafsir Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTafsirAyah(ayah.nomorAyat);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:bg-[#FAF3DF] hover:border-[#E5BD58] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
                    title="Lihat Tafsir Kemenag"
                    aria-label={`Lihat tafsir ayat ${ayah.nomorAyat}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>

                  {/* Note Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteAyah(ayah.nomorAyat);
                    }}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                      hasNote
                        ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
                        : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#C49A3A] hover:bg-[#FAF3DF]'
                    }`}
                    title={hasNote ? 'Buka Catatan (Ada catatan)' : 'Tambah Catatan Pribadi'}
                    aria-label={`Catatan ayat ${ayah.nomorAyat}`}
                  >
                    <StickyNote className={`w-3.5 h-3.5 ${hasNote ? 'fill-[#C49A3A]' : ''}`} />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAyah(ayah);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:bg-[#FAF3DF] hover:border-[#E5BD58] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
                    title="Salin Ayat & Terjemahan"
                    aria-label={`Salin teks ayat ${ayah.nomorAyat}`}
                  >
                    {copyFeedback === ayah.nomorAyat ? (
                      <Check className="w-3.5 h-3.5 text-[#21865B]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareAyah(ayah);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:bg-[#FAF3DF] hover:border-[#E5BD58] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
                    title="Bagikan Ayat"
                    aria-label={`Bagikan ayat ${ayah.nomorAyat}`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Arabic Verse Text (dir="rtl", authentic harakat) */}
              <div className="py-6 sm:py-8 text-right" dir="rtl">
                <p
                  className="font-quran text-[#222222] font-normal leading-[2.2] tracking-wide select-text"
                  style={{ fontSize: `${settings.arabicFontSize}px` }}
                >
                  {ayah.teksArab}
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#E5BD58] bg-[#FAF3DF] text-xs text-[#C49A3A] mx-2 font-mono font-bold align-middle">
                    {ayah.nomorAyat}
                  </span>
                </p>
              </div>

              {/* Transliteration (Teks Latin) */}
              {settings.showTransliteration && (
                <div className="pt-2 pb-1 text-xs sm:text-sm text-[#9D7622] italic leading-relaxed">
                  {ayah.teksLatin}
                </div>
              )}

              {/* Translation (Bahasa Indonesia) */}
              {settings.showTranslation && (
                <div
                  className="pt-2 text-[#444444] leading-relaxed select-text font-normal"
                  style={{ fontSize: `${settings.translationFontSize}px` }}
                >
                  {ayah.teksIndonesia}
                </div>
              )}

              {/* Note indicator if exists */}
              {hasNote && (
                <div className="mt-3 pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#C49A3A] bg-[#FAF3DF]/60 px-3 py-2 rounded-xl border border-[#E5BD58]/40">
                  <span className="truncate">
                    Catatan Anda: {quranStorage.getNote(detail.nomor, ayah.nomorAyat)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteAyah(ayah.nomorAyat);
                    }}
                    className="text-[11px] font-bold underline ml-2 shrink-0 text-[#C49A3A]"
                  >
                    Ubah
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Surah Navigation (Previous & Next Surah) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#EAEAEA]">
        {prevSurah ? (
          <button
            onClick={() => onSelectSurah(prevSurah.nomor)}
            className="w-full sm:w-auto flex items-center justify-start gap-3 p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#737373] group-hover:text-[#C49A3A] transition">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#737373] uppercase tracking-wider block">
                Surat Sebelumnya
              </span>
              <span className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition">
                {prevSurah.nomor}. {prevSurah.namaLatin}
              </span>
            </div>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextSurah ? (
          <button
            onClick={() => onSelectSurah(nextSurah.nomor)}
            className="w-full sm:w-auto flex items-center justify-end gap-3 p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-right group shadow-xs"
          >
            <div>
              <span className="text-[10px] text-[#737373] uppercase tracking-wider block">
                Surat Selanjutnya
              </span>
              <span className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition">
                {nextSurah.nomor}. {nextSurah.namaLatin}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#737373] group-hover:text-[#C49A3A] transition">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Auto-Scroll Floating Toolbar */}
      {showAutoScrollToolbar && (
        <AutoScrollToolbar
          scrollState={scrollState}
          speedMultiplier={speedMultiplier}
          onSetSpeed={setSpeedMultiplier}
          onStart={startAutoScroll}
          onPause={pauseAutoScroll}
          onResume={resumeAutoScroll}
          onStop={stopAutoScroll}
          onCloseBar={() => setShowAutoScrollToolbar(false)}
        />
      )}

      {/* Tafsir Modal */}
      {tafsirAyah !== null && (
        <TafsirModal
          surahNomor={detail.nomor}
          surahLatin={detail.namaLatin}
          ayahNomor={tafsirAyah}
          isOpen={true}
          onClose={() => setTafsirAyah(null)}
        />
      )}

      {/* Note Modal */}
      {noteAyah !== null && (
        <NoteModal
          surahNomor={detail.nomor}
          surahName={detail.namaLatin}
          ayahNomor={noteAyah}
          isOpen={true}
          onClose={() => setNoteAyah(null)}
          onSaved={() => refreshBookmarksAndNotes(detail.nomor)}
        />
      )}
    </div>
  );
};
