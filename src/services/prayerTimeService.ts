/**
 * Comprehensive Islamic Prayer Times & Astronomical Calculator
 * Combines real-time API support (Aladhan API) with accurate local astronomical computation
 * (Kemenag RI standard & international methods), multi-day schedule, Hijri date, and caching.
 */

export interface PrayerTimes {
  imsak: string;    // HH:mm (10 min before Subuh / verified API)
  subuh: string;    // HH:mm
  terbit: string;   // HH:mm (Syuruq / Sunrise)
  dzuhur: string;   // HH:mm
  ashar: string;    // HH:mm
  maghrib: string;  // HH:mm
  isya: string;     // HH:mm
  source: 'api' | 'astronomical_cache' | 'astronomical_calc';
  methodName: string;
  raw: {
    imsak: Date;
    subuh: Date;
    terbit: Date;
    dzuhur: Date;
    ashar: Date;
    maghrib: Date;
    isya: Date;
  };
}

export interface LocationInfo {
  name: string;
  province?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g. 7 for WIB, 8 for WITA, 9 for WIT
  timezoneIana?: string; // e.g. "Asia/Jakarta"
}

export interface NextPrayerInfo {
  name: 'Imsak' | 'Subuh' | 'Terbit' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya';
  time: string;
  remainingSeconds: number;
  formattedRemaining: string;
  isToday: boolean;
}

export interface DayScheduleItem {
  date: Date;
  dateStr: string;
  hijriStr: string;
  dayName: string;
  times: PrayerTimes;
}

