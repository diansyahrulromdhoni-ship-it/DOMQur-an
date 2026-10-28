import React, { useEffect, useState } from 'react';
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
  Layers
} from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { quranStorage } from '../storage/quranStorage';
import { ReadingHistoryItem, DailyProgress, UserSettings } from '../types/quran';
import { prayerTimeService, LocationInfo, PrayerTimes, NextPrayerInfo } from '../services/prayerTimeService';
import { getSavedLocation, RegencyCity } from '../services/indonesiaRegions';
import { SurahFavoritesModal } from '../components/SurahFavoritesModal';
import { DuaDhikrModal } from '../components/DuaDhikrModal';
import { AsmaulHusnaModal } from '../components/AsmaulHusnaModal';
import { LocationModal } from '../components/LocationModal';

interface Props {
  onNavigate: (tab: NavTab, surahNomor?: number, ayahNomor?: number) => void;
  onOpenAudioSurah: (surahNomor: number) => void;
  onOpenLocationModal?: () => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onOpenAudioSurah, onOpenLocationModal }) => {
  const [lastRead, setLastRead] = useState<ReadingHistoryItem | null>(null);
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({ date: '', count: 0 });
  const [settings, setSettings] = useState<UserSettings>(quranStorage.getSettings());

  // Quick Modals state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isAsmaulHusnaOpen, setIsAsmaulHusnaOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Location state
  const [currentLocation, setCurrentLocation] = useState<RegencyCity & { province: string; district?: string }>(
    () => getSavedLocation()
  );

  const locInfo: LocationInfo = {
    name: currentLocation.district ? `${currentLocation.district}, ${currentLocation.name}` : currentLocation.name,
    province: currentLocation.province,
    country: 'Indonesia',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    timezone: currentLocation.timezone,
    timezoneIana: currentLocation.timezoneIana
  };

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() =>
    prayerTimeService.calculatePrayerTimes(locInfo, new Date())
  );
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() =>
    prayerTimeService.getNextPrayer(prayerTimes, new Date())
  );

  const qiblaData = prayerTimeService.calculateQibla(currentLocation.latitude, currentLocation.longitude);
  const hijriDate = prayerTimeService.getHijriDate(new Date());

  // Load reading history and progress on mount
  useEffect(() => {
    setLastRead(quranStorage.getLastRead());
    setHistoryList(quranStorage.getHistory());
    setDailyProgress(quranStorage.getDailyProgress());
    setSettings(quranStorage.getSettings());
  }, []);

  // Recalculate prayer times when location coordinates change
  useEffect(() => {
    const pt = prayerTimeService.calculatePrayerTimes(locInfo, new Date());
    setPrayerTimes(pt);
    setNextPrayer(prayerTimeService.getNextPrayer(pt, new Date()));
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Real-time ticking for next prayer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNextPrayer(prayerTimeService.getNextPrayer(prayerTimes, now));
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  const progressPercent = Math.min(
    100,
    Math.round((dailyProgress.count / (settings.dailyTargetAyat || 10)) * 100)
  );

  const handleLocationUpdated = (newLoc: RegencyCity & { province: string; district?: string }) => {
    setCurrentLocation(newLoc);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* A. Top Header Greeting & Location Selector */}
      <section className="bg-white border border-[#EAEAEA] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3DF] border border-[#E5BD58]/40 text-xs text-[#C49A3A] font-semibold">
            <div className="w-4 h-4 rounded-md bg-white border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
            <span>Assalamu'alaikum Warahmatullahi Wabarakatuh</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
            My Dom <span className="text-[#C49A3A]">Qur'an</span>
          </h1>

          <p className="text-xs text-[#737373]">
            {hijriDate} • Waktu Ibadah & Tilawah Harian
          </p>
        </div>

        {/* Location Pill Button (Clickable to open Location Modal) */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] transition text-left group shrink-0"
          title="Klik untuk memilih wilayah & kecamatan"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                {currentLocation.district ? `Kec. ${currentLocation.district}` : currentLocation.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#EAEAEA] text-[#737373] font-semibold">
                Ganti
              </span>
            </div>
            <p className="text-[11px] text-[#737373] truncate max-w-[160px]">
              {currentLocation.province || 'Indonesia'} (UTC+{currentLocation.timezone})
            </p>
          </div>
        </button>
      </section>

      {/* B. Hero Section with Makkah Masjidil Haram & Ka'bah Imagery */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EAEAEA] shadow-md">
        {/* Makkah Image Banner */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-[#F8F8F8]">
          <img
            src="/assets/makkah_masjidil_haram.jpg"
            alt="Masjidil Haram dan Ka'bah Makkah"
            className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
          />
          {/* Subtle gradient overlay to enhance readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

          {/* Golden Badge on Image */}
          <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAEAEA] shadow-sm">
            <div className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A]">
              <Compass className="w-3 h-3" />
            </div>
            <span className="text-xs font-extrabold text-[#222222]">
              Ka'bah Al-Musyarrafah • Kiblat Umat Islam
            </span>
          </div>
        </div>

        {/* Hero Content Body */}
        <div className="relative z-10 p-6 sm:p-8 -mt-12 bg-white rounded-t-3xl border-t border-[#EAEAEA]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-[#222222] tracking-tight">
                Dekatkan Hati dengan <span className="text-[#C49A3A]">Al-Qur'an</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                Temani setiap langkah ibadahmu bersama <strong>My Dom Qur'an</strong>. Nikmati kemudahan membaca 114 surat,
                mendengarkan audio murottal qari internasional, jadwal salat akurat, dan kompas kiblat presisi.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('quran')}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs sm:text-sm transition shadow-sm"
                >
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Baca Al-Qur'an</span>
                </button>

                {lastRead ? (
                  <button
                    onClick={() => onNavigate('quran', lastRead.surahNomor, lastRead.ayahNomor)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FAF3DF] hover:bg-[#F3E7C4] border border-[#E5BD58] text-[#C49A3A] font-bold text-xs sm:text-sm transition shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-md bg-white border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A]">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <span>Lanjut Ayat {lastRead.ayahNomor} ({lastRead.surahLatin})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('sholat')}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] text-[#222222] font-semibold text-xs sm:text-sm transition"
                  >
                    <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span>Jadwal Salat & Adzan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Next Prayer Floating Card inside Hero */}
            <div className="w-full md:w-auto p-4 sm:p-5 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA] shadow-2xs flex flex-row md:flex-col justify-between items-center md:items-start gap-3 min-w-[220px]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C49A3A] uppercase tracking-wider">
                  <div className="w-4 h-4 rounded-md bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                    <Clock className="w-2.5 h-2.5" />
                  </div>
                  <span>Salat Berikutnya</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#222222] font-mono">
                  {nextPrayer.name} <span className="text-[#C49A3A]">{nextPrayer.time}</span>
                </div>
                <p className="text-[11px] text-[#737373]">
                  Tersisa: <strong className="text-[#222222] font-mono">{nextPrayer.formattedRemaining}</strong>
                </p>
              </div>

              <button
                onClick={() => onNavigate('sholat')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] text-xs font-bold text-[#222222] hover:text-[#C49A3A] transition flex items-center gap-1 shrink-0"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* C. Quick Prayer Time Mini Bar & Qibla Direction Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prayer Time Overview Card */}
        <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wide">
                  Jadwal Salat Hari Ini
                </h3>
                <p className="text-[11px] text-[#737373]">{currentLocation.name}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('sholat')}
              className="text-xs text-[#C49A3A] hover:underline font-bold flex items-center gap-1"
            >
              <span>Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Row of 5 Daily Prayers + Imsak */}
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {[
              { name: 'Imsak', time: prayerTimes.imsak, active: nextPrayer.name === 'Imsak' },
              { name: 'Subuh', time: prayerTimes.subuh, active: nextPrayer.name === 'Subuh' },
              { name: 'Dzuhur', time: prayerTimes.dzuhur, active: nextPrayer.name === 'Dzuhur' },
              { name: 'Ashar', time: prayerTimes.ashar, active: nextPrayer.name === 'Ashar' },
              { name: 'Maghrib', time: prayerTimes.maghrib, active: nextPrayer.name === 'Maghrib' },
              { name: 'Isya', time: prayerTimes.isya, active: nextPrayer.name === 'Isya' }
            ].map((p) => (
              <div
                key={p.name}
                className={`py-2 px-1 rounded-xl border transition ${
                  p.active
                    ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold shadow-xs'
                    : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                }`}
              >
                <div className="text-[10px] font-bold">{p.name}</div>
                <div className="text-xs font-mono font-bold mt-0.5">{p.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Qibla Direction Overview Card */}
        <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wide">
                Arah Kiblat • {qiblaData.compassDirection}
              </h3>
            </div>
            <div className="text-2xl font-black text-[#222222] font-mono mt-1">
              {qiblaData.bearing}° <span className="text-xs font-normal text-[#737373]">dari Utara Sejati</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Jarak ke Ka'bah: {qiblaData.distanceKm.toLocaleString('id-ID')} km
            </p>
          </div>

          <button
            onClick={() => onNavigate('kiblat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-sm shrink-0"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span>Kompas Kiblat</span>
          </button>
        </div>
      </section>

      {/* D. Menu Utama (Every icon inside a rounded-square box!) */}
      <section aria-labelledby="quick-access-heading">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h2 id="quick-access-heading" className="text-xs font-bold text-[#737373] uppercase tracking-wider">
              Menu Utama & Fitur Unggulan
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#C49A3A]">Terintegrasi & Lengkap</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Al-Qur'an (114 Surah) */}
          <button
            onClick={() => onNavigate('quran')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Baca Al-Qur'an</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">114 Surat Lengkap 30 Juz</p>
          </button>

          {/* 2. Jadwal Salat & Adzan */}
          <button
            onClick={() => onNavigate('sholat')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Jadwal Salat</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Audio Pengingat & Imsak</p>
          </button>

          {/* 3. Arah Kiblat */}
          <button
            onClick={() => onNavigate('kiblat')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Arah Kiblat</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Kompas Geodesik Presisi</p>
          </button>

          {/* 4. Doa Harian & Dzikir */}
          <button
            onClick={() => onNavigate('doa')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Doa Harian & Dzikir</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Kumpulan Doa Shahih</p>
          </button>

          {/* 5. Surat Pilihan */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Surat Pilihan</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Yasin, Al-Kahf, Al-Mulk</p>
          </button>

          {/* 6. 99 Asmaul Husna */}
          <button
            onClick={() => setIsAsmaulHusnaOpen(true)}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">99 Asmaul Husna</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Nama Indah Allah SWT</p>
          </button>

          {/* 7. Pencarian Ayat */}
          <button
            onClick={() => onNavigate('search')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Pencarian Ayat</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Cari Kata & Terjemahan</p>
          </button>

          {/* 8. Bookmark & Catatan */}
          <button
            onClick={() => onNavigate('bookmark')}
            className="flex flex-col items-start p-4 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/30 transition text-left group shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] group-hover:border-[#E5BD58] flex items-center justify-center text-[#C49A3A] mb-3 group-hover:scale-105 transition-transform shadow-2xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#222222]">Bookmark & Catatan</h3>
            <p className="text-[11px] text-[#737373] mt-0.5">Ayat Disimpan & Tadabbur</p>
          </button>
        </div>
      </section>

      {/* E. Two-Column Dashboard: Last Read + Daily Tilawah Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lanjutkan Membaca (Continue Reading) */}
        <section aria-labelledby="last-read-heading" className="bg-white border border-[#EAEAEA] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 id="last-read-heading" className="text-xs font-bold text-[#222222] tracking-wide uppercase">
                  Lanjutkan Membaca
                </h2>
              </div>
              {lastRead && (
                <span className="text-[11px] text-[#737373] bg-[#F8F8F8] px-2 py-0.5 rounded-full border border-[#EAEAEA]">
                  Tersimpan di perangkat
                </span>
              )}
            </div>

            {lastRead ? (
              <div className="space-y-1.5 py-2">
                <h3 className="text-xl font-bold text-[#222222]">
                  Surat {lastRead.surahLatin}
                </h3>
                <p className="text-sm font-bold text-[#C49A3A]">
                  Ayat ke-{lastRead.ayahNomor}
                </p>
                <p className="text-xs text-[#737373]">
                  Surat ke-{lastRead.surahNomor} • {lastRead.surahName}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center sm:text-left space-y-1">
                <h3 className="text-base font-bold text-[#222222]">Mulai Tilawah Hari Ini</h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Buka surat pilihan Anda, posisi ayat terakhir akan otomatis tersimpan.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-[#EAEAEA]">
            {lastRead ? (
              <button
                onClick={() => onNavigate('quran', lastRead.surahNomor, lastRead.ayahNomor)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <span>Lanjut Tilawah (Ayat {lastRead.ayahNomor})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('quran', 1, 1)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <span>Mulai dari Surat Al-Fatihah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Progres Tilawah Harian (Daily Tilawah Progress) */}
        <section aria-labelledby="tilawah-target-heading" className="bg-white border border-[#EAEAEA] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                  <Flame className="w-4 h-4" />
                </div>
                <h2 id="tilawah-target-heading" className="text-xs font-bold text-[#222222] tracking-wide uppercase">
                  Target Tilawah Hari Ini
                </h2>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] font-bold text-[#C49A3A] hover:underline"
              >
                Ubah Target
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#222222] font-mono">{dailyProgress.count}</span>
                  <span className="text-xs text-[#737373]">/ {settings.dailyTargetAyat} ayat</span>
                </div>
                <p className="text-xs text-[#737373] mt-1">
                  {dailyProgress.count >= settings.dailyTargetAyat ? (
                    <span className="text-[#21865B] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target harian tercapai! Alhamdulillah
                    </span>
                  ) : (
                    <span>Tersisa {Math.max(0, settings.dailyTargetAyat - dailyProgress.count)} ayat lagi untuk mencapai target</span>
                  )}
                </p>
              </div>

              <div className="w-14 h-14 rounded-full border-4 border-[#EAEAEA] flex items-center justify-center relative bg-[#F8F8F8] shrink-0">
                <span className="text-xs font-black text-[#C49A3A] font-mono">{progressPercent}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#F8F8F8] rounded-full h-2.5 mt-4 overflow-hidden border border-[#EAEAEA]">
              <div
                className="bg-[#C49A3A] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#737373]">
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            <button
              onClick={() => {
                if (confirm('Reset hitungan ayat hari ini?')) {
                  quranStorage.resetDailyProgress();
                  setDailyProgress(quranStorage.getDailyProgress());
                }
              }}
              className="flex items-center gap-1 text-[#737373] hover:text-[#C49A3A] transition"
              title="Reset hitungan harian"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </section>
      </div>

      {/* F. Surat Terakhir Dibuka (Recently Opened Surahs) */}
      {historyList.length > 0 && (
        <section aria-labelledby="history-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="history-heading" className="text-xs font-bold text-[#737373] uppercase tracking-wider">
              Surat Terakhir Dibuka
            </h2>
            <button
              onClick={() => {
                if (confirm('Hapus seluruh riwayat surat yang pernah dibuka?')) {
                  quranStorage.clearHistory();
                  setHistoryList([]);
                  setLastRead(null);
                }
              }}
              className="text-[11px] text-[#737373] hover:text-red-500 transition"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {historyList.slice(0, 6).map((item) => (
              <button
                key={item.surahNomor}
                onClick={() => onNavigate('quran', item.surahNomor, item.ayahNomor)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#C49A3A] hover:bg-[#FAF3DF]/20 transition group text-left shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] group-hover:border-[#E5BD58] group-hover:bg-white flex items-center justify-center text-xs font-bold text-[#C49A3A] font-mono transition">
                    {String(item.surahNomor).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#222222] group-hover:text-[#C49A3A] transition-colors">
                      {item.surahLatin}
                    </h3>
                    <p className="text-[11px] text-[#737373]">Ayat terakhir: {item.ayahNomor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-quran text-sm text-[#C49A3A] hidden sm:inline" dir="rtl">
                    {item.surahName}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#F8F8F8] flex items-center justify-center text-[#737373] group-hover:text-[#C49A3A] group-hover:bg-[#FAF3DF] transition">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* G. Kalamullah Reflection Card */}
      <section className="bg-white border border-[#EAEAEA] rounded-3xl p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#C49A3A] uppercase tracking-wide">
              Kalamullah • Pengingat Hati
            </h2>
            <p className="text-xs sm:text-sm text-[#222222] mt-1 italic leading-relaxed">
              "Ini adalah sebuah kitab yang Kami turunkan kepadamu penuh dengan berkah supaya mereka memperhatikan ayat-ayatnya dan supaya mendapat pelajaran orang-orang yang mempunyai fikiran."
            </p>
            <span className="text-[11px] text-[#737373] mt-1 block font-medium">QS. Sad: 29</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('quran', 38)}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] text-xs font-bold text-[#222222] hover:text-[#C49A3A] border border-[#EAEAEA] hover:border-[#E5BD58] transition shadow-2xs"
        >
          Buka Surat Sad
        </button>
      </section>

      {/* Modals for Quick Access */}
      <SurahFavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectSurah={(surah, ayah) => onNavigate('quran', surah, ayah)}
      />

      <DuaDhikrModal
        isOpen={isDuaOpen}
        onClose={() => setIsDuaOpen(false)}
      />

      <AsmaulHusnaModal
        isOpen={isAsmaulHusnaOpen}
        onClose={() => setIsAsmaulHusnaOpen(false)}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelected={handleLocationUpdated}
      />
    </div>
  );
};
