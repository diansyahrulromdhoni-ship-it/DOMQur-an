export interface SurahListItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface AyahItem {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahNavigation {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  ayat: AyahItem[];
  suratSelanjutnya: SurahNavigation | false;
  suratSebelumnya: SurahNavigation | false;
}

export interface TafsirItem {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirItem[];
}

export interface Bookmark {
  id: string; // `${surahNomor}:${ayahNomor}`
  surahNomor: number;
  surahName: string;
  ayahNomor: number;
  teksArab: string;
  teksIndonesia: string;
  timestamp: number;
}

export interface AyahNote {
  id: string; // `${surahNomor}:${ayahNomor}`
  surahNomor: number;
  surahName: string;
  ayahNomor: number;
  noteText: string;
  updatedAt: number;
}

export interface ReadingHistoryItem {
  surahNomor: number;
  surahName: string;
  surahLatin: string;
  ayahNomor: number;
  timestamp: number;
}

export interface UserSettings {
  arabicFontSize: number; // e.g. 24, 28, 32, 36, 40
  translationFontSize: number; // e.g. 14, 16, 18, 20
  showTranslation: boolean;
  showTransliteration: boolean;
  dailyTargetAyat: number;
  selectedQari: string; // "01" .. "06"
  autoScrollSpeed: number; // pixels per frame or speed multiplier
  fontFamily?: 'Amiri' | 'Scheherazade New' | string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  count: number;
}
