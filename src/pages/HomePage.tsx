import React, { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Headphones,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Compass,
  Clock,
  Heart,
  Star,
  Bell,
  MapPin,
  Calendar,
  Layers,
  Volume2
} from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { quranStorage } from '../storage/quranStorage';
import { ReadingHistoryItem, DailyProgress, UserSettings } from '../types/quran';
import { prayerTimeService, PrayerTimes, NextPrayerInfo, LocationInfo } from '../services/prayerTimeService';
import { qiblaService } from '../services/qiblaService';
import { getActiveLocation, ActiveLocation } from '../services/wilayahService';
import { SurahFavoritesModal } from '../components/SurahFavoritesModal';
import { DuaDhikrModal } from '../components/DuaDhikrModal';
import { AsmaulHusnaModal } from '../components/AsmaulHusnaModal';
import { LocationModal } from '../components/LocationModal';
import { TasbihModal } from '../components/TasbihModal';

interface Props {
  onNavigate: (tab: NavTab, surahNomor?: number, ayahNomor?: number) => void;
  onOpenAudioSurah: (surahNomor: number) => void;
  onOpenLocationModal?: () => void;
}

export const HomePage: React.FC<Props> = ({
  onNavigate,
  onOpenAudioSurah,
  onOpenLocationModal
}) => {
  const [lastRead, setLastRead] = useState<ReadingHistoryItem | null>(null);
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({ date: '', count: 0 });
  const [settings, setSettings] = useState<UserSettings>(quranStorage.getSettings());

  // Location & Prayer Time State
  const [activeLoc, setActiveLoc] = useState<ActiveLocation>(getActiveLocation());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() => {
    const loc = getActiveLocation();
    const locInfo: LocationInfo = {
      name: loc.regencyName,
      province: loc.provinceName,
      country: 'Indonesia',
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      timezoneIana: loc.timezoneIana
    };
    return prayerTimeService.calculatePrayerTimes(locInfo, new Date());
  });
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() => {
    return prayerTimeService.getNextPrayer(prayerTimes, new Date());
  });
  const [qiblaDegree, setQiblaDegree] = useState<number>(() => {
    const loc = getActiveLocation();
    return Math.round(qiblaService.calculate(loc.latitude, loc.longitude).bearing);
  });
  const [hijriDate, setHijriDate] = useState<string>('');
  const [gregorianDateStr, setGregorianDateStr] = useState<string>('');

  // Modals state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isAsmaulOpen, setIsAsmaulOpen] = useState(false);
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [isInternalLocOpen, setIsInternalLocOpen] = useState(false);

  // Video motion preference
  const [canPlayVideo, setCanPlayVideo] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync date strings
  useEffect(() => {
    const now = new Date();
    setGregorianDateStr(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
    setHijriDate(prayerTimeService.getHijriDate(now));

    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) setCanPlayVideo(false);
    }
  }, []);

  // Subscribe to location updates
  useEffect(() => {
    const updateTimes = (loc: ActiveLocation) => {
      setActiveLoc(loc);
      const locInfo: LocationInfo = {
        name: loc.regencyName,
        province: loc.provinceName,
        country: 'Indonesia',
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        timezoneIana: loc.timezoneIana
      };
      const pt = prayerTimeService.calculatePrayerTimes(locInfo, new Date());
      setPrayerTimes(pt);
      setNextPrayer(prayerTimeService.getNextPrayer(pt, new Date()));
      setQiblaDegree(Math.round(qiblaService.calculate(loc.latitude, loc.longitude).bearing));
    };

    const handleLocChanged = (e: CustomEvent<ActiveLocation>) => {
      updateTimes(e.detail);
    };

    window.addEventListener('mydom_location_changed' as any, handleLocChanged);
    return () => {
      window.removeEventListener('mydom_location_changed' as any, handleLocChanged);
    };
  }, []);

  // Reload reading data
  useEffect(() => {
    setLastRead(quranStorage.getLastRead());
    setHistoryList(quranStorage.getHistory());
    setDailyProgress(quranStorage.getDailyProgress());
    setSettings(quranStorage.getSettings());
  }, []);

  // Real-time ticking for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNextPrayer(prayerTimeService.getNextPrayer(prayerTimes, now));
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes]);

  // Format countdown into [Jam, Menit, Detik]
  const countdownParts = (() => {
    const totalSecs = Math.max(0, nextPrayer.remainingSeconds);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      hh: String(hours).padStart(2, '0'),
      mm: String(minutes).padStart(2, '0'),
      ss: String(seconds).padStart(2, '0')
    };
  })();

  const progressPercent = Math.min(
    100,
    Math.round((dailyProgress.count / (settings.dailyTargetAyat || 10)) * 100)
  );

  const openLocationPicker = onOpenLocationModal || (() => setIsInternalLocOpen(true));

  // 8 Quick Access Cards (matching ref1.png & ref2.png)
  const quickMenu = [
    {
      id: 'baca',
      label: "Baca Al-Qur'an",
      icon: BookOpen,
      action: () => onNavigate('quran', lastRead?.surahNomor || 1, lastRead?.ayahNomor || 1)
    },
    {
      id: 'surah',
      label: 'Daftar Surah',
      icon: Layers,
      action: () => onNavigate('quran')
    },
    {
      id: 'murottal',
      label: 'Murottal',
      icon: Headphones,
      action: () => onOpenAudioSurah(lastRead?.surahNomor || 1)
    },
    {
      id: 'bookmark',
      label: 'Bookmark',
      icon: Bookmark,
      action: () => onNavigate('bookmark')
    },
    {
      id: 'sholat',
      label: 'Jadwal Salat',
      icon: Clock,
      action: () => onNavigate('sholat')
    },
    {
      id: 'kiblat',
      label: 'Arah Kiblat',
      icon: Compass,
      action: () => onNavigate('kiblat')
    },
    {
      id: 'doa',
      label: 'Doa Harian',
      icon: Heart,
      action: () => onNavigate('doa')
    },
    {
      id: 'tasbih',
      label: 'Tasbih',
      icon: Sparkles,
      action: () => setIsTasbihOpen(true)
    }
  ];

  // Surah Pilihan items (matching ref1.png & ref2.png)
  const featuredSurahs = [
    { nomor: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', ayat: 7, type: 'Makkiyah' },
    { nomor: 2, name: 'Al-Baqarah', arabic: 'البقرة', ayat: 286, type: 'Madaniyah' },
    { nomor: 3, name: "Ali 'Imran", arabic: 'آل عمران', ayat: 200, type: 'Madaniyah' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* =========================================================================
          A. HERO BANNER KA'BAH WITH VIDEO BACKGROUND (Matching ref1.png & ref2.png)
      ========================================================================= */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-[#EAEAEA] min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center bg-[#111111]">
        {/* Video / Poster Background */}
        {canPlayVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/makkah_masjidil_haram.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-90"
          >
            <source src="/assets/makkah_hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/assets/makkah_masjidil_haram.jpg"
            alt="Ka'bah & Masjidil Haram di Makkah"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
          />
        )}

        {/* Sophisticated Gradient Overlay ensuring 100% text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent sm:from-black/75 sm:via-black/40 sm:to-black/20" />

        {/* Hero Content Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-xl space-y-3.5 text-white">
          {/* Greeting Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#E5BD58]" />
            <span>Assalamu'alaikum • Selamat Datang 👋</span>
          </div>

          {/* Headline in Serif / Bold */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight font-serif drop-shadow-md">
            “Dekatkan Hati <br className="hidden sm:inline" />dengan Al-Qur'an”
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans drop-shadow-sm max-w-md">
            Temani setiap langkah ibadahmu bersama My Dom Qur'an.
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('quran')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] active:scale-98 text-white font-bold text-xs sm:text-sm transition shadow-md"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 fill-white" />
              </div>
              <span>Baca Al-Qur'an</span>
            </button>

            <button
              onClick={() => {
                if (lastRead) {
                  onNavigate('quran', lastRead.surahNomor, lastRead.ayahNomor);
                } else {
                  onNavigate('quran', 1, 1);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#222222] font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/50 transition shadow-sm"
            >
              <span>Lanjutkan Bacaan</span>
              <ChevronRight className="w-4 h-4 text-[#C49A3A]" />
            </button>
          </div>
        </div>

        {/* Carousel indicator dots (visual matching ref2.png) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          <span className="w-5 h-1.5 rounded-full bg-[#E5BD58]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </section>

      {/* =========================================================================
          B. INFORMASI IBADAH (Matching 3-Cards Desktop in ref1.png & Mobile ref2.png)
      ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Waktu Salat Berikutnya & Hitung Mundur */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider block">
                  Waktu Salat Berikutnya
                </span>
                <h3 className="text-lg font-black text-[#222222]">
                  {nextPrayer.name}
                </h3>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/50 text-right">
              <span className="text-xs font-mono font-black text-[#C49A3A] block">
                {nextPrayer.time}
              </span>
              <span className="text-[9px] text-[#737373] block uppercase font-bold">
                {activeLoc.timezone === 8 ? 'WITA' : activeLoc.timezone === 9 ? 'WIT' : 'WIB'}
              </span>
            </div>
          </div>

          {/* Countdown Clock Boxes: [Jam] : [Menit] : [Detik] */}
          <div className="p-3 bg-[#F8F8F8] rounded-2xl border border-[#EAEAEA] flex items-center justify-around text-center">
            <div>
              <span className="font-mono text-xl font-black text-[#222222]">{countdownParts.hh}</span>
              <span className="text-[10px] text-[#737373] block font-medium">Jam</span>
            </div>
            <span className="text-lg font-bold text-[#C49A3A] pb-3">:</span>
            <div>
              <span className="font-mono text-xl font-black text-[#222222]">{countdownParts.mm}</span>
              <span className="text-[10px] text-[#737373] block font-medium">Menit</span>
            </div>
            <span className="text-lg font-bold text-[#C49A3A] pb-3">:</span>
            <div>
              <span className="font-mono text-xl font-black text-[#222222]">{countdownParts.ss}</span>
              <span className="text-[10px] text-[#737373] block font-medium">Detik</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#737373] pt-1 border-t border-[#EAEAEA]">
            <span>{gregorianDateStr}</span>
            <span className="font-semibold text-[#C49A3A]">{hijriDate}</span>
          </div>
        </div>

        {/* Card 2: Jadwal Salat Hari Ini (Summary) */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C49A3A]" />
              <span className="text-xs font-bold text-[#222222]">Jadwal Hari Ini</span>
            </div>
            <button
              onClick={() => onNavigate('sholat')}
              className="text-[11px] font-semibold text-[#C49A3A] hover:underline"
            >
              Lihat Lengkap &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#737373]">Imsak</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.imsak}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#737373]">Subuh</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.subuh}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#737373]">Terbit</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.terbit}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#737373]">Dzuhur</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.dzuhur}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[#737373]">Ashar</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.ashar}</span>
            </div>
            <div className="flex items-center justify-between py-0.5 bg-[#FAF3DF] px-1.5 rounded-md border border-[#E5BD58]/30">
              <span className="text-[#C49A3A] font-bold">Maghrib</span>
              <span className="font-mono font-bold text-[#C49A3A]">{prayerTimes.maghrib}</span>
            </div>
            <div className="flex items-center justify-between py-0.5 col-span-2">
              <span className="text-[#737373]">Isya</span>
              <span className="font-mono font-bold text-[#222222]">{prayerTimes.isya}</span>
            </div>
          </div>

          <div className="text-[11px] text-[#737373] text-center bg-[#F8F8F8] py-1 rounded-xl border border-[#EAEAEA]">
            Metode: <strong className="text-[#222222] font-semibold">{prayerTimes.methodName}</strong>
          </div>
        </div>

        {/* Card 3: Arah Kiblat & Lokasi Aktif */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-2xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider block">
                  Arah Kiblat
                </span>
                <h3 className="text-base font-black text-[#222222]">
                  {qiblaDegree}° dari Utara
                </h3>
              </div>
            </div>

            <button
              onClick={() => onNavigate('kiblat')}
              className="px-3.5 py-1.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white text-xs font-bold transition shadow-2xs"
            >
              Lihat Arah &rarr;
            </button>
          </div>

          {/* Active Location Display */}
          <div className="p-3 bg-[#F8F8F8] rounded-2xl border border-[#EAEAEA] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C49A3A]" />
                Lokasi Aktif:
              </span>
              <button
                onClick={openLocationPicker}
                className="text-[11px] font-bold text-[#C49A3A] hover:underline"
              >
                Ganti Lokasi
              </button>
            </div>
            <p className="text-xs font-bold text-[#222222] truncate">
              {activeLoc.displayName}
            </p>
          </div>

          <p className="text-[11px] text-[#737373] leading-relaxed">
            Perhitungan geodesik Ka'bah Makkah (21.4225° N, 39.8262° E).
          </p>
        </div>
      </section>

      {/* =========================================================================
          C. MENU UTAMA / AKSES CEPAT (8 BOXED ICONS - Matching ref1.png & ref2.png)
      ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#222222]">Akses Cepat</h2>
          <span className="text-xs text-[#737373]">8 Fitur Utama Ibadah</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {quickMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-[#FAF3DF]/50 border border-[#EAEAEA] hover:border-[#E5BD58] transition shadow-xs group"
              >
                {/* Boxed Icon Rule: Exactly enclosed in rounded-square */}
                <div className="w-11 h-11 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58] group-hover:scale-105 group-hover:bg-[#C49A3A] text-[#C49A3A] group-hover:text-white transition flex items-center justify-center shadow-2xs mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[#222222] text-center leading-tight truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          D. LANJUTKAN BACAAN & SURAH PILIHAN (Matching ref1.png & ref2.png)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Lanjutkan Bacaan (5 Cols on Desktop) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C49A3A]" />
              <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                Lanjutkan Bacaan
              </h3>
            </div>
            {lastRead && (
              <span className="text-[11px] text-[#737373]">
                {lastRead.timestamp ? new Date(lastRead.timestamp).toLocaleDateString('id-ID') : 'Terakhir'}
              </span>
            )}
          </div>

          {lastRead ? (
            <div className="flex items-center gap-4">
              {/* Qur'an Book Cover Thumbnail */}
              <div className="w-14 h-16 rounded-xl bg-gradient-to-br from-[#FAF3DF] to-[#E5BD58] border border-[#E5BD58] shadow-xs flex items-center justify-center text-[#C49A3A] shrink-0 font-quran text-xl font-bold">
                قرآن
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#222222] truncate">
                    Surat {lastRead.surahLatin}
                  </h4>
                  <span className="font-quran text-base text-[#C49A3A]">
                    {lastRead.surahName}
                  </span>
                </div>

                <p className="text-xs text-[#737373]">
                  Ayat {lastRead.ayahNomor}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#EAEAEA] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C49A3A] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent || 35}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-1.5">
              <p className="text-xs text-[#737373]">Belum ada riwayat bacaan terakhir.</p>
              <p className="text-[11px] text-[#C49A3A] font-semibold">
                Mulai tilawah dari Surat Al-Fatihah sekarang.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (lastRead) {
                onNavigate('quran', lastRead.surahNomor, lastRead.ayahNomor);
              } else {
                onNavigate('quran', 1, 1);
              }
            }}
            className="w-full py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <span>Lanjutkan Bacaan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Surah Pilihan (7 Cols on Desktop) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#C49A3A] fill-[#C49A3A]" />
              <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                Surah Pilihan
              </h3>
            </div>
            <button
              onClick={() => onNavigate('quran')}
              className="text-xs font-semibold text-[#C49A3A] hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {featuredSurahs.map((s) => (
              <button
                key={s.nomor}
                onClick={() => onNavigate('quran', s.nomor)}
                className="p-3.5 rounded-2xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] transition text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center font-mono font-bold text-xs text-[#C49A3A]">
                    {s.nomor}
                  </div>
                  <span className="font-quran text-base text-[#C49A3A]">
                    {s.arabic}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#222222] group-hover:text-[#C49A3A] transition truncate">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#737373]">{s.ayat} ayat</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#C49A3A] font-semibold border border-[#EAEAEA]">
                      {s.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#737373] bg-[#FAF3DF]/60 p-2.5 rounded-xl border border-[#E5BD58]/30">
            <span>Sering diamalkan: Al-Kahf, Yasin, Al-Mulk, Ayat Kursi</span>
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="font-bold text-[#C49A3A] hover:underline"
            >
              Buka Fadhilah &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODALS & OVERLAYS
      ========================================================================= */}
      <LocationModal
        isOpen={isInternalLocOpen}
        onClose={() => setIsInternalLocOpen(false)}
        onLocationSelected={(loc) => {
          setActiveLoc(loc);
          setIsInternalLocOpen(false);
        }}
      />

      <TasbihModal
        isOpen={isTasbihOpen}
        onClose={() => setIsTasbihOpen(false)}
      />

      <SurahFavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectSurah={(nomor, ayah) => onNavigate('quran', nomor, ayah)}
      />

      <DuaDhikrModal
        isOpen={isDuaOpen}
        onClose={() => setIsDuaOpen(false)}
      />

      <AsmaulHusnaModal
        isOpen={isAsmaulOpen}
        onClose={() => setIsAsmaulOpen(false)}
      />
    </div>
  );
};
