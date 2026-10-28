import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Square,
  AlertCircle,
  LocateFixed,
  Compass,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Building2
} from 'lucide-react';
import {
  prayerTimeService,
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
import {
  getSavedLocation,
  saveLocation,
  INDONESIA_REGIONS,
  RegencyCity
} from '../services/indonesiaRegions';
import { LocationModal } from '../components/LocationModal';

interface Props {
  onOpenQibla?: () => void;
  onOpenDua?: () => void;
}

export const PrayerTimesPage: React.FC<Props> = ({ onOpenQibla, onOpenDua }) => {
  // Current Location from Regional Database
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

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Audio Settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(audioManager.getSettings());
  const [isUnlocked, setIsUnlocked] = useState<boolean>(audioManager.getIsUnlocked());
  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(notificationService.getPermission() === 'granted');
  const [activeAlert, setActiveAlert] = useState(audioManager.getActiveAlert());

  // Current Time & Prayer Times state
  const [now, setNow] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() =>
    prayerTimeService.calculatePrayerTimes(locInfo, new Date())
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
      const times = await prayerTimeService.getPrayerTimesWithApi(locInfo, new Date());
      setPrayerTimes(times);
      setNextPrayer(prayerTimeService.getNextPrayer(times, new Date()));
      prayerScheduler.sync(locInfo, times);

      // Multi-day forecast
      const forecast = prayerTimeService.getMultiDaySchedule(locInfo, new Date(), 7);
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

  const handleSelectLocation = (loc: RegencyCity & { province: string; district?: string }) => {
    setCurrentLocation(loc);
    saveLocation(loc);
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

        let bestCity: RegencyCity | null = null;
        let bestProv = INDONESIA_REGIONS[0];
        let minDist = Infinity;

        for (const prov of INDONESIA_REGIONS) {
          for (const c of prov.cities) {
            const d = Math.hypot(c.latitude - lat, c.longitude - lng);
            if (d < minDist) {
              minDist = d;
              bestCity = c;
              bestProv = prov;
            }
          }
        }

        const detected: RegencyCity & { province: string; district?: string } = {
          name: bestCity ? bestCity.name : 'Lokasi GPS Anda',
          type: bestCity ? bestCity.type : 'Kota',
          province: bestProv.name,
          latitude: Math.round(lat * 10000) / 10000,
          longitude: Math.round(lng * 10000) / 10000,
          timezone: tz,
          timezoneIana: tz === 9 ? 'Asia/Jayapura' : tz === 8 ? 'Asia/Makassar' : 'Asia/Jakarta'
        };

        handleSelectLocation(detected);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Izin akses lokasi ditolak. Silakan pilih wilayah secara manual di bawah.');
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

  const bantenCities = INDONESIA_REGIONS.find((p) => p.id === 'banten')?.cities || [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner & Location Indicator */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
                Jadwal Salat & Waktu Ibadah
              </h1>
              <p className="text-xs text-[#737373]">
                Akurat dengan perhitungan Kemenag RI & API Aladhan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#737373] mt-3">
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 text-[#222222] font-bold hover:text-[#C49A3A] transition"
              title="Klik untuk memilih wilayah"
            >
              <div className="w-5 h-5 rounded-md bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                <MapPin className="w-3 h-3" />
              </div>
              <span>
                {currentLocation.district ? `Kec. ${currentLocation.district}, ` : ''}{currentLocation.name}, {currentLocation.province}
              </span>
              <span className="text-[10px] text-[#C49A3A] underline ml-1">Ubah</span>
            </button>
            <span className="text-[#CCC]">•</span>
            <span>UTC+{currentLocation.timezone}</span>
            <span className="text-[#CCC]">•</span>
            <span className="text-[#C49A3A] font-medium">{prayerTimeService.getHijriDate(now)}</span>
          </div>
        </div>

        {/* Action Controls (Icons in rounded-square boxes) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF3DF] hover:bg-[#F5E8C4] border border-[#E5BD58]/60 text-xs font-bold text-[#C49A3A] transition shadow-2xs"
            title="Pilih Wilayah / Banten"
          >
            <div className="w-5 h-5 rounded-md bg-white border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A]">
              <Building2 className="w-3 h-3" />
            </div>
            <span>Pilih Wilayah</span>
          </button>

          <button
            onClick={handleDetectGPS}
            disabled={geoLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            title="Deteksi Lokasi GPS"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
              {geoLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <LocateFixed className="w-3 h-3" />
              )}
            </div>
            <span>GPS</span>
          </button>

          <button
            onClick={() => setShowMethodModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] text-xs font-semibold text-[#222222] transition"
            title="Metode Perhitungan"
          >
            <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
              <SlidersHorizontal className="w-3 h-3" />
            </div>
            <span className="hidden sm:inline">Metode</span>
          </button>

          <button
            onClick={loadSchedule}
            disabled={loadingSchedule}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
            title="Muat Ulang Jadwal"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSchedule ? 'animate-spin text-[#C49A3A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* GPS Error Message */}
      {geoError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{geoError} Silakan klik tombol "Pilih Wilayah" untuk memilih secara manual.</span>
        </div>
      )}

      {/* Browser Autoplay / Audio Unlock Alert Banner if not unlocked */}
      {!isUnlocked && (
        <div className="p-4 rounded-3xl bg-[#FAF3DF] border border-[#E5BD58] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#222222]">Buka Kunci Audio Pengingat Browser</p>
              <p className="text-[#737373] text-[11px] mt-0.5">
                Kebijakan browser membatasi suara adzan otomatis sebelum ada 1x klik aktif dari pengguna.
              </p>
            </div>
          </div>
          <button
            onClick={unlockUserAudio}
            className="px-4 py-2 bg-[#C49A3A] text-white font-bold text-xs rounded-xl hover:bg-[#B3892B] transition shrink-0 shadow-xs"
          >
            Aktifkan Suara Adzan
          </button>
        </div>
      )}

      {/* 2. Hero Countdown Card (Active / Next Prayer) */}
      <div className="bg-white border-2 border-[#E5BD58] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FAF3DF]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3DF] border border-[#E5BD58]/40 text-xs font-semibold text-[#C49A3A]">
              <div className="w-4 h-4 rounded-md bg-white border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              <span>Menuju Waktu Salat {nextPrayer.name}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] tracking-tight">
                {nextPrayer.name}
              </h2>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#C49A3A]">
                {nextPrayer.time}
              </span>
            </div>

            <p className="text-xs text-[#737373]">
              Waktu lokal sekarang: <strong className="text-[#222222] font-mono">{now.toLocaleTimeString('id-ID')}</strong> • {prayerTimes.methodName}
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-[#F8F8F8] border border-[#EAEAEA] p-5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[210px] shadow-2xs">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-bold">
              Hitung Mundur Sisa Waktu
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#C49A3A] tracking-wider my-1">
              {nextPrayer.formattedRemaining}
            </div>
            <span className="text-[11px] text-[#737373] font-medium">
              {nextPrayer.isToday ? 'Hari ini' : 'Besok dini hari'}
            </span>
          </div>
        </div>

        {/* Quick Navigation Pills: Kiblat & Doa */}
        <div className="mt-6 pt-5 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {onOpenQibla && (
              <button
                onClick={onOpenQibla}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-[#222222] transition font-bold"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                  <Compass className="w-3 h-3" />
                </div>
                <span>Lihat Arah Kiblat</span>
              </button>
            )}

            {onOpenDua && (
              <button
                onClick={onOpenDua}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-[#222222] transition font-bold"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                  <Heart className="w-3 h-3" />
                </div>
                <span>Kumpulan Doa Harian</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#737373]">
            <span>
              Sumber: <strong className="text-[#222222] font-semibold">{prayerTimes.source === 'api' ? 'API Aladhan (Kemenag)' : 'Kalkulasi Astronomis Kemenag'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Schedule View Tabs: Hari Ini vs 7 Hari Kedepan */}
      <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabSchedule('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              activeTabSchedule === 'today'
                ? 'bg-[#C49A3A] text-white border-[#C49A3A] shadow-xs'
                : 'text-[#737373] hover:text-[#222222] border-transparent bg-transparent'
            }`}
          >
            Jadwal Hari Ini
          </button>
          <button
            onClick={() => setActiveTabSchedule('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              activeTabSchedule === 'week'
                ? 'bg-[#C49A3A] text-white border-[#C49A3A] shadow-xs'
                : 'text-[#737373] hover:text-[#222222] border-transparent bg-transparent'
            }`}
          >
            Prakiraan 7 Hari
          </button>
        </div>

        {/* Global Sound Switch */}
        <button
          onClick={handleToggleGlobalSound}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
            audioSettings.soundEnabled
              ? 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
              : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA]'
          }`}
          title="Pengingat Audio Suara Global"
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${audioSettings.soundEnabled ? 'bg-white text-[#C49A3A]' : 'bg-[#EAEAEA] text-[#737373]'}`}>
            {audioSettings.soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </div>
          <span className="hidden sm:inline">{audioSettings.soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}</span>
        </button>
      </div>

      {/* Tab: Today Schedule (All cards with icons in rounded boxes) */}
      {activeTabSchedule === 'today' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {prayerList.map((item) => {
            const Icon = item.icon;
            const isSoundOn = audioSettings.soundEnabled && audioSettings.eventToggles[item.key];

            return (
              <div
                key={item.key}
                className={`p-4 rounded-3xl border transition relative flex flex-col justify-between shadow-2xs ${
                  item.isNext
                    ? 'bg-[#FAF3DF] border-[#C49A3A] shadow-xs'
                    : 'bg-white border-[#EAEAEA] hover:border-[#C49A3A]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${item.isNext ? 'bg-white border-[#E5BD58] text-[#C49A3A]' : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-bold ${item.isNext ? 'text-[#C49A3A]' : 'text-[#222222]'}`}>
                        {item.name}
                      </span>
                    </div>

                    {/* Per-event toggle button */}
                    <button
                      onClick={() => handleToggleEvent(item.key)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                        isSoundOn ? 'bg-white border-[#E5BD58] text-[#C49A3A]' : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#999]'
                      }`}
                      title={isSoundOn ? `Matikan pengingat ${item.name}` : `Aktifkan pengingat ${item.name}`}
                    >
                      {isSoundOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="py-3 text-center">
                    <span className={`text-2xl font-mono font-black tracking-tight ${
                      item.isNext ? 'text-[#C49A3A]' : 'text-[#222222]'
                    }`}>
                      {item.time}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAEAEA] text-[10px] text-[#737373] text-center truncate">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Multi-Day 7-Day Forecast */}
      {activeTabSchedule === 'week' && (
        <div className="bg-white border border-[#EAEAEA] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8F8F8] border-b border-[#EAEAEA] text-[#737373] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Hari / Tanggal</th>
                  <th className="py-3.5 px-3">Hijriah</th>
                  <th className="py-3.5 px-3">Imsak</th>
                  <th className="py-3.5 px-3">Subuh</th>
                  <th className="py-3.5 px-3">Terbit</th>
                  <th className="py-3.5 px-3">Dzuhur</th>
                  <th className="py-3.5 px-3">Ashar</th>
                  <th className="py-3.5 px-3">Maghrib</th>
                  <th className="py-3.5 px-3">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {weekForecast.map((item, idx) => (
                  <tr key={idx} className={idx === 0 ? 'bg-[#FAF3DF]/60 text-[#C49A3A] font-bold' : 'hover:bg-[#F8F8F8] text-[#222222]'}>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      {item.dayName}, {item.dateStr}
                      {idx === 0 && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-[#C49A3A] text-white font-bold rounded-md">Hari ini</span>}
                    </td>
                    <td className="py-3.5 px-3 text-[#737373] whitespace-nowrap">{item.hijriStr}</td>
                    <td className="py-3.5 px-3 font-mono">{item.times.imsak}</td>
                    <td className="py-3.5 px-3 font-mono font-bold">{item.times.subuh}</td>
                    <td className="py-3.5 px-3 font-mono text-[#737373]">{item.times.terbit}</td>
                    <td className="py-3.5 px-3 font-mono">{item.times.dzuhur}</td>
                    <td className="py-3.5 px-3 font-mono">{item.times.ashar}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#C49A3A]">{item.times.maghrib}</td>
                    <td className="py-3.5 px-3 font-mono">{item.times.isya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Dedicated Audio Testing Section with 4 distinct presets */}
      <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#222222] uppercase tracking-wider">
                Uji Coba Audio Pengingat
              </h2>
              <p className="text-[11px] text-[#737373]">
                Pastikan volume dan nada adzan/pengingat terdengar jelas di perangkat
              </p>
            </div>
          </div>

          {activeAlert && (
            <button
              onClick={() => audioManager.stopAudio()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl transition shadow-2xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan Suara</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {AUDIO_TEST_PRESETS.map((preset) => {
            const isThisPlaying = activeAlert?.isTest && activeAlert?.title.includes(preset.name) && activeAlert?.isPlaying;

            return (
              <div
                key={preset.id}
                className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <h3 className="font-bold text-xs text-[#222222] flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isThisPlaying && <span className="w-2.5 h-2.5 rounded-full bg-[#C49A3A] animate-pulse" />}
                  </h3>
                  <p className="text-[11px] text-[#737373] mt-1">{preset.subtitle}</p>
                </div>

                <button
                  onClick={() => {
                    if (isThisPlaying) {
                      audioManager.stopAudio();
                    } else {
                      audioManager.playTestAudio(preset.id as any);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                    isThisPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-xs'
                      : 'bg-white text-[#C49A3A] hover:bg-[#FAF3DF] border border-[#E5BD58] shadow-2xs'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isThisPlaying ? 'bg-white/20 text-white' : 'bg-[#FAF3DF] text-[#C49A3A]'}`}>
                    {isThisPlaying ? (
                      <Square className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                  </div>
                  <span>{isThisPlaying ? 'Berhenti' : 'Putar Audio'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Special Banten & Indonesian Region Quick Cards */}
      <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                Wilayah Banten (8 Kabupaten & Kota)
              </h2>
              <p className="text-[11px] text-[#737373]">Klik untuk langsung menerapkan jadwal ibadah</p>
            </div>
          </div>
          <button
            onClick={() => setShowLocationModal(true)}
            className="text-xs text-[#C49A3A] font-bold hover:underline"
          >
            Lihat Semua Provinsi
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {bantenCities.map((city) => {
            const isSelected = currentLocation.name === city.name;
            return (
              <button
                key={city.name}
                onClick={() => handleSelectLocation({ ...city, province: 'Banten' })}
                className={`p-3 rounded-2xl text-left border transition ${
                  isSelected
                    ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold shadow-2xs'
                    : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#222222] hover:border-[#C49A3A]/40'
                }`}
              >
                <div className="font-bold text-xs truncate">{city.name}</div>
                <div className="text-[10px] text-[#737373] truncate">
                  {city.districts?.length || 0} Kecamatan • Banten
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={handleSelectLocation}
      />

      {/* Calculation Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <h3 className="font-black text-[#222222] text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <span>Metode Perhitungan Salat</span>
              </h3>
              <button
                onClick={() => setShowMethodModal(false)}
                className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Method selection */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#222222] block">Metode Konvensi Sudut:</label>
              {Object.values(CALCULATION_METHODS).map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    selectedMethod === m.id
                      ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold shadow-2xs'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#222222] hover:bg-[#FAF3DF]/40'
                  }`}
                >
                  <span>{m.name}</span>
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                    className="accent-[#C49A3A]"
                  />
                </label>
              ))}
            </div>

            {/* Asr Juristic School */}
            <div className="space-y-2 text-xs pt-2 border-t border-[#EAEAEA]">
              <label className="font-bold text-[#222222] block">Mazhab Perhitungan Waktu Ashar:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsrSchool('standard')}
                  className={`p-3 rounded-2xl text-left border transition ${
                    selectedAsrSchool === 'standard'
                      ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                  }`}
                >
                  <div className="font-bold text-xs">Syafi'i, Maliki, Hanbali</div>
                  <div className="text-[10px]">Standar Indonesia (1x bayangan)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAsrSchool('hanafi')}
                  className={`p-3 rounded-2xl text-left border transition ${
                    selectedAsrSchool === 'hanafi'
                      ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                  }`}
                >
                  <div className="font-bold text-xs">Hanafi</div>
                  <div className="text-[10px]">2x bayangan benda</div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowMethodModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-sm"
            >
              Simpan & Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
