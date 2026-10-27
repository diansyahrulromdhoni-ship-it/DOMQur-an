import { Bookmark, AyahNote, ReadingHistoryItem, UserSettings, DailyProgress } from '../types/quran';

const STORAGE_KEYS = {
  BOOKMARKS: 'aadom_bookmarks_v1',
  NOTES: 'aadom_notes_v1',
  HISTORY: 'aadom_history_v1',
  LAST_READ: 'aadom_last_read_v1',
  SETTINGS: 'aadom_settings_v1',
  DAILY_PROGRESS: 'aadom_daily_progress_v1'
};

export const DEFAULT_SETTINGS: UserSettings = {
  arabicFontSize: 28,
  translationFontSize: 15,
  showTranslation: true,
  showTransliteration: true,
  dailyTargetAyat: 10,
  selectedQari: '05', // Misyari Rasyid Al-Afasi
  autoScrollSpeed: 1.5,
  fontFamily: 'Amiri'
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
    return false;
  }
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const quranStorage = {
  // Settings
  getSettings(): UserSettings {
    const saved = safeGetItem<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  },

  saveSettings(settings: UserSettings): void {
    safeSetItem(STORAGE_KEYS.SETTINGS, settings);
  },

  resetSettings(): UserSettings {
    safeSetItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    return safeGetItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  },

  isBookmarked(surahNomor: number, ayahNomor: number): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.surahNomor === surahNomor && b.ayahNomor === ayahNomor);
  },

  toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'timestamp'>): boolean {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex(
      (b) => b.surahNomor === bookmark.surahNomor && b.ayahNomor === bookmark.ayahNomor
    );

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      safeSetItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return false; // Removed
    } else {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: `${bookmark.surahNomor}:${bookmark.ayahNomor}`,
        timestamp: Date.now()
      };
      bookmarks.unshift(newBookmark);
      safeSetItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return true; // Added
    }
  },

  removeBookmark(surahNomor: number, ayahNomor: number): void {
    const bookmarks = this.getBookmarks().filter(
      (b) => !(b.surahNomor === surahNomor && b.ayahNomor === ayahNomor)
    );
    safeSetItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
  },

  // Notes
  getNotes(): AyahNote[] {
    return safeGetItem<AyahNote[]>(STORAGE_KEYS.NOTES, []);
  },

  getNote(surahNomor: number, ayahNomor: number): string {
    const notes = this.getNotes();
    const found = notes.find((n) => n.surahNomor === surahNomor && n.ayahNomor === ayahNomor);
    return found ? found.noteText : '';
  },

  saveNote(surahNomor: number, surahName: string, ayahNomor: number, noteText: string): void {
    const notes = this.getNotes();
    const existingIndex = notes.findIndex(
      (n) => n.surahNomor === surahNomor && n.ayahNomor === ayahNomor
    );

    const trimmed = (noteText || '').trim();

    if (!trimmed) {
      // Remove empty note
      if (existingIndex >= 0) {
        notes.splice(existingIndex, 1);
        safeSetItem(STORAGE_KEYS.NOTES, notes);
      }
      return;
    }

    const noteItem: AyahNote = {
      id: `${surahNomor}:${ayahNomor}`,
      surahNomor,
      surahName,
      ayahNomor,
      noteText: trimmed,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      notes[existingIndex] = noteItem;
    } else {
      notes.unshift(noteItem);
    }
    safeSetItem(STORAGE_KEYS.NOTES, notes);
  },

  deleteNote(surahNomor: number, ayahNomor: number): void {
    const notes = this.getNotes().filter(
      (n) => !(n.surahNomor === surahNomor && n.ayahNomor === ayahNomor)
    );
    safeSetItem(STORAGE_KEYS.NOTES, notes);
  },

  // Last Read Position
  getLastRead(): ReadingHistoryItem | null {
    return safeGetItem<ReadingHistoryItem | null>(STORAGE_KEYS.LAST_READ, null);
  },

  setLastRead(item: ReadingHistoryItem): void {
    safeSetItem(STORAGE_KEYS.LAST_READ, item);
    this.addHistory(item);
    this.incrementDailyProgress();
  },

  // History
  getHistory(): ReadingHistoryItem[] {
    return safeGetItem<ReadingHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  },

  addHistory(item: ReadingHistoryItem): void {
    const list = this.getHistory().filter((h) => h.surahNomor !== item.surahNomor);
    list.unshift(item);
    // Keep max 20 entries
    if (list.length > 20) list.pop();
    safeSetItem(STORAGE_KEYS.HISTORY, list);
  },

  clearHistory(): void {
    safeSetItem(STORAGE_KEYS.HISTORY, []);
    safeSetItem(STORAGE_KEYS.LAST_READ, null);
  },

  // Daily Tilawah Progress
  getDailyProgress(): DailyProgress {
    const today = getTodayString();
    const stored = safeGetItem<DailyProgress>(STORAGE_KEYS.DAILY_PROGRESS, {
      date: today,
      count: 0
    });

    if (stored.date !== today) {
      const resetProgress = { date: today, count: 0 };
      safeSetItem(STORAGE_KEYS.DAILY_PROGRESS, resetProgress);
      return resetProgress;
    }
    return stored;
  },

  incrementDailyProgress(): void {
    const progress = this.getDailyProgress();
    progress.count += 1;
    safeSetItem(STORAGE_KEYS.DAILY_PROGRESS, progress);
  },

  resetDailyProgress(): void {
    const today = getTodayString();
    safeSetItem(STORAGE_KEYS.DAILY_PROGRESS, { date: today, count: 0 });
  }
};
