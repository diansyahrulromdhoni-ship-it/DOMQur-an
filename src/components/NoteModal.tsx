import React, { useState, useEffect } from 'react';
import { X, StickyNote, Save, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-[#151515] border border-[#262626] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646]">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 id="note-modal-title" className="text-sm font-bold text-white">
                Catatan Pribadi
              </h3>
              <p className="text-xs text-[#B8B8B8]">{surahName} : Ayat {ayahNomor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B8B8B8] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <label htmlFor="ayah-note-textarea" className="text-xs text-[#B8B8B8] block">
            Tulis tadabbur, renungan, atau catatan pribadi untuk ayat ini (tersimpan di perangkat):
          </label>
          <textarea
            id="ayah-note-textarea"
            rows={5}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tuliskan catatan Anda di sini..."
            className="w-full bg-black/60 border border-[#262626] focus:border-[#F6C646] rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none transition resize-none placeholder:text-[#555]"
          />

          {isSavedNotice && (
            <p className="text-xs text-[#F6C646] font-medium text-center">Catatan berhasil disimpan!</p>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#262626] bg-[#121212] flex items-center justify-between">
          {noteText ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition"
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
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1E1E1E] hover:bg-[#262626] text-[#B8B8B8] transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#F6C646] hover:bg-[#FFD455] text-black transition shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
