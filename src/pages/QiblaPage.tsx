import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LocateFixed,
  Sliders,
  ShieldAlert,
  Info,
  RefreshCw,
  Check,
  Smartphone
} from 'lucide-react';
import {
  prayerTimeService,
  PRESET_LOCATIONS,
  LocationInfo,
  KAABA_COORDS
} from '../services/prayerTimeService';
import { qiblaService } from '../services/qiblaService';

interface Props {
  onOpenPrayerTimes?: () => void;
}

export const QiblaPage: React.FC<Props> = ({ onOpenPrayerTimes }) => {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('aadom_saved_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return PRESET_LOCATIONS[0]; // Jakarta default
  });

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);

  // Compass sensor state
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<'calibrated' | 'uncalibrated' | 'unavailable' | 'checking'>('checking');
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState<boolean>(false);
  const [iosPermissionNeeded, setIosPermissionNeeded] = useState<boolean>(false);

  // Manual fallback simulation slider
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [useManualMode, setUseManualMode] = useState<boolean>(false);
  const [useTrueNorthCorrection, setUseTrueNorthCorrection] = useState<boolean>(true);

  // Calculate accurate geodesic Qibla bearing
  const qiblaResult = useMemo(() => {
    return qiblaService.calculate(currentLocation.latitude, currentLocation.longitude);
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Save selected location
  const handleSelectLocation = (loc: LocationInfo, accuracy?: number) => {
    setCurrentLocation(loc);
    if (accuracy !== undefined) setGpsAccuracyMeters(accuracy);
    try {
      localStorage.setItem('aadom_saved_location', JSON.stringify(loc));
    } catch (e) {
      console.warn(e);
    }
  };

  // Auto-detect GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
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

        handleSelectLocation(detected, accuracy);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Izin akses lokasi ditolak oleh browser/perangkat. Silakan pilih kota manual di bawah.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError('Sinyal GPS tidak tersedia. Pastikan fitur lokasi perangkat Anda telah aktif.');
        } else if (err.code === err.TIMEOUT) {
          setGeoError('Permintaan lokasi melebihi batas waktu (timeout). Silakan coba lagi.');
        } else {
          setGeoError('Gagal mendeteksi koordinat GPS. Gunakan daftar kota manual.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Device orientation listener
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS webkitCompassHeading (degrees from Magnetic North)
    const iosEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
    if (typeof iosEvent.webkitCompassHeading === 'number') {
      heading = iosEvent.webkitCompassHeading;
      if (iosEvent.webkitCompassAccuracy && iosEvent.webkitCompassAccuracy > 15) {
        setSensorStatus('uncalibrated');
      } else {
        setSensorStatus('calibrated');
      }
    } else if (event.alpha !== null) {
      // Android standard orientation
      const isAbsolute = (event as DeviceOrientationEvent & { absolute?: boolean }).absolute;
      heading = isAbsolute ? (360 - event.alpha) % 360 : 360 - event.alpha;
      setSensorStatus('calibrated');
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(Math.round(heading));
      setHasCompassSensor(true);
    }
  }, []);

  // Request iOS 13+ sensor permissions if needed
  const requestIosPermission = async () => {
    try {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === 'granted') {
          setIosPermissionNeeded(false);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setUseManualMode(true);
          setSensorStatus('unavailable');
        }
      }
    } catch (e) {
      console.warn('iOS permission error:', e);
      setUseManualMode(true);
      setSensorStatus('unavailable');
    }
  };

  useEffect(() => {
    const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
      setIosPermissionNeeded(true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      // Timeout fallback if sensor never emits
      const checkTimeout = setTimeout(() => {
        setHasCompassSensor((prev) => {
          if (!prev) setSensorStatus('unavailable');
          return prev;
        });
      }, 3500);

      return () => {
        clearTimeout(checkTimeout);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    } else {
      setSensorStatus('unavailable');
      setUseManualMode(true);
    }
  }, [handleOrientation]);

  // Current active heading
  const currentHeading = useManualMode ? manualHeading : deviceHeading;

  // Apply Magnetic Declination correction if user enabled True North mode
  const effectiveHeading = useTrueNorthCorrection
    ? (currentHeading + qiblaResult.magneticDeclination + 360) % 360
    : currentHeading;

  // Difference between current heading and Qibla bearing
  const diffAngle = ((qiblaResult.bearing - effectiveHeading + 540) % 360) - 180;
  const isAligned = Math.abs(diffAngle) <= 3; // within 3 degrees tolerance

  // Trigger brief haptic vibration when aligned
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch {
        // safe ignore
      }
    }
  }, [isAligned]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F6C646]/10 text-[#F6C646] border border-[#F6C646]/20">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Arah Kiblat Akurat
            </h1>
          </div>
          <p className="text-xs text-[#B8B8B8] mt-1.5">
            Dihitung menggunakan rumus geodesik lingkaran besar (Great-Circle Forward Azimuth) menuju Ka'bah di Mekkah ({KAABA_COORDS.latitude}° LU, {KAABA_COORDS.longitude}° BT).
          </p>
        </div>

        {/* Location GPS Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDetectGPS}
            disabled={geoLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F6C646] hover:bg-[#FFD455] text-black text-xs font-bold transition shadow-sm disabled:opacity-50"
            title="Perbarui koordinat via GPS"
          >
            {geoLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            <span>{geoLoading ? 'Mendeteksi...' : 'Deteksi GPS'}</span>
          </button>

          <button
            onClick={() => setIsCalibrateModalOpen(true)}
            className="p-2 text-[#B8B8B8] hover:text-white bg-black/60 hover:bg-[#222] border border-[#262626] rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
            title="Panduan Kalibrasi Kompas"
          >
            <HelpCircle className="w-4 h-4 text-[#F6C646]" />
            <span className="hidden sm:inline">Kalibrasi</span>
          </button>
        </div>
      </div>

      {/* GPS Error Alert */}
      {geoError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{geoError}</p>
            <p className="text-[11px] text-red-300/80 mt-0.5">
              Gunakan pemilihan kota terdekat secara manual di bagian bawah agar perhitungan tetap akurat.
            </p>
          </div>
        </div>
      )}

      {/* iOS Permission Prompt */}
      {iosPermissionNeeded && (
        <div className="p-4 rounded-2xl bg-[#1e1a0b] border border-[#F6C646]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[#F6C646] shrink-0" />
            <div>
              <p className="font-bold text-white">Izin Sensor Orientasi iOS (iPhone/iPad)</p>
              <p className="text-[#DDD] text-[11px] mt-0.5">
                Safari iOS memerlukan izin pengguna untuk mengakses kompas dan sensor gerakan.
              </p>
            </div>
          </div>
          <button
            onClick={requestIosPermission}
            className="px-4 py-2 bg-[#F6C646] text-black font-bold text-xs rounded-xl hover:bg-[#FFD455] transition shrink-0"
          >
            Izinkan Sensor Kompas
          </button>
        </div>
      )}

      {/* Coordinates & Accuracy Details Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#151515] border border-[#262626] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Lokasi Aktif</span>
          <p className="font-bold text-white truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#F6C646]" />
            {currentLocation.name}
          </p>
          <span className="text-[10px] text-[#777] block font-mono">
            {currentLocation.latitude.toFixed(4)}°, {currentLocation.longitude.toFixed(4)}°
          </span>
        </div>

        <div className="bg-[#151515] border border-[#262626] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Derajat Kiblat</span>
          <p className="text-base font-black text-[#F6C646]">
            {qiblaResult.bearing}°
          </p>
          <span className="text-[10px] text-[#B8B8B8] block">
            dari Utara Sejati ({qiblaResult.compassDirection})
          </span>
        </div>

        <div className="bg-[#151515] border border-[#262626] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Jarak ke Ka'bah</span>
          <p className="text-base font-black text-white">
            {qiblaResult.distanceKm.toLocaleString('id-ID')} km
          </p>
          <span className="text-[10px] text-[#B8B8B8] block">Makkah Al-Mukarramah</span>
        </div>

        <div className="bg-[#151515] border border-[#262626] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-[#888] uppercase tracking-wider block">Status Sensor</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {hasCompassSensor ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">Sensor Aktif</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-semibold">Mode Penunjuk Manual</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-[#777] block">
            {gpsAccuracyMeters ? `Akurasi GPS: ±${gpsAccuracyMeters}m` : 'Koordinat Terpilih'}
          </span>
        </div>
      </div>

      {/* Main Interactive Compass Display */}
      <div className="bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
        {/* Alignment Glow Effect */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            isAligned
              ? 'opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F6C646]/40 via-transparent to-transparent'
              : 'opacity-0'
          }`}
        />

        {/* Status Callout Pill */}
        <div className="mb-6 z-10">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F6C646] text-black font-extrabold text-xs shadow-lg animate-bounce">
              <CheckCircle2 className="w-4 h-4 fill-black text-[#F6C646]" />
              <span>ALHAMDULILLAH! TEPAT MENGHADAP KIBLAT</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-[#262626] text-xs font-medium text-[#B8B8B8]">
              <RotateCw className="w-3.5 h-3.5 text-[#F6C646] animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                Putar perangkat{' '}
                <strong className="text-white">
                  {diffAngle > 0 ? `${Math.abs(Math.round(diffAngle))}° ke kanan` : `${Math.abs(Math.round(diffAngle))}° ke kiri`}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Visual Dial Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none my-2">
          {/* Static Outer Ring (Bezel) with Degree Marks */}
          <div className="absolute inset-0 rounded-full border-2 border-[#262626] bg-[#0d0d0d] shadow-inner flex items-center justify-center">
            {/* Top Indicator Triangle (Phone Heading) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#F6C646]" />
            </div>

            {/* Inner Ring Glow */}
            <div
              className={`w-[90%] h-[90%] rounded-full border transition duration-300 ${
                isAligned ? 'border-[#F6C646] shadow-[0_0_30px_rgba(246,198,70,0.3)]' : 'border-[#222]'
              }`}
            />
          </div>

          {/* Rotating Compass Disc (Rotates opposite to effective device heading) */}
          <div
            className="absolute w-full h-full rounded-full transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `rotate(${-effectiveHeading}deg)` }}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-3 text-xs font-black text-rose-500 tracking-wider">U</span>
            <span className="absolute bottom-3 text-xs font-bold text-[#888]">S</span>
            <span className="absolute right-4 text-xs font-bold text-[#888]">T</span>
            <span className="absolute left-4 text-xs font-bold text-[#888]">B</span>

            {/* Kaaba Direction Needle / Marker (Fixed at qiblaResult.bearing on the disc) */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${qiblaResult.bearing}deg)` }}
            >
              <div className="flex flex-col items-center pt-2">
                {/* Kaaba Golden Icon */}
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-lg transition-transform ${
                    isAligned
                      ? 'bg-[#F6C646] text-black border-white scale-110'
                      : 'bg-[#1e1a0b] text-[#F6C646] border-[#F6C646]/50'
                  }`}
                  title="Arah Ka'bah"
                >
                  <span className="text-[13px] font-black">🕋</span>
                </div>
                {/* Golden Target Line extending down to center */}
                <div className="w-1 h-14 bg-gradient-to-b from-[#F6C646] to-transparent mt-1" />
              </div>
            </div>

            {/* Subtle Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 flex items-start justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-0.5 ${deg % 90 === 0 ? 'h-3 bg-[#666]' : 'h-1.5 bg-[#333]'}`} />
              </div>
            ))}
          </div>

          {/* Central Compass Pivot & Heading Readout */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-[#151515] border-2 border-[#262626] flex flex-col items-center justify-center shadow-xl">
            <span className="text-[10px] text-[#777] uppercase font-bold tracking-wider">Heading</span>
            <span className="text-xl font-mono font-black text-white">
              {Math.round(effectiveHeading)}°
            </span>
            <span className="text-[9px] text-[#F6C646] font-semibold">
              Kiblat: {Math.round(qiblaResult.bearing)}°
            </span>
          </div>
        </div>

        {/* Manual Simulation or Adjustment Slider when sensors absent / user preference */}
        <div className="w-full max-w-md mt-6 pt-6 border-t border-[#262626] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#B8B8B8]">
              <input
                type="checkbox"
                checked={useManualMode}
                onChange={(e) => setUseManualMode(e.target.checked)}
                className="rounded accent-[#F6C646]"
              />
              <span className="font-medium">Mode Penunjuk Sudut Manual (Simulasi Geser)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#888] text-[11px]" title="Koreksi deklinasi magnetis bumi">
              <input
                type="checkbox"
                checked={useTrueNorthCorrection}
                onChange={(e) => setUseTrueNorthCorrection(e.target.checked)}
                className="rounded accent-[#F6C646]"
              />
              <span>Koreksi Deklinasi ({qiblaResult.magneticDeclination > 0 ? `+${qiblaResult.magneticDeclination}°` : `${qiblaResult.magneticDeclination}°`})</span>
            </label>
          </div>

          {useManualMode && (
            <div className="space-y-1.5 bg-black/50 p-3.5 rounded-xl border border-[#222]">
              <div className="flex justify-between text-xs text-[#DDD]">
                <span>Geser Arah Ponsel / Pandangan:</span>
                <span className="font-mono text-[#F6C646] font-bold">{manualHeading}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={manualHeading}
                onChange={(e) => setManualHeading(parseInt(e.target.value, 10))}
                className="w-full accent-[#F6C646] cursor-pointer"
              />
              <p className="text-[10px] text-[#777] leading-relaxed">
                Geser nilai derajat hingga Ka'bah (🕋) tepat berada di puncak penunjuk kuning di atas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual City Selector */}
      <div className="bg-[#151515] border border-[#262626] p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <h2>Pilih Kota / Lokasi Geografis</h2>
          </div>
          <span className="text-[11px] text-[#888]">{PRESET_LOCATIONS.length} Kota Terdaftar</span>
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

      {/* Calibration Guidance Modal */}
      {isCalibrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#F6C646]/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#F6C646]" />
                <span>Panduan Kalibrasi Kompas</span>
              </h3>
              <button
                onClick={() => setIsCalibrateModalOpen(false)}
                className="text-[#888] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#CCC] leading-relaxed">
              <div className="p-3 bg-black/60 rounded-xl border border-[#262626] flex items-center gap-3">
                <div className="text-2xl font-black text-[#F6C646]">∞</div>
                <p>
                  Gerakkan perangkat Anda perlahan membentuk <strong>pola angka 8 (delapan)</strong> di udara selama 5-10 detik.
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5 text-[#AAA] pl-1">
                <li>Jauhkan perangkat dari benda bermagnet, speaker, casing bermagnet, atau laptop logam.</li>
                <li>Pegang perangkat secara mendatar (flat horizontal) sejajar dengan lantai.</li>
                <li>Jika browser di PC desktop tidak memiliki sensor magnetometer, gunakan mode manual atau lihat derajat kiblat ({qiblaResult.bearing}°).</li>
              </ul>
            </div>

            <button
              onClick={() => setIsCalibrateModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#F6C646] text-black font-bold text-xs hover:bg-[#FFD455] transition"
            >
              Mengerti & Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