// Popular Indonesian Cities & Islamic Centers with verified IANA timezones
export const PRESET_LOCATIONS: LocationInfo[] = [
  { name: 'Jakarta', province: 'DKI Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Bandung', province: 'Jawa Barat', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Surabaya', province: 'Jawa Timur', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Semarang', province: 'Jawa Tengah', country: 'Indonesia', latitude: -6.9667, longitude: 110.4167, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Yogyakarta', province: 'D.I. Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Medan', province: 'Sumatera Utara', country: 'Indonesia', latitude: 3.5952, longitude: 98.6722, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Palembang', province: 'Sumatera Selatan', country: 'Indonesia', latitude: -2.9761, longitude: 104.7754, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Banda Aceh', province: 'Aceh', country: 'Indonesia', latitude: 5.5483, longitude: 95.3238, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Padang', province: 'Sumatera Barat', country: 'Indonesia', latitude: -0.9471, longitude: 100.4172, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Pekanbaru', province: 'Riau', country: 'Indonesia', latitude: 0.5071, longitude: 101.4478, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Bandar Lampung', province: 'Lampung', country: 'Indonesia', latitude: -5.4500, longitude: 105.2667, timezone: 7, timezoneIana: 'Asia/Jakarta' },
  { name: 'Denpasar', province: 'Bali', country: 'Indonesia', latitude: -8.6705, longitude: 115.2126, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Mataram', province: 'Nusa Tenggara Barat', country: 'Indonesia', latitude: -8.5833, longitude: 116.1167, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Kupang', province: 'Nusa Tenggara Timur', country: 'Indonesia', latitude: -10.1772, longitude: 123.6070, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Banjarmasin', province: 'Kalimantan Selatan', country: 'Indonesia', latitude: -3.3194, longitude: 114.5908, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Balikpapan', province: 'Kalimantan Timur', country: 'Indonesia', latitude: -1.2379, longitude: 116.8289, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Pontianak', province: 'Kalimantan Barat', country: 'Indonesia', latitude: -0.0263, longitude: 109.3425, timezone: 7, timezoneIana: 'Asia/Pontianak' },
  { name: 'Makassar', province: 'Sulawesi Selatan', country: 'Indonesia', latitude: -5.1477, longitude: 119.4327, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Manado', province: 'Sulawesi Utara', country: 'Indonesia', latitude: 1.4748, longitude: 124.8428, timezone: 8, timezoneIana: 'Asia/Makassar' },
  { name: 'Ambon', province: 'Maluku', country: 'Indonesia', latitude: -3.6554, longitude: 128.1908, timezone: 9, timezoneIana: 'Asia/Jayapura' },
  { name: 'Jayapura', province: 'Papua', country: 'Indonesia', latitude: -2.5337, longitude: 140.7181, timezone: 9, timezoneIana: 'Asia/Jayapura' },
  { name: 'Mekkah (Ka\'bah)', province: 'Makkah', country: 'Arab Saudi', latitude: 21.4225, longitude: 39.8262, timezone: 3, timezoneIana: 'Asia/Riyadh' },
  { name: 'Madinah Al-Munawwarah', province: 'Madinah', country: 'Arab Saudi', latitude: 24.5247, longitude: 39.5692, timezone: 3, timezoneIana: 'Asia/Riyadh' }
];

// Kaaba Exact Coordinates in Mecca
export const KAABA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262
};

export interface CalculationMethodConfig {
  id: string;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  maghribIshaInterval?: number; // minutes
}

export const CALCULATION_METHODS: Record<string, CalculationMethodConfig> = {
  kemenag: { id: 'kemenag', name: 'Kemenag RI (Fajr 20°, Isha 18°)', fajrAngle: -20.0, ishaAngle: -18.0 },
  mwl: { id: 'mwl', name: 'Muslim World League (Fajr 18°, Isha 17°)', fajrAngle: -18.0, ishaAngle: -17.0 },
  egypt: { id: 'egypt', name: 'Egyptian General Authority (Fajr 19.5°, Isha 17.5°)', fajrAngle: -19.5, ishaAngle: -17.5 },
  makkah: { id: 'makkah', name: 'Umm Al-Qura Makkah (Fajr 18.5°, Isha 90 min)', fajrAngle: -18.5, ishaAngle: -18.0, maghribIshaInterval: 90 },
  isna: { id: 'isna', name: 'ISNA Amerika Utara (Fajr 15°, Isha 15°)', fajrAngle: -15.0, ishaAngle: -15.0 }
};

// Math helpers for spherical and solar calculations
const degToRad = (d: number) => (d * Math.PI) / 180.0;
const radToDeg = (r: number) => (r * 180.0) / Math.PI;

function sinD(d: number) { return Math.sin(degToRad(d)); }
function cosD(d: number) { return Math.cos(degToRad(d)); }
function tanD(d: number) { return Math.tan(degToRad(d)); }
function asinD(x: number) { return radToDeg(Math.asin(x)); }
function acosD(x: number) { return radToDeg(Math.acos(x)); }
function atan2D(y: number, x: number) { return radToDeg(Math.atan2(y, x)); }

function getJulianDate(date: Date): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function getSunPosition(jd: number): { declination: number; equationOfTime: number } {
  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * sinD(g) + 0.020 * sinD(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * D;

  const RA = atan2D(cosD(e) * sinD(L), cosD(L)) / 15.0;
  const declination = asinD(sinD(e) * sinD(L));
  let equationOfTime = q / 15.0 - (RA < 0 ? RA + 24 : RA);
  if (equationOfTime > 12) equationOfTime -= 24;
  if (equationOfTime < -12) equationOfTime += 24;

  return { declination, equationOfTime };
}

function decimalToDate(baseDate: Date, decHour: number, timezone: number): Date {
  let normalized = decHour;
  while (normalized < 0) normalized += 24;
  while (normalized >= 24) normalized -= 24;

  const totalMinutes = Math.round(normalized * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function padZero(num: number): string {
  return String(num).padStart(2, '0');
}

export function formatTime24(date: Date): string {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

export class PrayerTimeService {
  private cache: Map<string, { data: PrayerTimes; timestamp: number }> = new Map();
  private selectedMethodKey: string = 'kemenag';
  private asrJuristic: 'standard' | 'hanafi' = 'standard';

  public setMethod(methodKey: string) {
    if (CALCULATION_METHODS[methodKey]) {
      this.selectedMethodKey = methodKey;
    }
  }

  public getMethod(): CalculationMethodConfig {
    return CALCULATION_METHODS[this.selectedMethodKey] || CALCULATION_METHODS.kemenag;
  }

  public setAsrJuristic(juristic: 'standard' | 'hanafi') {
    this.asrJuristic = juristic;
  }

  public getAsrJuristic(): 'standard' | 'hanafi' {
    return this.asrJuristic;
  }

  /**
   * Astronomical calculation for prayer times
   */
  public calculatePrayerTimes(location: LocationInfo, date: Date = new Date()): PrayerTimes {
    const jd = getJulianDate(date);
    const { declination, equationOfTime } = getSunPosition(jd);

    const lat = location.latitude;
    const lng = location.longitude;
    const tz = location.timezone;

    const method = this.getMethod();

    // Solar noon (Dzuhur transit)
    const transit = 12 + tz - (lng / 15.0) - equationOfTime;

    // Ihtiyat (safety buffer: +2 minutes for Indonesian conventions)
    const ihtiyat = 2 / 60;

    // Subuh (Fajr)
    const fajrAngle = method.fajrAngle;
    const cosFajr = (sinD(fajrAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    const fajrHourAngle = (cosFajr >= -1 && cosFajr <= 1) ? acosD(cosFajr) / 15.0 : 6.0;

    // Sunrise / Terbit
    const sunriseAngle = -0.8333;
    const cosSunrise = (sinD(sunriseAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    const sunriseHourAngle = (cosSunrise >= -1 && cosSunrise <= 1) ? acosD(cosSunrise) / 15.0 : 6.0;

    // Sunset / Maghrib
    const sunsetHourAngle = sunriseHourAngle;

    // Isya (Isha)
    const ishaAngle = method.ishaAngle;
    const cosIsha = (sinD(ishaAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    const ishaHourAngle = (cosIsha >= -1 && cosIsha <= 1) ? acosD(cosIsha) / 15.0 : 6.0;

    // Ashar calculation
    const shadowFactor = this.asrJuristic === 'hanafi' ? 2.0 : 1.0;
    const noonShadow = Math.abs(tanD(lat - declination));
    const asrAltitude = radToDeg(Math.atan(1.0 / (shadowFactor + noonShadow)));
    const cosAsr = (sinD(asrAltitude) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    const asrHourAngle = (cosAsr >= -1 && cosAsr <= 1) ? acosD(cosAsr) / 15.0 : 3.0;

    // Decimal hours
    const subuhDec = transit - fajrHourAngle + ihtiyat;
    const imsakDec = subuhDec - (10 / 60); // 10 minutes before Subuh
    const terbitDec = transit - sunriseHourAngle - ihtiyat;
    const dzuhurDec = transit + ihtiyat;
    const asharDec = transit + asrHourAngle + ihtiyat;
    const maghribDec = transit + sunsetHourAngle + ihtiyat;
    let isyaDec = transit + ishaHourAngle + ihtiyat;

    if (method.maghribIshaInterval) {
      isyaDec = maghribDec + (method.maghribIshaInterval / 60);
    }

    const imsakDate = decimalToDate(date, imsakDec, tz);
    const subuhDate = decimalToDate(date, subuhDec, tz);
    const terbitDate = decimalToDate(date, terbitDec, tz);
    const dzuhurDate = decimalToDate(date, dzuhurDec, tz);
    const asharDate = decimalToDate(date, asharDec, tz);
    const maghribDate = decimalToDate(date, maghribDec, tz);
    const isyaDate = decimalToDate(date, isyaDec, tz);

    return {
      imsak: formatTime24(imsakDate),
      subuh: formatTime24(subuhDate),
      terbit: formatTime24(terbitDate),
      dzuhur: formatTime24(dzuhurDate),
      ashar: formatTime24(asharDate),
      maghrib: formatTime24(maghribDate),
      isya: formatTime24(isyaDate),
      source: 'astronomical_calc',
      methodName: method.name,
      raw: {
        imsak: imsakDate,
        subuh: subuhDate,
        terbit: terbitDate,
        dzuhur: dzuhurDate,
        ashar: asharDate,
        maghrib: maghribDate,
        isya: isyaDate
      }
    };
  }

  /**
   * Fetch from Aladhan API with local fallback
   */
  public async getPrayerTimesWithApi(location: LocationInfo, date: Date = new Date()): Promise<PrayerTimes> {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `pt_${location.latitude.toFixed(2)}_${location.longitude.toFixed(2)}_${dateStr}_${this.selectedMethodKey}_${this.asrJuristic}`;

    // Check memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`aadom_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.times) {
          const res: PrayerTimes = {
            ...parsed.times,
            source: 'astronomical_cache',
            raw: {
              imsak: new Date(parsed.times.raw.imsak),
              subuh: new Date(parsed.times.raw.subuh),
              terbit: new Date(parsed.times.raw.terbit),
              dzuhur: new Date(parsed.times.raw.dzuhur),
              ashar: new Date(parsed.times.raw.ashar),
              maghrib: new Date(parsed.times.raw.maghrib),
              isya: new Date(parsed.times.raw.isya)
            }
          };
          this.cache.set(cacheKey, { data: res, timestamp: Date.now() });
          return res;
        }
      }
    } catch {
      // ignore
    }

    // Try live API: Aladhan (method 20 is Kemenag, or method mapping)
    try {
      const dd = padZero(date.getDate());
      const mm = padZero(date.getMonth() + 1);
      const yyyy = date.getFullYear();

      // Map method to Aladhan method ID
      let methodId = 20; // Kemenag
      if (this.selectedMethodKey === 'mwl') methodId = 3;
      if (this.selectedMethodKey === 'egypt') methodId = 5;
      if (this.selectedMethodKey === 'makkah') methodId = 4;
      if (this.selectedMethodKey === 'isna') methodId = 2;

      const school = this.asrJuristic === 'hanafi' ? 1 : 0;
      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${location.latitude}&longitude=${location.longitude}&method=${methodId}&school=${school}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        const timings = json?.data?.timings;
        if (timings && timings.Fajr && timings.Dhuhr) {
          const makeDate = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map((s: string) => parseInt(s, 10));
            const d = new Date(date);
            d.setHours(h, m, 0, 0);
            return d;
          };

          const parseHM = (timeStr: string) => timeStr.slice(0, 5);

          const apiTimes: PrayerTimes = {
            imsak: parseHM(timings.Imsak || timings.Fajr),
            subuh: parseHM(timings.Fajr),
            terbit: parseHM(timings.Sunrise),
            dzuhur: parseHM(timings.Dhuhr),
            ashar: parseHM(timings.Asr),
            maghrib: parseHM(timings.Maghrib),
            isya: parseHM(timings.Isha),
            source: 'api',
            methodName: `${this.getMethod().name} (Aladhan API)`,
            raw: {
              imsak: makeDate(timings.Imsak || timings.Fajr),
              subuh: makeDate(timings.Fajr),
              terbit: makeDate(timings.Sunrise),
              dzuhur: makeDate(timings.Dhuhr),
              ashar: makeDate(timings.Asr),
              maghrib: makeDate(timings.Maghrib),
              isya: makeDate(timings.Isha)
            }
          };

          this.cache.set(cacheKey, { data: apiTimes, timestamp: Date.now() });
          try {
            localStorage.setItem(`aadom_${cacheKey}`, JSON.stringify({ times: apiTimes, timestamp: Date.now() }));
          } catch {
            // ignore
          }
          return apiTimes;
        }
      }
    } catch {
      // Fallback seamlessly to local astronomical calculation
    }

    // Local calculation fallback
    const localCalculated = this.calculatePrayerTimes(location, date);
    this.cache.set(cacheKey, { data: localCalculated, timestamp: Date.now() });
    return localCalculated;
  }

  /**
   * Determine next upcoming prayer and countdown
   */
  public getNextPrayer(prayerTimes: PrayerTimes, now: Date = new Date()): NextPrayerInfo {
    const list: { name: NextPrayerInfo['name']; date: Date; timeStr: string }[] = [
      { name: 'Imsak', date: prayerTimes.raw.imsak, timeStr: prayerTimes.imsak },
      { name: 'Subuh', date: prayerTimes.raw.subuh, timeStr: prayerTimes.subuh },
      { name: 'Terbit', date: prayerTimes.raw.terbit, timeStr: prayerTimes.terbit },
      { name: 'Dzuhur', date: prayerTimes.raw.dzuhur, timeStr: prayerTimes.dzuhur },
      { name: 'Ashar', date: prayerTimes.raw.ashar, timeStr: prayerTimes.ashar },
      { name: 'Maghrib', date: prayerTimes.raw.maghrib, timeStr: prayerTimes.maghrib },
      { name: 'Isya', date: prayerTimes.raw.isya, timeStr: prayerTimes.isya }
    ];

    const nowMs = now.getTime();

    for (const item of list) {
      const diffMs = item.date.getTime() - nowMs;
      if (diffMs > 0) {
        const remainingSeconds = Math.floor(diffMs / 1000);
        return {
          name: item.name,
          time: item.timeStr,
          remainingSeconds,
          formattedRemaining: this.formatSeconds(remainingSeconds),
          isToday: true
        };
      }
    }

    // After Isya: tomorrow's Imsak/Subuh
    const tomorrowImsak = new Date(prayerTimes.raw.imsak);
    tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
    const remainingSeconds = Math.max(0, Math.floor((tomorrowImsak.getTime() - nowMs) / 1000));

    return {
      name: 'Imsak',
      time: prayerTimes.imsak,
      remainingSeconds,
      formattedRemaining: this.formatSeconds(remainingSeconds),
      isToday: false
    };
  }

  public formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }

  /**
   * Geodesic forward bearing towards Kaaba:
   * deltaLongitude = longitudeKa'bah - longitudePengguna
   * y = sin(deltaLongitude) * cos(latitudeKa'bah)
   * x = cos(latitudePengguna) * sin(latitudeKa'bah) - sin(latitudePengguna) * cos(latitudeKa'bah) * cos(deltaLongitude)
   * bearing = (atan2(y, x) * 180 / PI + 360) % 360
   */
  public calculateQibla(latitude: number, longitude: number): {
    bearing: number;
    distanceKm: number;
    compassDirection: string;
    kaabaLatitude: number;
    kaabaLongitude: number;
    magneticDeclinationApprox: number;
  } {
    const latUserRad = degToRad(latitude);
    const latKaabaRad = degToRad(KAABA_COORDS.latitude);
    const deltaLonRad = degToRad(KAABA_COORDS.longitude - longitude);

    const y = Math.sin(deltaLonRad) * Math.cos(latKaabaRad);
    const x =
      Math.cos(latUserRad) * Math.sin(latKaabaRad) -
      Math.sin(latUserRad) * Math.cos(latKaabaRad) * Math.cos(deltaLonRad);

    let bearing = (radToDeg(Math.atan2(y, x)) + 360) % 360;
    bearing = Math.round(bearing * 10) / 10;

    // Haversine distance
    const R = 6371; // km
    const dLat = latKaabaRad - latUserRad;
    const dLon = deltaLonRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latUserRad) * Math.cos(latKaabaRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c);

    // Approximate magnetic declination in degrees (+ East, - West)
    // For Indonesia, typically between +0.5° and +2.5° depending on longitude
    const magneticDeclinationApprox = Math.round(((longitude - 100) * 0.04 + 1.0) * 10) / 10;

    // Cardinal direction in Indonesian
    let compassDirection = 'Barat Laut';
    if (bearing >= 337.5 || bearing < 22.5) compassDirection = 'Utara';
    else if (bearing >= 22.5 && bearing < 67.5) compassDirection = 'Timur Laut';
    else if (bearing >= 67.5 && bearing < 112.5) compassDirection = 'Timur';
    else if (bearing >= 112.5 && bearing < 157.5) compassDirection = 'Tenggara';
    else if (bearing >= 157.5 && bearing < 202.5) compassDirection = 'Selatan';
    else if (bearing >= 202.5 && bearing < 247.5) compassDirection = 'Barat Daya';
    else if (bearing >= 247.5 && bearing < 292.5) compassDirection = 'Barat';
    else compassDirection = 'Barat Laut';

    return {
      bearing,
      distanceKm,
      compassDirection,
      kaabaLatitude: KAABA_COORDS.latitude,
      kaabaLongitude: KAABA_COORDS.longitude,
      magneticDeclinationApprox
    };
  }

  /**
   * Multi-day schedule forecast for upcoming 7 days
   */
  public getMultiDaySchedule(location: LocationInfo, startDate: Date = new Date(), daysCount: number = 7): DayScheduleItem[] {
    const list: DayScheduleItem[] = [];
    const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const times = this.calculatePrayerTimes(location, d);
      list.push({
        date: d,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        hijriStr: this.getHijriDate(d),
        dayName: dayNames[d.getDay()],
        times
      });
    }
    return list;
  }

  /**
   * Approximate Islamic Hijri Date string in Indonesian
   */
  public getHijriDate(date: Date = new Date()): string {
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
      'Jumadil Ula', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
      'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'
    ];

    try {
      const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(date);
      let day = '';
      let monthIndex = 0;
      let year = '';

      for (const p of parts) {
        if (p.type === 'day') day = p.value;
        if (p.type === 'month') monthIndex = parseInt(p.value, 10) - 1;
        if (p.type === 'year') year = p.value;
      }

      if (day && year && monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${hijriMonths[monthIndex]} ${year} H`;
      }
    } catch {
      // Fallback
    }

    const jd = getJulianDate(date);
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) +
              (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
               (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const m = Math.floor((24 * l3) / 709);
    const d = l3 - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;

    const safeM = Math.max(0, Math.min(11, m - 1));
    return `${d} ${hijriMonths[safeM]} ${y} H`;
  }
}

export const prayerTimeService = new PrayerTimeService();
