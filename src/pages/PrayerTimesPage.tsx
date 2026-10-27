import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  Compass,
  Calendar,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';
import {
  prayerTimeService,
  PRESET_LOCATIONS,
  LocationInfo,
  PrayerTimes,
  NextPrayerInfo,
  CALCULATION_METHODS,
  DayScheduleItem
} from '../services/prayerTimeService';
import {
  audioManager,
  AudioSettings,
  PrayerEventType
} from '../services/audioManager';
import { prayerScheduler } from '../services/prayerScheduler';
import { notificationService } from '../services/notificationService';
import { AUDIO_TEST_PRESETS } from '../config/audioConfig';

interface Props {
  onOpenQibla?: () => void;
  onOpenDua?: () => void;
}

export const PrayerTimesPage: React.FC<Props> = ({ onOpenQibla, onOpenDua }) => {
  // Current Location
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('aadom_saved_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return PRESET_LOCATIONS[0];
  });

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Audio Settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(audioManager.getSettings());
  const [isUnlocked, setIsUnlocked] = useState<boolean>(audioManager.getIsUnlocked());
  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(notificationService.getPermission() === 'granted');
  const [activeAlert, setActiveAlert] = useState(audioManager.getActiveAlert());

  // Current Time & Prayer Times state
  const [now, setNow] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() =>
    prayerTimeService.calculatePrayerTimes(currentLocation, new Date())
  );
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(() =>
    prayerTimeService.getNextPrayer(prayerTimes, new Date())
  );

  // Method & school settings
  const [selectedMethod, setSelectedMethod] = useState<string>('kemenag');
  const [selectedAsrSchool, setSelectedAsrSchool] = useState<'standard' | 'hanafi'>('standard');
  const [showMethodModal, setShowMethodModal] = useState<boolean>(false);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [activeTabSchedule, setActiveTabSchedule] = useState<'today' | 'week'>('today');
  const [weekForecast, setWeekForecast] = useState<DayScheduleItem[]>([]);

  // Subscribe to audioManager alerts
  useEffect(() => {
    const unsub = audioManager.subscribe((alert) => {
      setActiveAlert(alert);
      setIsUnlocked(audioManager.getIsUnlocked());
    });
    return unsub;
  }, []);

  // Fetch or calculate prayer times when location or method changes
  const loadSchedule = async () => {
    setLoadingSchedule(true);
    try {
      prayerTimeService.setMethod(selectedMethod);
      prayerTimeService.setAsrJuristic(selectedAsrSchool);
      const times = await prayerTimeService.getPrayerTimesWithApi(currentLocation, new Date());
      setPrayerTimes(times);
      setNextPrayer(prayerTimeService.getNextPrayer(times, new Date()));
      prayerScheduler.sync(currentLocation, times);

      // Multi-day forecast
      const forecast = prayerTimeService.getMultiDaySchedule(currentLocation, new Date(), 7);
      setWeekForecast(forecast);
    } catch (e) {
      console.warn('Failed to load prayer times:', e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [currentLocation.latitude, currentLocation.longitude, currentLocation.name, selectedMethod, selectedAsrSchool]);

  // Real-time ticking every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = new Date();
      setNow(currentNow);
      setNextPrayer(prayerTimeService.getNextPrayer(prayerTimes, currentNow));
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const handleSelectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('aadom_saved_location', JSON.stringify(loc));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat Anda tidak mendukung deteksi lokasi.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const tz = Math.round(-new Date().getTimezoneOffset() / 60);

        let nearestCity = 'Lokasi GPS Anda';
        let minDist = Infinity;
        for (const city of PRESET_LOCATIONS) {
          const d = Math.hypot(city.latitude - lat, city.longitude - lng);
          if (d < minDist && d < 0.4) {
            minDist = d;
            nearestCity = city.name;
          }
        }

        const detected: LocationInfo = {
          name: nearestCity,
          province: 'GPS Otomatis',
          country: 'Indonesia',
          latitude: Math.round(lat * 10000) / 10000,
          longitude: Math.round(lng * 10000) / 10000,
          timezone: tz
        };

        handleSelectLocation(detected);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Izin akses lokasi ditolak. Pilih kota manual di bawah.');
        } else {
          setGeoError('Gagal mendeteksi koordinat GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleToggleEvent = (key: PrayerEventType) => {
    const updatedToggles = {
      ...audioSettings.eventToggles,
      [key]: !audioSettings.eventToggles[key]
    };
    audioManager.saveSettings({ eventToggles: updatedToggles });
    setAudioSettings(audioManager.getSettings());
  };

  const handleToggleGlobalSound = () => {
    const newState = !audioSettings.soundEnabled;
    audioManager.saveSettings({ soundEnabled: newState });
    setAudioSettings(audioManager.getSettings());
  };

  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setHasNotifPermission(granted);
    audioManager.saveSettings({ notificationsEnabled: granted });
    setAudioSettings(audioManager.getSettings());
  };

  const unlockUserAudio = () => {
    audioManager.unlockAudio();
    setIsUnlocked(true);
  };

  // Prayer list data structure
  const prayerList: {
    key: PrayerEventType;
    name: string;
    time: string;
    isNext: boolean;
    icon: typeof Sun;
    description: string;
  }[] = [
    {
      key: 'imsak',
      name: 'Imsak',
      time: prayerTimes.imsak,
      isNext: nextPrayer.name === 'Imsak',
      icon: Moon,
      description: 'Batas persiapan puasa (10 menit sebelum Subuh)'
    },
    {
      key: 'subuh',
      name: 'Subuh',
      time: prayerTimes.subuh,
      isNext: nextPrayer.name === 'Subuh',
      icon: Sunrise,
      description: 'Fajar shodiq terbit hingga sebelum matahari terbit'
    },
    {
      key: 'terbit',
      name: 'Terbit (Syuruq)',
      time: prayerTimes.terbit,
      isNext: nextPrayer.name === 'Terbit',
      icon: Sun,
      description: 'Matahari mulai terbit di ufuk timur'
    },
    {
      key: 'dzuhur',
      name: 'Dzuhur',
      time: prayerTimes.dzuhur,
      isNext: nextPrayer.name === 'Dzuhur',
      icon: Sun,
      description: 'Matahari tergelincir dari tengah langit ke barat'
    },
    {
      key: 'ashar',
      name: 'Ashar',
      time: prayerTimes.ashar,
      isNext: nextPrayer.name === 'Ashar',
      icon: Sun,
      description: 'Bayangan benda sama panjang dengan aslinya'
    },
    {
      key: 'maghrib',
      name: 'Maghrib',
      time: prayerTimes.maghrib,
      isNext: nextPrayer.name === 'Maghrib',
      icon: Sunset,
      description: 'Matahari terbenam sepenuhnya di ufuk barat'
    },
    {
      key: 'isya',
      name: 'Isya',
      time: prayerTimes.isya,
      isNext: nextPrayer.name === 'Isya',
      icon: Moon,
      description: 'Hilangnya mega merah di ufuk barat'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner & Location Indicator */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F6C646]/10 text-[#F6C646] border border-[#F6C646]/20">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Jadwal Salat & Waktu Ibadah
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#B8B8B8] mt-2">
            <span className="flex items-center gap-1 text-white font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#F6C646]" />
              {currentLocation.name}{currentLocation.province ? `, ${currentLocation.province}` : ''}
            </span>
            <span className="text-[#555]">•</span>
            <span>Zona Waktu: UTC+{currentLocation.timezone} ({currentLocation.timezoneIana || 'WIB'})</span>
            <span className="text-[#555]">•</span>
            <span className="text-[#FFD455] font-medium">{prayerTimeService.getHijriDate(now)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDetectGPS}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-black text-xs font-bold transition shadow-sm disabled:opacity-50"
            title="Deteksi Lokasi GPS"
          >
            {geoLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
            <span>GPS</span>
          </button>

          <button
            onClick={() => setShowMethodModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-[#222] border border-[#262626] text-xs font-semibold text-[#CCC] hover:text-white transition"
            title="Metode Perhitungan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#F6C646]" />
            <span>Metode</span>
          </button>

          <button
            onClick={loadSchedule}
            disabled={loadingSchedule}
            className="p-2 rounded-xl bg-black/60 hover:bg-[#222] border border-[#262626] text-[#B8B8B8] hover:text-white transition"
            title="Muat Ulang Jadwal"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSchedule ? 'animate-spin text-[#F6C646]' : ''}`} />
          </button>
        </div>
      </div>

      {/* GPS Error Message */}
      {geoError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{geoError} Silakan pilih kota manual di bawah.</span>
        </div>
      )}

      {/* Browser Autoplay / Audio Unlock Alert Banner if not unlocked */}
      {!isUnlocked && (
        <div className="p-4 rounded-2xl bg-[#1e1a0b] border border-[#F6C646]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-[#F6C646] shrink-0" />
            <div>
              <p className="font-bold text-white">Buka Kunci Audio Browser</p>
              <p className="text-[#DDD] text-[11px] mt-0.5">
                Kebijakan browser membatasi audio otomatis sebelum ada interaksi langsung klik/sentuhan layar dari pengguna.
              </p>
            </div>
          </div>
          <button
            onClick={unlockUserAudio}
            className="px-4 py-2 bg-[#F6C646] text-black font-bold text-xs rounded-xl hover:bg-[#FFD455] transition shrink-0"
          >
            Buka Kunci Audio Sekarang
          </button>
        </div>
      )}

      {/* 2. Hero Countdown Card (Active / Next Prayer) */}
      <div className="bg-gradient-to-br from-[#1a1708] via-[#121212] to-black border-2 border-[#F6C646]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F6C646]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#F6C646]/30 text-xs font-semibold text-[#FFD455]">
              <Sparkles className="w-3.5 h-3.5 text-[#F6C646]" />
              <span>Menuju Waktu {nextPrayer.name}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {nextPrayer.name}
              </h2>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F6C646]">
                {nextPrayer.time}
              </span>
            </div>

            <p className="text-xs text-[#B8B8B8]">
              Waktu lokal sekarang: <strong className="text-white font-mono">{now.toLocaleTimeString('id-ID')}</strong> • {prayerTimes.methodName}
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-black/80 border border-[#262626] p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[200px]">
            <span className="text-[10px] text-[#888] uppercase tracking-wider font-bold">
              Hitung Mundur Sisa Waktu
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#F6C646] tracking-wider my-1">
              {nextPrayer.formattedRemaining}
            </div>
            <span className="text-[11px] text-[#AAA]">
              {nextPrayer.isToday ? 'Hari ini' : 'Besok dini hari'}
            </span>
          </div>
        </div>

        {/* Quick Navigation Pills: Kiblat & Doa */}
        <div className="mt-6 pt-5 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {onOpenQibla && (
              <button
                onClick={onOpenQibla}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#151515] hover:bg-[#222] border border-[#262626] text-[#CCC] hover:text-white transition font-medium"
              >
                <Compass className="w-3.5 h-3.5 text-[#F6C646]" />
                <span>Lihat Arah Kiblat</span>
              </button>
            )}

            {onOpenDua && (
              <button
                onClick={onOpenDua}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#151515] hover:bg-[#222] border border-[#262626] text-[#CCC] hover:text-white transition font-medium"
              >
                <Heart className="w-3.5 h-3.5 text-[#F6C646]" />
                <span>Kumpulan Doa Harian</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#888]">
              Sumber: <strong className="text-white font-medium">{prayerTimes.source === 'api' ? 'API Aladhan' : 'Perhitungan Astronomis'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Schedule View Tabs: Hari Ini vs 7 Hari Kedepan */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabSchedule('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              activeTabSchedule === 'today'
                ? 'bg-[#F6C646] text-black border-[#F6C646]'
                : 'text-[#B8B8B8] hover:text-white border-transparent'
            }`}
          >
            Jadwal Hari Ini
          </button>
          <button
            onClick={() => setActiveTabSchedule('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              activeTabSchedule === 'week'
                ? 'bg-[#F6C646] text-black border-[#F6C646]'
                : 'text-[#B8B8B8] hover:text-white border-transparent'
            }`}
          >
            Prakiraan 7 Hari
          </button>
        </div>

        {/* Global Sound Switch */}
        <button
          onClick={handleToggleGlobalSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            audioSettings.soundEnabled
              ? 'bg-[#151515] text-[#F6C646] border-[#F6C646]/30'
              : 'bg-[#151515] text-[#888] border-[#262626]'
          }`}
          title="Pengingat Audio Suara Global"
        >
          {audioSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{audioSettings.soundEnabled ? 'Audio Aktif' : 'Audio Mati'}</span>
        </button>
      </div>

      {/* Tab: Today Schedule */}
      {activeTabSchedule === 'today' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {prayerList.map((item) => {
            const Icon = item.icon;
            const isSoundOn = audioSettings.soundEnabled && audioSettings.eventToggles[item.key];

            return (
              <div
                key={item.key}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  item.isNext
                    ? 'bg-[#1e1a0b] border-[#F6C646] shadow-lg shadow-[#F6C646]/10'
                    : 'bg-[#151515] border-[#262626] hover:border-[#3a3a3a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#222]">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${item.isNext ? 'text-[#F6C646]' : 'text-[#888]'}`} />
                      <span className={`text-xs font-bold ${item.isNext ? 'text-[#F6C646]' : 'text-white'}`}>
                        {item.name}
                      </span>
                    </div>

                    {/* Per-event toggle button */}
                    <button
                      onClick={() => handleToggleEvent(item.key)}
                      className={`p-1 rounded-md transition ${
                        isSoundOn ? 'text-[#F6C646] hover:text-white' : 'text-[#555] hover:text-[#888]'
                      }`}
                      title={isSoundOn ? `Matikan pengingat ${item.name}` : `Aktifkan pengingat ${item.name}`}
                    >
                      {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="py-3 text-center">
                    <span className={`text-2xl font-mono font-black tracking-tight ${
                      item.isNext ? 'text-[#F6C646]' : 'text-white'
                    }`}>
                      {item.time}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222] text-[10px] text-[#777] text-center truncate">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Multi-Day 7-Day Forecast */}
      {activeTabSchedule === 'week' && (
        <div className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-black/60 border-b border-[#262626] text-[#888] font-bold">
                <tr>
                  <th className="py-3 px-4">Hari / Tanggal</th>
                  <th className="py-3 px-3">Hijriah</th>
                  <th className="py-3 px-3">Imsak</th>
                  <th className="py-3 px-3">Subuh</th>
                  <th className="py-3 px-3">Terbit</th>
                  <th className="py-3 px-3">Dzuhur</th>
                  <th className="py-3 px-3">Ashar</th>
                  <th className="py-3 px-3">Maghrib</th>
                  <th className="py-3 px-3">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {weekForecast.map((item, idx) => (
                  <tr key={idx} className={idx === 0 ? 'bg-[#1e1a0b]/40 text-[#F6C646]' : 'hover:bg-black/40 text-white'}>
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">
                      {item.dayName}, {item.dateStr}
                      {idx === 0 && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 bg-[#F6C646] text-black font-bold rounded">Hari ini</span>}
                    </td>
                    <td className="py-3 px-3 text-[#AAA] whitespace-nowrap">{item.hijriStr}</td>
                    <td className="py-3 px-3 font-mono">{item.times.imsak}</td>
                    <td className="py-3 px-3 font-mono font-bold">{item.times.subuh}</td>
                    <td className="py-3 px-3 font-mono text-[#888]">{item.times.terbit}</td>
                    <td className="py-3 px-3 font-mono">{item.times.dzuhur}</td>
                    <td className="py-3 px-3 font-mono">{item.times.ashar}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#FFD455]">{item.times.maghrib}</td>
                    <td className="py-3 px-3 font-mono">{item.times.isya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Dedicated Audio Testing Section with all 4 distinct buttons strictly mapped */}
      <div className="bg-[#151515] border border-[#262626] p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#F6C646]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Uji Coba Audio Pengingat (Audio Testing)
            </h2>
          </div>

          {activeAlert && (
            <button
              onClick={() => audioManager.stopAudio()}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-semibold rounded-lg transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan Audio</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#B8B8B8] leading-relaxed">
          Tekan tombol di bawah untuk menguji kualitas audio dan memastikan browser mengizinkan pemutaran audio pengingat:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {AUDIO_TEST_PRESETS.map((preset) => {
            const isThisPlaying = activeAlert?.isTest && activeAlert?.title.includes(preset.name) && activeAlert?.isPlaying;

            return (
              <div
                key={preset.id}
                className="bg-black/60 border border-[#262626] p-4 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <h3 className="font-bold text-xs text-white flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isThisPlaying && <span className="w-2 h-2 rounded-full bg-[#F6C646] animate-pulse" />}
                  </h3>
                  <p className="text-[11px] text-[#888] mt-1">{preset.subtitle}</p>
                </div>

                <button
                  onClick={() => {
                    if (isThisPlaying) {
                      audioManager.stopAudio();
                    } else {
                      audioManager.playTestAudio(preset.id as any);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    isThisPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[#1e1a0b] text-[#F6C646] hover:bg-[#F6C646] hover:text-black border border-[#F6C646]/40'
                  }`}
                >
                  {isThisPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Berhenti</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Putar Audio</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. City Selector Grid */}
      <div className="bg-[#151515] border border-[#262626] p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <h2>Daftar Kota Pilihan</h2>
          </div>
          <span className="text-[11px] text-[#888]">{PRESET_LOCATIONS.length} Kota Tersedia</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PRESET_LOCATIONS.map((city) => {
            const isSelected = currentLocation.name === city.name;
            return (
              <button
                key={city.name}
                onClick={() => handleSelectLocation(city)}
                className={`p-2.5 rounded-xl text-left border transition ${
                  isSelected
                    ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                    : 'bg-black/50 border-[#262626] text-[#CCC] hover:border-[#444] hover:text-white'
                }`}
              >
                <div className="font-bold text-xs truncate">{city.name}</div>
                <div className="text-[10px] text-[#777] truncate">{city.province || city.country}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculation Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#F6C646]/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#F6C646]" />
                <span>Pengaturan Metode Perhitungan</span>
              </h3>
              <button
                onClick={() => setShowMethodModal(false)}
                className="text-[#888] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Method selection */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-white block">Metode Konvensi Sudut:</label>
              {Object.values(CALCULATION_METHODS).map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedMethod === m.id
                      ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                      : 'bg-black/40 border-[#262626] text-[#CCC] hover:bg-[#222]'
                  }`}
                >
                  <span className="font-semibold">{m.name}</span>
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                    className="accent-[#F6C646]"
                  />
                </label>
              ))}
            </div>

            {/* Asr Juristic School */}
            <div className="space-y-2 text-xs pt-2 border-t border-[#262626]">
              <label className="font-bold text-white block">Mazhab Perhitungan Waktu Ashar:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsrSchool('standard')}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    selectedAsrSchool === 'standard'
                      ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                      : 'bg-black/40 border-[#262626] text-[#888]'
                  }`}
                >
                  <div className="font-bold">Syafi'i, Maliki, Hanbali</div>
                  <div className="text-[10px]">Bayangan 1x objek (Standar)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAsrSchool('hanafi')}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    selectedAsrSchool === 'hanafi'
                      ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                      : 'bg-black/40 border-[#262626] text-[#888]'
                  }`}
                >
                  <div className="font-bold">Hanafi</div>
                  <div className="text-[10px]">Bayangan 2x objek</div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowMethodModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#F6C646] text-black font-bold text-xs hover:bg-[#FFD455] transition"
            >
              Simpan & Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
