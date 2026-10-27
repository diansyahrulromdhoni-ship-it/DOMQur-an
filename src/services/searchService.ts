import { SurahListItem, SurahDetail } from '../types/quran';
import { quranApi } from './quranApi';

export interface SearchResultItem {
  type: 'surah' | 'ayah';
  surahNomor: number;
  surahName: string;
  surahLatin: string;
  ayahNomor?: number;
  teksArab?: string;
  teksIndonesia?: string;
  matchHighlight?: string;
}

// In-memory cache of surahs with loaded verses for translation search
const loadedSurahDetails = new Map<number, SurahDetail>();

export const searchService = {
  /**
   * Search surah by name, latin, or meaning
   */
  searchSurahList(surahs: SurahListItem[], query: string): SurahListItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;

    // Check if query is just a number
    const num = parseInt(q, 10);
    if (!isNaN(num)) {
      const byNum = surahs.filter((s) => s.nomor === num);
      if (byNum.length > 0) return byNum;
    }

    return surahs.filter((s) => {
      const matchLatin = s.namaLatin.toLowerCase().includes(q);
      const matchArti = s.arti.toLowerCase().includes(q);
      const matchArab = s.nama.includes(q);
      const matchTempat = s.tempatTurun.toLowerCase().includes(q);
      return matchLatin || matchArti || matchArab || matchTempat;
    });
  },

  /**
   * Parse potential surah:ayah query, like "2:255" or "18 10" or "al baqarah 255"
   */
  parseSurahAyahPattern(query: string, surahs: SurahListItem[]): { surahNomor: number; ayahNomor: number } | null {
    const q = query.trim().toLowerCase();

    // Pattern 1: "2:255" or "2 255"
    const digitMatch = q.match(/^(\d{1,3})[:\s]+(\d{1,3})$/);
    if (digitMatch) {
      const sNum = parseInt(digitMatch[1], 10);
      const aNum = parseInt(digitMatch[2], 10);
      if (sNum >= 1 && sNum <= 114) {
        return { surahNomor: sNum, ayahNomor: aNum };
      }
    }

    // Pattern 2: "al baqarah 255" or "al-kahfi 10"
    for (const s of surahs) {
      const sLatin = s.namaLatin.toLowerCase().replace(/['\-]/g, '');
      const cleanQ = q.replace(/['\-]/g, '');
      if (cleanQ.startsWith(sLatin)) {
        const rest = cleanQ.slice(sLatin.length).trim().replace(/^ayat|^[:\s]+/, '').trim();
        const aNum = parseInt(rest, 10);
        if (!isNaN(aNum) && aNum >= 1 && aNum <= s.jumlahAyat) {
          return { surahNomor: s.nomor, ayahNomor: aNum };
        }
      }
    }

    return null;
  },

  /**
   * Search across verses translation
   * Pre-loads the popular surahs or specified ones on demand
   */
  async searchVerses(
    query: string,
    surahs: SurahListItem[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: SearchResultItem[] = [];

    // Check for direct surah:ayah pattern first
    const directTarget = this.parseSurahAyahPattern(query, surahs);
    if (directTarget) {
      try {
        const detail = await quranApi.getSurahDetail(directTarget.surahNomor);
        const ayah = detail.ayat.find((a) => a.nomorAyat === directTarget.ayahNomor);
        if (ayah) {
          results.push({
            type: 'ayah',
            surahNomor: directTarget.surahNomor,
            surahName: detail.nama,
            surahLatin: detail.namaLatin,
            ayahNomor: ayah.nomorAyat,
            teksArab: ayah.teksArab,
            teksIndonesia: ayah.teksIndonesia,
            matchHighlight: `Ayat ${ayah.nomorAyat}`
          });
          return results;
        }
      } catch (e) {
        console.warn('Direct ayah fetch failed:', e);
      }
    }

    // First search surah metadata
    surahs.forEach((s) => {
      if (
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nama.includes(q)
      ) {
        results.push({
          type: 'surah',
          surahNomor: s.nomor,
          surahName: s.nama,
          surahLatin: s.namaLatin,
          matchHighlight: `Surat ke-${s.nomor} • ${s.arti} (${s.jumlahAyat} ayat)`
        });
      }
    });

    // We search loaded surahs in cache, and can query key surahs or surahs that match
    // To ensure fast mobile performance without fetching 114 surahs simultaneously,
    // search through already loaded surahs or top surahs (Fatihah, Baqarah, Yasin, Al-Kahf, Al-Mulk, etc.)
    const prioritizedSurahs = [1, 2, 3, 18, 36, 55, 56, 67, 112, 113, 114];
    const surahsToScan = Array.from(new Set([...prioritizedSurahs, ...Array.from(loadedSurahDetails.keys())]));

    let scanned = 0;
    for (const surahId of surahsToScan) {
      try {
        let detail = loadedSurahDetails.get(surahId);
        if (!detail) {
          detail = await quranApi.getSurahDetail(surahId);
          loadedSurahDetails.set(surahId, detail);
        }

        scanned++;
        if (onProgress) {
          onProgress(scanned, surahsToScan.length);
        }

        // Match translation or transliteration
        detail.ayat.forEach((ayah) => {
          const indo = ayah.teksIndonesia.toLowerCase();
          const latin = ayah.teksLatin.toLowerCase();
          if (indo.includes(q) || latin.includes(q)) {
            results.push({
              type: 'ayah',
              surahNomor: detail!.nomor,
              surahName: detail!.nama,
              surahLatin: detail!.namaLatin,
              ayahNomor: ayah.nomorAyat,
              teksArab: ayah.teksArab,
              teksIndonesia: ayah.teksIndonesia,
              matchHighlight: `Surat ${detail!.namaLatin} : Ayat ${ayah.nomorAyat}`
            });
          }
        });

        // Limit results to keep interface swift
        if (results.length > 50) break;
      } catch (err) {
        console.warn(`Error scanning surah ${surahId}:`, err);
      }
    }

    return results;
  },

  cacheLoadedSurah(detail: SurahDetail) {
    loadedSurahDetails.set(detail.nomor, detail);
  }
};
