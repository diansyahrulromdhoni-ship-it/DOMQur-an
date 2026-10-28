/**
 * Wilayah Indonesia Administrative Service
 * Source: Official BPS API Mirror (emsifa / api-wilayah-indonesia)
 * Structure: Negara (Indonesia) -> Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan
 * Fully offline-capable with embedded 38 provinces & Banten fallback, and localStorage caching.
 */

export interface ProvinceItem {
  id: string;
  name: string;
}

export interface RegencyItem {
  id: string;
  province_id: string;
  name: string;
}

export interface DistrictItem {
  id: string;
  regency_id: string;
  name: string;
}

export interface VillageItem {
  id: string;
  district_id: string;
  name: string;
}

export interface ActiveLocation {
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtId?: string;
  districtName?: string;
  villageId?: string;
  villageName?: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: number; // 7 = WIB, 8 = WITA, 9 = WIT
  timezoneIana: string;
  isGps?: boolean;
}

const API_BASE = 'https://emsifa.github.io/api-wilayah-indonesia/api';

// Cache in memory & localStorage
const CACHE_PREFIX = 'mydom_wilayah_cache_';

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore cache read error
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Ignore cache write error
  }
}

// Fallback Embedded 38 Provinces of Indonesia (Official 2024/2026 BPS list)
export const FALLBACK_PROVINCES: ProvinceItem[] = [
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DAERAH ISTIMEWA YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '92', name: 'PAPUA BARAT DAYA' },
  { id: '93', name: 'PAPUA' },
  { id: '94', name: 'PAPUA SELATAN' },
  { id: '95', name: 'PAPUA TENGAH' },
  { id: '96', name: 'PAPUA PEGUNUNGAN' }
];

// Fallback Regencies for Banten (36)
export const FALLBACK_BANTEN_REGENCIES: RegencyItem[] = [
  { id: '3601', province_id: '36', name: 'KABUPATEN PANDEGLANG' },
  { id: '3602', province_id: '36', name: 'KABUPATEN LEBAK' },
  { id: '3603', province_id: '36', name: 'KABUPATEN TANGERANG' },
  { id: '3604', province_id: '36', name: 'KABUPATEN SERANG' },
  { id: '3671', province_id: '36', name: 'KOTA TANGERANG' },
  { id: '3672', province_id: '36', name: 'KOTA CILEGON' },
  { id: '3673', province_id: '36', name: 'KOTA SERANG' },
  { id: '3674', province_id: '36', name: 'KOTA TANGERANG SELATAN' }
];

