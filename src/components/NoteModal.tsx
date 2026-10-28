import React, { useState, useEffect } from 'react';
import { X, StickyNote, Save, Trash2, Check } from 'lucide-react';
import { quranStorage } from '../storage/quranStorage';

interface Props {
  surahNomor: number;
  surahName: string;
  ayahNomor: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const NoteModal: React.FC<Props> = ({
  surahNomor,
  surahName,
  ayahNomor,
  isOpen,
  onClose,
  onSaved
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const existing = quranStorage.getNote(surahNomor, ayahNomor);
      setNoteText(existing);
      setIsSavedNotice(false);
    }
  }, [isOpen, surahNomor, ayahNomor]);

  if (!isOpen) return null;

  const handleSave = () => {
    quranStorage.saveNote(surahNomor, surahName, ayahNomor, noteText);
    setIsSavedNotice(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    quranStorage.deleteNote(surahNomor, ayahNomor);
    setNoteText('');
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white border border-[#EAEAEA] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-[#222222]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h2 id="note-modal-title" className="text-sm font-bold text-[#222222]">
                Catatan Tadabbur Ayat
              </h2>
              <p className="text-xs text-[#737373]">
                QS. {surahName} : Ayat {ayahNomor}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#EAEAEA] flex items-center justify-center transition"
            aria-label="Tutup catatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-[#737373] leading-relaxed">
            Tuliskan renungan, mutiara hikmah, atau refleksi pribadi untuk ayat ini. Catatan disimpan secara offline pada perangkat ini.
          </p>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tuliskan renungan tadabbur Anda di sini..."
            rows={5}
            className="w-full bg-[#F8F8F8] border border-[#EAEAEA] rounded-2xl p-3.5 text-xs sm:text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:border-[#C49A3A] focus:ring-2 focus:ring-[#FAF3DF] resize-none transition"
          />

          {isSavedNotice && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Catatan berhasil disimpan ke perangkat!</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-[#EAEAEA] bg-[#F8F8F8]">
          {noteText.trim() ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737373] hover:text-[#222222] hover:bg-white border border-transparent hover:border-[#EAEAEA] transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C49A3A] hover:bg-[#B3892B] text-white shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
