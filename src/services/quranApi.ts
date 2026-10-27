import { SurahListItem, SurahDetail, TafsirDetail } from '../types/quran';

const BASE_URL = 'https://equran.id/api/v2';
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

// In-memory cache for fast responsive navigation
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < retries) {
        // Exponential backoff: 400ms, 800ms
        await new Promise((res) => setTimeout(res, 400 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export const quranApi = {
  /**
   * Fetch complete list of 114 Surahs
   */
  async getAllSurahs(): Promise<SurahListItem[]> {
    const cacheKey = 'surat_all';
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as SurahListItem[];
    }

    try {
      const response = await fetchWithRetry(`${BASE_URL}/surat`);
      const json = await response.json();

      if (!json || json.code !== 200 || !Array.isArray(json.data)) {
        throw new Error(json?.message || 'Format respons daftar surat tidak valid.');
      }

      memoryCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
      return json.data as SurahListItem[];
    } catch (error) {
      console.error('Gagal mengambil daftar surat:', error);
      throw error;
    }
  },

  /**
   * Fetch Surah detail with its verses
   */
  async getSurahDetail(nomor: number): Promise<SurahDetail> {
    if (!nomor || nomor < 1 || nomor > 114) {
      throw new Error(`Nomor surat tidak valid: ${nomor}`);
    }

    const cacheKey = `surat_${nomor}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as SurahDetail;
    }

    try {
      const response = await fetchWithRetry(`${BASE_URL}/surat/${nomor}`);
      const json = await response.json();

      if (!json || json.code !== 200 || !json.data || !Array.isArray(json.data.ayat)) {
        throw new Error(json?.message || `Format respons surat nomor ${nomor} tidak valid.`);
      }

      memoryCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
      return json.data as SurahDetail;
    } catch (error) {
      console.error(`Gagal mengambil rincian surat ${nomor}:`, error);
      throw error;
    }
  },

  /**
   * Fetch Tafsir for a specific Surah
   */
  async getTafsirDetail(nomor: number): Promise<TafsirDetail> {
    if (!nomor || nomor < 1 || nomor > 114) {
      throw new Error(`Nomor surat untuk tafsir tidak valid: ${nomor}`);
    }

    const cacheKey = `tafsir_${nomor}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as TafsirDetail;
    }

    try {
      const response = await fetchWithRetry(`${BASE_URL}/tafsir/${nomor}`);
      const json = await response.json();

      if (!json || json.code !== 200 || !json.data || !Array.isArray(json.data.tafsir)) {
        throw new Error(json?.message || `Format respons tafsir surat nomor ${nomor} tidak valid.`);
      }

      memoryCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
      return json.data as TafsirDetail;
    } catch (error) {
      console.error(`Gagal mengambil tafsir surat ${nomor}:`, error);
      throw error;
    }
  }
};