// Approximate coordinates and timezone mapping
export const REGENCY_COORDINATES: Record<string, { lat: number; lng: number; tz: number; iana: string }> = {
  // Banten
  '3601': { lat: -6.3084, lng: 106.1066, tz: 7, iana: 'Asia/Jakarta' }, // Pandeglang
  '3602': { lat: -6.5684, lng: 106.2514, tz: 7, iana: 'Asia/Jakarta' }, // Lebak
  '3603': { lat: -6.1783, lng: 106.4674, tz: 7, iana: 'Asia/Jakarta' }, // Kab Tangerang
  '3604': { lat: -6.1153, lng: 106.1542, tz: 7, iana: 'Asia/Jakarta' }, // Kab Serang
  '3671': { lat: -6.1783, lng: 106.6319, tz: 7, iana: 'Asia/Jakarta' }, // Kota Tangerang
  '3672': { lat: -6.0174, lng: 106.0538, tz: 7, iana: 'Asia/Jakarta' }, // Kota Cilegon
  '3673': { lat: -6.1200, lng: 106.1503, tz: 7, iana: 'Asia/Jakarta' }, // Kota Serang
  '3674': { lat: -6.2938, lng: 106.7118, tz: 7, iana: 'Asia/Jakarta' }, // Tangsel
  // DKI Jakarta
  '3171': { lat: -6.2297, lng: 106.8456, tz: 7, iana: 'Asia/Jakarta' }, // Jaksel
  '3172': { lat: -6.2115, lng: 106.8452, tz: 7, iana: 'Asia/Jakarta' }, // Jaktim
  '3173': { lat: -6.1865, lng: 106.8341, tz: 7, iana: 'Asia/Jakarta' }, // Jakpus
  '3174': { lat: -6.1683, lng: 106.7588, tz: 7, iana: 'Asia/Jakarta' }, // Jakbar
  '3175': { lat: -6.1214, lng: 106.8824, tz: 7, iana: 'Asia/Jakarta' }, // Jakut
  // Jabar
  '3273': { lat: -6.9175, lng: 107.6191, tz: 7, iana: 'Asia/Jakarta' }, // Kota Bandung
  '3271': { lat: -6.5971, lng: 106.8060, tz: 7, iana: 'Asia/Jakarta' }, // Kota Bogor
  '3275': { lat: -6.2383, lng: 106.9756, tz: 7, iana: 'Asia/Jakarta' }, // Kota Bekasi
  '3276': { lat: -6.4025, lng: 106.7942, tz: 7, iana: 'Asia/Jakarta' }, // Kota Depok
  // Jateng & DIY
  '3374': { lat: -6.9667, lng: 110.4167, tz: 7, iana: 'Asia/Jakarta' }, // Semarang
  '3372': { lat: -7.5667, lng: 110.8167, tz: 7, iana: 'Asia/Jakarta' }, // Surakarta
  '3471': { lat: -7.7956, lng: 110.3695, tz: 7, iana: 'Asia/Jakarta' }, // Yogyakarta
  // Jatim
  '3578': { lat: -7.2575, lng: 112.7521, tz: 7, iana: 'Asia/Jakarta' }, // Surabaya
  '3573': { lat: -7.9797, lng: 112.6304, tz: 7, iana: 'Asia/Jakarta' }, // Malang
  // Bali & Nusa Tenggara (WITA)
  '5171': { lat: -8.6705, lng: 115.2126, tz: 8, iana: 'Asia/Makassar' }, // Denpasar
  '5271': { lat: -8.5833, lng: 116.1167, tz: 8, iana: 'Asia/Makassar' }, // Mataram
  '5371': { lat: -10.1772, lng: 123.6070, tz: 8, iana: 'Asia/Makassar' }, // Kupang
  // Sumatera
  '1171': { lat: 5.5483, lng: 95.3238, tz: 7, iana: 'Asia/Jakarta' }, // Banda Aceh
  '1271': { lat: 3.5952, lng: 98.6722, tz: 7, iana: 'Asia/Jakarta' }, // Medan
  '1371': { lat: -0.9471, lng: 100.4172, tz: 7, iana: 'Asia/Jakarta' }, // Padang
  '1671': { lat: -2.9761, lng: 104.7754, tz: 7, iana: 'Asia/Jakarta' }, // Palembang
  // Kalimantan
  '6171': { lat: -0.0263, lng: 109.3425, tz: 7, iana: 'Asia/Pontianak' }, // Pontianak
  '6371': { lat: -3.3194, lng: 114.5908, tz: 8, iana: 'Asia/Makassar' }, // Banjarmasin
  '6471': { lat: -1.2379, lng: 116.8289, tz: 8, iana: 'Asia/Makassar' }, // Balikpapan
  '6472': { lat: -0.5022, lng: 117.1536, tz: 8, iana: 'Asia/Makassar' }, // Samarinda
  // Sulawesi
  '7371': { lat: -5.1477, lng: 119.4327, tz: 8, iana: 'Asia/Makassar' }, // Makassar
  '7171': { lat: 1.4748, lng: 124.8421, tz: 8, iana: 'Asia/Makassar' }, // Manado
  // Maluku & Papua (WIT)
  '8171': { lat: -3.6547, lng: 128.1906, tz: 9, iana: 'Asia/Jayapura' }, // Ambon
  '9371': { lat: -2.5337, lng: 140.7181, tz: 9, iana: 'Asia/Jayapura' }  // Jayapura
};

// Provincial centroid & timezone resolver
export function getProvinceCentroid(provId: string): { lat: number; lng: number; tz: number; iana: string } {
  const numId = parseInt(provId, 10);
  // WIT: Maluku, Maluku Utara, Papua (81, 82, 91-96)
  if (numId === 81 || numId === 82 || numId >= 91) {
    return { lat: -3.5, lng: 135.0, tz: 9, iana: 'Asia/Jayapura' };
  }
  // WITA: Bali (51), NTB (52), NTT (53), Kalsel (63), Kaltim (64), Kaltara (65), Sulawesi (71-76)
  if ([51, 52, 53, 63, 64, 65, 71, 72, 73, 74, 75, 76].includes(numId)) {
    return { lat: -3.0, lng: 118.0, tz: 8, iana: 'Asia/Makassar' };
  }
  // WIB: Sumatra & Java & Kalbar/Kalteng
  return { lat: -6.2, lng: 106.8, tz: 7, iana: 'Asia/Jakarta' };
}

