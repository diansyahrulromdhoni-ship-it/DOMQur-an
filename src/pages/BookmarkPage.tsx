import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  StickyNote,
  History,
  Trash2,
  BookOpen,
  ArrowRight,
  Info,
  Calendar,
  Sparkles
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
    if (confirm('Hapus catatan tadabbur untuk ayat ini?')) {
      quranStorage.deleteNote(surahNomor, ayahNomor);
      loadData();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat membaca tilawah?')) {
      quranStorage.clearHistory();
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
                <Bookmark className="w-5 h-5 fill-[#C49A3A]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                  Bookmark & Aktivitas
                </h1>
                <p className="text-xs text-[#737373] mt-0.5">
                  Ayat tersimpan, tadabbur pribadi, serta riwayat tilawah Al-Qur'an
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#F8F8F8] rounded-xl border border-[#EAEAEA]">
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'bookmarks'
                ? 'bg-white text-[#C49A3A] shadow-xs border border-[#EAEAEA]'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeSubTab === 'bookmarks' ? 'bg-[#FAF3DF] text-[#C49A3A]' : 'bg-[#EAEAEA] text-[#737373]'
            }`}>
              <Bookmark className="w-3.5 h-3.5" />
            </div>
            <span>Bookmark ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'notes'
                ? 'bg-white text-[#C49A3A] shadow-xs border border-[#EAEAEA]'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeSubTab === 'notes' ? 'bg-[#FAF3DF] text-[#C49A3A]' : 'bg-[#EAEAEA] text-[#737373]'
            }`}>
              <StickyNote className="w-3.5 h-3.5" />
            </div>
            <span>Catatan ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'history'
                ? 'bg-white text-[#C49A3A] shadow-xs border border-[#EAEAEA]'
                : 'text-[#737373] hover:text-[#222222]'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeSubTab === 'history' ? 'bg-[#FAF3DF] text-[#C49A3A]' : 'bg-[#EAEAEA] text-[#737373]'
            }`}>
              <History className="w-3.5 h-3.5" />
            </div>
            <span>Riwayat ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Local Storage Privacy Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF3DF]/60 border border-[#E5BD58]/30 text-xs text-[#737373]">
        <div className="w-7 h-7 rounded-lg bg-white border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <p className="leading-relaxed">
          Semua bookmark dan catatan tadabbur Anda disimpan secara privat di penyimpanan offline perangkat ini (IndexedDB / LocalStorage) sehingga tetap aman, cepat, dan terjaga kerahasiaannya.
        </p>
      </div>

      {/* 1. Bookmarks Tab */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mx-auto">
                <Bookmark className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#222222]">Belum Ada Ayat Tersimpan</h2>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Tekan tombol bookmark pada ayat mana pun saat membaca Al-Qur'an untuk menyimpannya ke daftar ini.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => onNavigateToAyah(bm.surahNomor, bm.ayahNomor)}
                className="p-5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:shadow-md transition group cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-mono text-xs font-bold border border-[#E5BD58]/30">
                      QS. {bm.surahNomor}:{bm.ayahNomor}
                    </span>
                    <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                      Surat {bm.surahName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleRemoveBookmark(bm.surahNomor, bm.ayahNomor, e)}
                      className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:border-rose-300 hover:bg-rose-50 text-[#737373] hover:text-rose-600 flex items-center justify-center transition"
                      title="Hapus bookmark"
                      aria-label="Hapus bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] flex items-center justify-center group-hover:bg-[#C49A3A] group-hover:text-white transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <p className="font-quran text-lg sm:text-xl text-[#222222] text-right leading-loose pt-1" dir="rtl">
                  {bm.teksArab}
                </p>

                {bm.teksIndonesia && (
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed line-clamp-2 italic">
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
            <div className="p-12 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mx-auto">
                <StickyNote className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#222222]">Belum Ada Catatan Tadabbur</h2>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Buka ayat di halaman pembaca dan tekan tombol catatan untuk menulis renungan atau tadabbur Anda.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onNavigateToAyah(note.surahNomor, note.ayahNomor)}
                className="p-5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:shadow-md transition group cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-mono text-xs font-bold border border-[#E5BD58]/30">
                      QS. {note.surahNomor}:{note.ayahNomor}
                    </span>
                    <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                      Surat {note.surahName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDeleteNote(note.surahNomor, note.ayahNomor, e)}
                      className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] hover:border-rose-300 hover:bg-rose-50 text-[#737373] hover:text-rose-600 flex items-center justify-center transition"
                      title="Hapus catatan"
                      aria-label="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] text-[#C49A3A] flex items-center justify-center group-hover:bg-[#C49A3A] group-hover:text-white transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-xs sm:text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                  {note.noteText}
                </div>

                <div className="flex items-center justify-between text-xs text-[#737373] pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C49A3A]" />
                    Diperbarui: {new Date(note.updatedAt).toLocaleDateString('id-ID')}
                  </span>
                  <span className="font-semibold text-[#C49A3A] group-hover:underline">
                    Buka Ayat Lengkap &rarr;
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
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#737373]">Daftar aktivitas membaca tilawah terakhir:</span>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition"
              >
                Hapus Semua Riwayat
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mx-auto">
                <History className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#222222]">Belum Ada Riwayat Membaca</h2>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Surat dan ayat terakhir yang Anda baca akan otomatis tercatat di sini untuk memudahkan Anda melanjutkan tilawah kapan pun.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item, index) => (
                <div
                  key={`${item.surahNomor}-${index}`}
                  onClick={() => onNavigateToAyah(item.surahNomor, item.ayahNomor)}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#E5BD58] hover:shadow-xs transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] group-hover:bg-[#C49A3A] group-hover:text-white transition flex items-center justify-center font-mono font-bold text-xs text-[#C49A3A]">
                      {String(item.surahNomor).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                        Surat {item.surahLatin}
                      </h3>
                      <p className="text-xs text-[#737373]">Posisi terakhir: Ayat {item.ayahNomor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-quran text-lg text-[#C49A3A] hidden sm:inline">
                      {item.surahName}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] group-hover:bg-[#FAF3DF] text-[#737373] group-hover:text-[#C49A3A] flex items-center justify-center transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
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
