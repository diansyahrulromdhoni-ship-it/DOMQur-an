import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  StickyNote,
  History,
  Trash2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { quranStorage } from '../storage/quranStorage';
import { Bookmark as BookmarkItem, AyahNote, ReadingHistoryItem } from '../types/quran';

interface Props {
  onNavigateToAyah: (surahNomor: number, ayahNomor: number) => void;
}

export const BookmarkPage: React.FC<Props> = ({ onNavigateToAyah }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'notes' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  const loadData = () => {
    setBookmarks(quranStorage.getBookmarks());
    setNotes(quranStorage.getNotes());
    setHistory(quranStorage.getHistory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveBookmark = (surahNomor: number, ayahNomor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    quranStorage.removeBookmark(surahNomor, ayahNomor);
    loadData();
  };

  const handleDeleteNote = (surahNomor: number, ayahNomor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus catatan untuk ayat ini?')) {
      quranStorage.deleteNote(surahNomor, ayahNomor);
      loadData();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat membaca?')) {
      quranStorage.clearHistory();
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Bookmark & Aktivitas</span>
            <Bookmark className="w-5 h-5 text-[#F6C646] fill-[#F6C646]" />
          </h1>
          <p className="text-xs text-[#B8B8B8] mt-1">
            Simpan ayat-ayat favorit, catatan tadabbur pribadi, serta riwayat tilawah harian Anda.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-black rounded-xl border border-[#262626]">
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'bookmarks'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmark ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'notes'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Catatan ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'history'
                ? 'bg-[#F6C646] text-black shadow-sm'
                : 'text-[#B8B8B8] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Local Storage Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#151515]/70 border border-[#262626] text-xs text-[#888]">
        <Info className="w-4 h-4 text-[#F6C646] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Semua bookmark dan catatan tersimpan aman secara offline pada perangkat ini (IndexedDB / LocalStorage) dan tidak tersinkronisasi otomatis ke perangkat lain untuk menjaga privasi Anda.
        </p>
      </div>

      {/* 1. Bookmarks Tab */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#151515] border border-[#262626] text-center space-y-3">
              <Bookmark className="w-10 h-10 text-[#666] mx-auto" />
              <h2 className="text-base font-bold text-white">Belum Ada Bookmark</h2>
              <p className="text-xs text-[#B8B8B8] max-w-sm mx-auto">
                Tekan tombol ikon bookmark pada ayat mana pun saat membaca untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => onNavigateToAyah(bm.surahNomor, bm.ayahNomor)}
                className="p-4 sm:p-5 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 transition group cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-[#F6C646] font-mono text-xs font-bold border border-[#F6C646]/30">
                      QS. {bm.surahNomor}:{bm.ayahNomor}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                      {bm.surahName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleRemoveBookmark(bm.surahNomor, bm.ayahNomor, e)}
                      className="p-1.5 text-[#888] hover:text-rose-400 hover:bg-[#1E1E1E] rounded-lg transition"
                      title="Hapus bookmark"
                      aria-label="Hapus bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#F6C646] transition ml-1" />
                  </div>
                </div>

                <p className="font-quran text-base sm:text-lg text-white text-right leading-relaxed" dir="rtl">
                  {bm.teksArab}
                </p>

                {bm.teksIndonesia && (
                  <p className="text-xs text-[#CCC] line-clamp-2">
                    "{bm.teksIndonesia}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Notes Tab */}
      {activeSubTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#151515] border border-[#262626] text-center space-y-3">
              <StickyNote className="w-10 h-10 text-[#666] mx-auto" />
              <h2 className="text-base font-bold text-white">Belum Ada Catatan</h2>
              <p className="text-xs text-[#B8B8B8] max-w-sm mx-auto">
                Buka ayat di halaman pembaca dan tekan ikon catatan untuk menulis renungan atau tadabbur Anda.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNavigateToAyah(note.surahNomor, note.ayahNomor)}
                className="p-4 sm:p-5 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 transition group cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-[#FFD455] font-mono text-xs font-bold border border-[#FFD455]/30">
                      QS. {note.surahNomor}:{note.ayahNomor}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                      {note.surahName}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNote(note.surahNomor, note.ayahNomor, e)}
                    className="p-1.5 text-[#888] hover:text-rose-400 hover:bg-[#1E1E1E] rounded-lg transition"
                    title="Hapus catatan"
                    aria-label="Hapus catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-[#262626] text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line">
                  {note.noteText}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#777]">
                  <span>Diperbarui: {new Date(note.updatedAt).toLocaleDateString('id-ID')}</span>
                  <span className="flex items-center gap-1 group-hover:text-[#F6C646] transition">
                    Buka Ayat <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. History Tab */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#B8B8B8]">Daftar aktivitas tilawah terakhir:</span>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 transition"
              >
                Hapus Semua Riwayat
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#151515] border border-[#262626] text-center space-y-3">
              <History className="w-10 h-10 text-[#666] mx-auto" />
              <h2 className="text-base font-bold text-white">Belum Ada Riwayat Membaca</h2>
              <p className="text-xs text-[#B8B8B8] max-w-sm mx-auto">
                Riwayat surat dan ayat terakhir yang Anda baca akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={`${item.surahNomor}-${index}`}
                  onClick={() => onNavigateToAyah(item.surahNomor, item.ayahNomor)}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/40 hover:bg-[#1E1E1E] transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black border border-[#262626] group-hover:border-[#F6C646] flex items-center justify-center font-mono font-bold text-xs text-[#F6C646]">
                      {String(item.surahNomor).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                        Surat {item.surahLatin}
                      </h3>
                      <p className="text-xs text-[#888]">Posisi terakhir: Ayat {item.ayahNomor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-quran text-base text-[#FFD455] hidden sm:inline">
                      {item.surahName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#F6C646] transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