export class WilayahService {
  /**
   * Fetch all 38 provinces in Indonesia
   */
  async getProvinces(): Promise<ProvinceItem[]> {
    const cached = getCached<ProvinceItem[]>('provinces');
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const res = await fetch(`${API_BASE}/provinces.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ProvinceItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCache('provinces', data);
        return data;
      }
    } catch (e) {
      console.warn('Wilayah API getProvinces fallback:', e);
    }
    return FALLBACK_PROVINCES;
  }

  /**
   * Fetch regencies/cities in a province
   */
  async getRegencies(provinceId: string): Promise<RegencyItem[]> {
    const cacheKey = `regencies_${provinceId}`;
    const cached = getCached<RegencyItem[]>(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const res = await fetch(`${API_BASE}/regencies/${provinceId}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RegencyItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCache(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn(`Wilayah API getRegencies(${provinceId}) fallback:`, e);
    }

    if (provinceId === '36') {
      return FALLBACK_BANTEN_REGENCIES;
    }
    return [];
  }

  /**
   * Fetch districts (kecamatan) in a regency/city
   */
  async getDistricts(regencyId: string): Promise<DistrictItem[]> {
    const cacheKey = `districts_${regencyId}`;
    const cached = getCached<DistrictItem[]>(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const res = await fetch(`${API_BASE}/districts/${regencyId}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DistrictItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCache(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn(`Wilayah API getDistricts(${regencyId}) fallback:`, e);
    }
    return [];
  }

  /**
   * Fetch villages (desa/kelurahan) in a district
   */
  async getVillages(districtId: string): Promise<VillageItem[]> {
    const cacheKey = `villages_${districtId}`;
    const cached = getCached<VillageItem[]>(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const res = await fetch(`${API_BASE}/villages/${districtId}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: VillageItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCache(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn(`Wilayah API getVillages(${districtId}) fallback:`, e);
    }
    return [];
  }

  /**
   * Format name from ALL CAPS to Title Case (e.g. KOTA TANGERANG SELATAN -> Kota Tangerang Selatan)
   */
  toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bKabupaten\b/g, 'Kab.')
      .replace(/\bDki\b/g, 'DKI')
      .replace(/\bDiy\b/g, 'DIY');
  }

  /**
   * Resolve location coordinates and timezone based on hierarchy
   */
  resolveCoordinates(
    provinceId: string,
    regencyId: string,
    userGps?: { lat: number; lng: number }
  ): { lat: number; lng: number; tz: number; iana: string } {
    if (userGps) {
      const provInfo = getProvinceCentroid(provinceId);
      return {
        lat: userGps.lat,
        lng: userGps.lng,
        tz: provInfo.tz,
        iana: provInfo.iana
      };
    }

    if (REGENCY_COORDINATES[regencyId]) {
      return REGENCY_COORDINATES[regencyId];
    }

    return getProvinceCentroid(provinceId);
  }
}

export const wilayahService = new WilayahService();

export const STORAGE_WILAYAH_KEY = 'mydom_active_location_v3';

export const DEFAULT_ACTIVE_LOCATION: ActiveLocation = {
  provinceId: '36',
  provinceName: 'Banten',
  regencyId: '3674',
  regencyName: 'Kota Tangerang Selatan',
  districtId: '3674020',
  districtName: 'Serpong',
  displayName: 'Kota Tangerang Selatan, Banten',
  latitude: -6.2938,
  longitude: 106.7118,
  timezone: 7,
  timezoneIana: 'Asia/Jakarta',
  isGps: false
};

export function getActiveLocation(): ActiveLocation {
  try {
    const raw = localStorage.getItem(STORAGE_WILAYAH_KEY);
    if (raw) return JSON.parse(raw);

    // Fallback to legacy key if exists
    const legacy = localStorage.getItem('mydom_saved_location') || localStorage.getItem('aadom_saved_location');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return {
        ...DEFAULT_ACTIVE_LOCATION,
        displayName: parsed.name ? `${parsed.name}, ${parsed.province || 'Banten'}` : DEFAULT_ACTIVE_LOCATION.displayName,
        regencyName: parsed.name || DEFAULT_ACTIVE_LOCATION.regencyName,
        provinceName: parsed.province || DEFAULT_ACTIVE_LOCATION.provinceName,
        districtName: parsed.district || DEFAULT_ACTIVE_LOCATION.districtName,
        latitude: parsed.latitude || DEFAULT_ACTIVE_LOCATION.latitude,
        longitude: parsed.longitude || DEFAULT_ACTIVE_LOCATION.longitude,
        timezone: parsed.timezone || DEFAULT_ACTIVE_LOCATION.timezone,
        timezoneIana: parsed.timezoneIana || DEFAULT_ACTIVE_LOCATION.timezoneIana
      };
    }
  } catch (e) {
    console.warn('Failed to parse active location', e);
  }
  return DEFAULT_ACTIVE_LOCATION;
}

export function saveActiveLocation(loc: ActiveLocation): void {
  try {
    localStorage.setItem(STORAGE_WILAYAH_KEY, JSON.stringify(loc));
    // Backward compatibility with legacy storage keys
    localStorage.setItem('mydom_saved_location', JSON.stringify({
      name: loc.regencyName,
      type: loc.regencyName.includes('Kota') ? 'Kota' : 'Kabupaten',
      province: loc.provinceName,
      district: loc.districtName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      timezoneIana: loc.timezoneIana
    }));
    localStorage.setItem('aadom_saved_location', JSON.stringify({
      name: loc.districtName ? `${loc.districtName}, ${loc.regencyName}` : loc.regencyName,
      province: loc.provinceName,
      country: 'Indonesia',
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      timezoneIana: loc.timezoneIana
    }));
    // Dispatch global event so all pages instantly update
    window.dispatchEvent(new CustomEvent('mydom_location_changed', { detail: loc }));
  } catch (e) {
    console.warn('Failed to save active location', e);
  }
}
