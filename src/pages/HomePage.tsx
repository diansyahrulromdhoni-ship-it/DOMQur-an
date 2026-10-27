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
  Volume2
} from 'lucide-react';
import { NavTab } from '../components/Navbar';
import { quranStorage } from '../storage/quranStorage';
import { ReadingHistoryItem, DailyProgress, UserSettings } from '../types/quran';
import { prayerTimeService, PRESET_LOCATIONS, LocationInfo, PrayerTimes, NextPrayerInfo } from '../services/prayerTimeService';
import { SurahFavoritesModal } from '../components/SurahFavoritesModal';
import { DuaDhikrModal } from '../components/DuaDhikrModal';
import { AsmaulHusnaModal } from '../components/AsmaulHusnaModal';

interface Props {
  onNavigate: (tab: NavTab, surahNomor?: number, ayahNomor?: number) => void;
  onOpenAudioSurah: (surahNomor: number) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const [lastRead, setLastRead] = useState<ReadingHistoryItem | null>(null);
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({ date: '', count: 0 });
  const [settings, setSettings] = useState<UserSettings>(quranStorage.getSettings());

  // Quick Modals state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isAsmaulHusnaOpen, setIsAsmaulHusnaOpen] = useState(false);

  // Prayer time widget state for location
  const [location, setLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('aadom_saved_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return PRESET_LOCATIONS[0];
  });

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() =>
    prayerTimeService.calculatePrayerTimes(location, new Date())
  );
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() =>
    prayerTimeService.getNextPrayer(prayerTimes, new Date())
  );

  const qiblaData = prayerTimeService.calculateQibla(location.latitude, location.longitude);
  const hijriDate = prayerTimeService.getHijriDate(new Date());

  // Load reading history and progress once on mount
  useEffect(() => {
    setLastRead(quranStorage.getLastRead());
    setHistoryList(quranStorage.getHistory());
    setDailyProgress(quranStorage.getDailyProgress());
    setSettings(quranStorage.getSettings());
  }, []);

  // Recalculate prayer times only when location coordinates change
  useEffect(() => {
    const pt = prayerTimeService.calculatePrayerTimes(location, new Date());
    setPrayerTimes(pt);
    setNextPrayer(prayerTimeService.getNextPrayer(pt, new Date()));
  }, [location.latitude, location.longitude]);

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Banner with Calligraphy Reference and Brand Identity */}
      <section className="relative overflow-hidden rounded-3xl bg-[#151515] border border-[#262626] p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#F6C646]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#F6C646]/30 text-xs text-[#F6C646] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD455]" />
              <span>Assalamu'alaikum Warahmatullahi Wabarakatuh</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AA Dom Qur'an
            </h1>

            <p className="text-xs sm:text-sm text-[#B8B8B8] max-w-lg leading-relaxed">
              Temani Tilawah, Dekatkan Hati dengan Al-Qur'an. Dilengkapi arah kiblat presisi,
              jadwal sholat dengan audio adzan otomatis, audio murottal, dan tafsir per ayat.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onNavigate('quran')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F6C646] text-black font-bold text-xs sm:text-sm hover:bg-[#FFD455] transition shadow-lg shadow-[#F6C646]/10"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai Membaca Al-Qur'an</span>
              </button>

              <button
                onClick={() => onNavigate('sholat')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black border border-[#262626] hover:border-[#F6C646]/40 text-[#B8B8B8] hover:text-white font-medium text-xs sm:text-sm transition"
              >
                <Clock className="w-4 h-4 text-[#F6C646]" />
                <span>Jadwal Sholat & Adzan</span>
              </button>

              <button
                onClick={() => onNavigate('kiblat')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black border border-[#262626] hover:border-[#F6C646]/40 text-[#B8B8B8] hover:text-white font-medium text-xs sm:text-sm transition"
              >
                <Compass className="w-4 h-4 text-[#F6C646]" />
                <span>Arah Kiblat</span>
              </button>
            </div>
          </div>

          {/* Medallion Calligraphy Asset Presentation */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-black p-2 border-2 border-[#F6C646]/40 shadow-2xl flex items-center justify-center relative overflow-hidden group">
              <img
                src="/assets/aistudio/IMG-20261026-WA9058_c16edc57.jpg"
                alt="Kaligrafi Al-Qur'an Emas"
                className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-[#F6C646]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Prayer & Qibla Quick Bar (Responsive Row/Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Prayer Quick Card */}
        <div className="bg-[#151515] border border-[#262626] rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#F6C646]/30 transition group">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wide">
              <Clock className="w-4 h-4 text-[#FFD455]" />
              <span>Sholat Berikutnya • {location.name}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {nextPrayer.name} <span className="text-[#F6C646]">{nextPrayer.time}</span>
            </div>
            <p className="text-xs text-[#B8B8B8] font-mono tabular-nums">
              Tersisa: {nextPrayer.formattedRemaining} • {hijriDate}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => onNavigate('sholat')}
              className="px-3.5 py-2 rounded-xl bg-black border border-[#333] group-hover:border-[#F6C646]/50 text-xs font-semibold text-white transition flex items-center gap-1.5"
            >
              <span>Detail & Adzan</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#F6C646]" />
            </button>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Bell className="w-3 h-3" /> Audio Adzan Siap
            </span>
          </div>
        </div>

        {/* Qibla Direction Quick Card */}
        <div className="bg-[#151515] border border-[#262626] rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#F6C646]/30 transition group">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wide">
              <Compass className="w-4 h-4 text-[#FFD455]" />
              <span>Arah Kiblat • {qiblaData.compassDirection}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {qiblaData.bearing}° <span className="text-xs text-[#888] font-normal">dari Utara</span>
            </div>
            <p className="text-xs text-[#B8B8B8]">
              Jarak ke Ka'bah: {qiblaData.distanceKm.toLocaleString('id-ID')} km
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onNavigate('kiblat')}
              className="px-3.5 py-2 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-xs font-bold text-black transition flex items-center gap-1.5 shadow-md shadow-[#F6C646]/10"
            >
              <span>Buka Kompas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Akses Cepat Fitur (Expanded 8 Feature Grid) */}
      <section aria-labelledby="quick-access-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="quick-access-heading" className="text-xs font-bold text-[#B8B8B8] uppercase tracking-wider">
            Akses Cepat Fitur
          </h2>
          <span className="text-[11px] text-[#F6C646] font-medium">Lengkap & Terintegrasi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Arah Kiblat */}
          <button
            onClick={() => onNavigate('kiblat')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Arah Kiblat</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Kompas Ka'bah Presisi</p>
          </button>

          {/* 2. Jadwal Sholat & Adzan */}
          <button
            onClick={() => onNavigate('sholat')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Jadwal Sholat</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Audio Adzan Otomatis</p>
          </button>

          {/* 3. Surat Pilihan */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Surat Pilihan</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Yasin, Al-Kahf, Al-Mulk</p>
          </button>

          {/* 4. Doa Harian & Dzikir */}
          <button
            onClick={() => onNavigate('doa')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Doa Harian & Dzikir</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Kumpulan Doa Shahih</p>
          </button>

          {/* 5. 99 Asmaul Husna */}
          <button
            onClick={() => setIsAsmaulHusnaOpen(true)}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">99 Asmaul Husna</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Nama Indah Allah SWT</p>
          </button>

          {/* 6. Daftar 114 Surat */}
          <button
            onClick={() => onNavigate('quran')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Daftar Surat</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">114 Surat 30 Juz</p>
          </button>

          {/* 7. Pencarian Ayat */}
          <button
            onClick={() => onNavigate('search')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Pencarian</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Cari Kata & Terjemahan</p>
          </button>

          {/* 8. Bookmark & Catatan */}
          <button
            onClick={() => onNavigate('bookmark')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/50 hover:bg-[#1E1E1E] transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-[#F6C646]/30 flex items-center justify-center text-[#F6C646] mb-3 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white">Bookmark</h3>
            <p className="text-[11px] text-[#B8B8B8] mt-0.5">Ayat Disimpan & Catatan</p>
          </button>
        </div>
      </section>

      {/* Two-Column Dashboard: Last Read Card + Daily Tilawah Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lanjutkan Membaca (Continue Reading) */}
        <section aria-labelledby="last-read-heading" className="bg-[#151515] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C646]/30 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] tracking-wide uppercase">
                <BookOpen className="w-4 h-4" />
                <h2 id="last-read-heading">Lanjutkan Membaca</h2>
              </div>
              {lastRead && (
                <span className="text-[11px] text-[#B8B8B8]">
                  Tersimpan di perangkat
                </span>
              )}
            </div>

            {lastRead ? (
              <div className="space-y-1.5 py-1">
                <h3 className="text-xl font-bold text-white">
                  Surat {lastRead.surahLatin}
                </h3>
                <p className="text-sm text-[#F6C646] font-medium">
                  Ayat ke-{lastRead.ayahNomor}
                </p>
                <p className="text-xs text-[#B8B8B8] line-clamp-1">
                  Surat ke-{lastRead.surahNomor} • {lastRead.surahName}
                </p>
              </div>
            ) : (
              <div className="py-3 text-center sm:text-left space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Riwayat Bacaan</h3>
                <p className="text-xs text-[#B8B8B8] leading-relaxed">
                  Buka surat favorit Anda untuk menandai posisi tilawah secara otomatis.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-[#262626]">
            {lastRead ? (
              <button
                onClick={() => onNavigate('quran', lastRead.surahNomor, lastRead.ayahNomor)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-black font-bold text-xs sm:text-sm transition shadow-md"
              >
                <span>Lanjut Tilawah (Ayat {lastRead.ayahNomor})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('quran', 1, 1)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-black font-bold text-xs sm:text-sm transition"
              >
                <span>Mulai dari Al-Fatihah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Progres Tilawah Harian (Daily Tilawah Progress) */}
        <section aria-labelledby="tilawah-target-heading" className="bg-[#151515] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C646]/30 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] tracking-wide uppercase">
                <Flame className="w-4 h-4 text-[#FFD455]" />
                <h2 id="tilawah-target-heading">Target Tilawah Hari Ini</h2>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[11px] text-[#B8B8B8] hover:text-[#F6C646] transition"
              >
                Ubah Target
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">{dailyProgress.count}</span>
                  <span className="text-xs text-[#B8B8B8]">/ {settings.dailyTargetAyat} ayat</span>
                </div>
                <p className="text-xs text-[#B8B8B8] mt-1">
                  {dailyProgress.count >= settings.dailyTargetAyat ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target harian tercapai! Alhamdulillah
                    </span>
                  ) : (
                    <span>Tersisa {Math.max(0, settings.dailyTargetAyat - dailyProgress.count)} ayat lagi untuk mencapai target</span>
                  )}
                </p>
              </div>

              <div className="w-14 h-14 rounded-full border-4 border-[#262626] flex items-center justify-center relative bg-black shrink-0">
                <span className="text-xs font-black text-[#F6C646] font-mono">{progressPercent}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black rounded-full h-2 mt-4 overflow-hidden border border-[#262626]">
              <div
                className="bg-[#F6C646] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#262626] flex items-center justify-between text-xs text-[#B8B8B8]">
            <span>Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            <button
              onClick={() => {
                if (confirm('Reset hitungan ayat hari ini?')) {
                  quranStorage.resetDailyProgress();
                  setDailyProgress(quranStorage.getDailyProgress());
                }
              }}
              className="flex items-center gap-1 hover:text-[#F6C646] transition"
              title="Reset hitungan harian"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </section>
      </div>

      {/* Surat Terakhir Dibuka (Recently Opened Surahs) */}
      {historyList.length > 0 && (
        <section aria-labelledby="history-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="history-heading" className="text-xs font-bold text-[#B8B8B8] uppercase tracking-wider">
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
              className="text-[11px] text-[#888] hover:text-rose-400 transition"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {historyList.slice(0, 6).map((item) => (
              <button
                key={item.surahNomor}
                onClick={() => onNavigate('quran', item.surahNomor, item.ayahNomor)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#151515] border border-[#262626] hover:border-[#F6C646]/40 hover:bg-[#1E1E1E] transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black border border-[#262626] group-hover:border-[#F6C646]/40 flex items-center justify-center text-xs font-bold text-[#F6C646] font-mono">
                    {String(item.surahNomor).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F6C646] transition-colors">
                      {item.surahLatin}
                    </h3>
                    <p className="text-[11px] text-[#B8B8B8]">Ayat terakhir: {item.ayahNomor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-quran text-sm text-[#FFD455] hidden sm:inline">
                    {item.surahName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#666] group-hover:text-[#F6C646] transition" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Tilawah Inspiration Box */}
      <section className="bg-black border border-[#262626] rounded-2xl p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-[#F6C646] uppercase tracking-wide">
            Kalamullah
          </h2>
          <p className="text-xs sm:text-sm text-[#EDEDED] mt-1 italic">
            "Ini adalah sebuah kitab yang Kami turunkan kepadamu penuh dengan berkah supaya mereka memperhatikan ayat-ayatnya dan supaya mendapat pelajaran orang-orang yang mempunyai fikiran."
          </p>
          <span className="text-[11px] text-[#888] mt-1 block">QS. Sad: 29</span>
        </div>
        <button
          onClick={() => onNavigate('quran', 38)}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#262626] text-xs font-semibold text-white border border-[#333333] transition"
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
    </div>
  );
};
