import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  MapPin,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LocateFixed,
  Building2,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import {
  KAABA_COORDS
} from '../services/prayerTimeService';
import { qiblaService } from '../services/qiblaService';
import {
  getSavedLocation,
  saveLocation,
  INDONESIA_REGIONS,
  RegencyCity
} from '../services/indonesiaRegions';
import { LocationModal } from '../components/LocationModal';

interface Props {
  onOpenPrayerTimes?: () => void;
}

export const QiblaPage: React.FC<Props> = ({ onOpenPrayerTimes }) => {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<RegencyCity & { province: string; district?: string }>(
    () => getSavedLocation()
  );

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

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

  // Listen for global location changes
  useEffect(() => {
    const handleLocChanged = (e: any) => {
      const loc = e.detail;
      if (loc) {
        setCurrentLocation({
          name: loc.regencyName,
          type: loc.regencyName.includes('Kota') ? 'Kota' : 'Kabupaten',
          province: loc.provinceName,
          district: loc.districtName,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone,
          timezoneIana: loc.timezoneIana
        });
      }
    };
    window.addEventListener('mydom_location_changed' as any, handleLocChanged);
    return () => {
      window.removeEventListener('mydom_location_changed' as any, handleLocChanged);
    };
  }, []);

  // Save selected location
  const handleSelectLocation = (loc: RegencyCity & { province: string; district?: string }, accuracy?: number) => {
    setCurrentLocation(loc);
    saveLocation(loc);
    if (accuracy !== undefined) setGpsAccuracyMeters(accuracy);
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

        handleSelectLocation(detected, accuracy);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Izin akses lokasi ditolak oleh browser/perangkat. Silakan pilih wilayah secara manual.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError('Sinyal GPS tidak tersedia. Pastikan fitur lokasi perangkat Anda telah aktif.');
        } else if (err.code === err.TIMEOUT) {
          setGeoError('Permintaan lokasi melebihi batas waktu (timeout). Silakan coba lagi.');
        } else {
          setGeoError('Gagal mendeteksi koordinat GPS. Gunakan pilihan wilayah manual.');
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
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
              Arah Kiblat Akurat
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Geodesik lingkaran besar menuju Ka'bah di Mekkah ({KAABA_COORDS.latitude}° LU, {KAABA_COORDS.longitude}° BT)
            </p>
          </div>
        </div>

        {/* Action Controls (Icons in rounded-square boxes) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF3DF] hover:bg-[#F5E8C4] border border-[#E5BD58]/60 text-[#C49A3A] text-xs font-bold transition shadow-2xs"
          >
            <div className="w-5 h-5 rounded-md bg-white border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Building2 className="w-3 h-3" />
            </div>
            <span>Pilih Wilayah</span>
          </button>

          <button
            onClick={handleDetectGPS}
            disabled={geoLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            title="Perbarui koordinat via GPS"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
              {geoLoading ? (
                <RotateCw className="w-3 h-3 animate-spin" />
              ) : (
                <LocateFixed className="w-3 h-3" />
              )}
            </div>
            <span>{geoLoading ? 'GPS...' : 'Deteksi GPS'}</span>
          </button>

          <button
            onClick={() => setIsCalibrateModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] hover:bg-[#FAF3DF] border border-[#EAEAEA] hover:border-[#E5BD58] text-[#737373] hover:text-[#C49A3A] flex items-center justify-center transition"
            title="Panduan Kalibrasi Kompas"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GPS Error Alert */}
      {geoError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{geoError}</p>
            <p className="text-[11px] text-red-600/80 mt-0.5">
              Gunakan tombol "Pilih Wilayah" untuk memilih kabupaten/kota Anda di Banten atau provinsi lainnya.
            </p>
          </div>
        </div>
      )}

      {/* iOS Permission Prompt */}
      {iosPermissionNeeded && (
        <div className="p-4 rounded-3xl bg-[#FAF3DF] border border-[#E5BD58] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5BD58]/50 flex items-center justify-center text-[#C49A3A] shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#222222]">Izin Sensor Orientasi iOS (iPhone/iPad)</p>
              <p className="text-[#737373] text-[11px] mt-0.5">
                Safari iOS memerlukan izin pengguna untuk mengaktifkan kompas dan gyroscope secara real-time.
              </p>
            </div>
          </div>
          <button
            onClick={requestIosPermission}
            className="px-4 py-2 bg-[#C49A3A] text-white font-bold text-xs rounded-xl hover:bg-[#B3892B] transition shrink-0 shadow-xs"
          >
            Izinkan Sensor Kompas
          </button>
        </div>
      )}

      {/* Coordinates & Accuracy Details Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#EAEAEA] p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold block">Lokasi Aktif</span>
          <p className="font-bold text-[#222222] truncate flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C49A3A]" />
            {currentLocation.district ? `Kec. ${currentLocation.district}, ` : ''}{currentLocation.name}
          </p>
          <span className="text-[10px] text-[#737373] block font-mono">
            {currentLocation.latitude.toFixed(4)}°, {currentLocation.longitude.toFixed(4)}°
          </span>
        </div>

        <div className="bg-white border border-[#EAEAEA] p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold block">Derajat Kiblat</span>
          <p className="text-base font-black text-[#C49A3A]">
            {qiblaResult.bearing}°
          </p>
          <span className="text-[10px] text-[#737373] block">
            dari Utara Sejati ({qiblaResult.compassDirection})
          </span>
        </div>

        <div className="bg-white border border-[#EAEAEA] p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold block">Jarak ke Ka'bah</span>
          <p className="text-base font-black text-[#222222]">
            {qiblaResult.distanceKm.toLocaleString('id-ID')} km
          </p>
          <span className="text-[10px] text-[#737373] block">Makkah Al-Mukarramah</span>
        </div>

        <div className="bg-white border border-[#EAEAEA] p-3.5 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold block">Status Sensor</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {hasCompassSensor ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#21865B] animate-pulse" />
                <span className="text-[#21865B] font-bold">Kompas Aktif</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#C49A3A]" />
                <span className="text-[#C49A3A] font-semibold">Penunjuk Sudut</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-[#737373] block">
            {gpsAccuracyMeters ? `Akurasi GPS: ±${gpsAccuracyMeters}m` : 'Koordinat Wilayah'}
          </span>
        </div>
      </div>

      {/* Main Interactive Compass Display (White Theme with Gold Bezel) */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
        {/* Status Callout Pill */}
        <div className="mb-6 z-10">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#21865B] text-white font-extrabold text-xs shadow-md animate-bounce">
              <CheckCircle2 className="w-4 h-4 fill-white text-[#21865B]" />
              <span>ALHAMDULILLAH! TEPAT MENGHADAP KIBLAT</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF3DF] border border-[#E5BD58] text-xs font-bold text-[#C49A3A] shadow-2xs">
              <RotateCw className="w-3.5 h-3.5 text-[#C49A3A] animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                Putar perangkat{' '}
                <strong className="text-[#222222]">
                  {diffAngle > 0 ? `${Math.abs(Math.round(diffAngle))}° ke kanan` : `${Math.abs(Math.round(diffAngle))}° ke kiri`}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Visual Dial Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none my-2">
          {/* Static Outer Ring (Bezel) with Gold Accent Marks */}
          <div className="absolute inset-0 rounded-full border-4 border-[#FAF3DF] bg-[#F8F8F8] shadow-inner flex items-center justify-center">
            {/* Top Indicator Triangle (Phone Heading) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#C49A3A]" />
            </div>

            {/* Inner Ring */}
            <div
              className={`w-[90%] h-[90%] rounded-full border-2 transition duration-300 bg-white ${
                isAligned ? 'border-[#21865B] shadow-[0_0_20px_rgba(33,134,91,0.25)]' : 'border-[#EAEAEA]'
              }`}
            />
          </div>

          {/* Rotating Compass Disc */}
          <div
            className="absolute w-full h-full rounded-full transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `rotate(${-effectiveHeading}deg)` }}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-4 text-xs font-black text-red-600 tracking-wider">U</span>
            <span className="absolute bottom-4 text-xs font-bold text-[#737373]">S</span>
            <span className="absolute right-4 text-xs font-bold text-[#737373]">T</span>
            <span className="absolute left-4 text-xs font-bold text-[#737373]">B</span>

            {/* Kaaba Direction Needle / Marker (Fixed at qiblaResult.bearing on the disc) */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${qiblaResult.bearing}deg)` }}
            >
              <div className="flex flex-col items-center pt-2">
                {/* Kaaba Golden Icon in rounded-square box */}
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-md transition-transform ${
                    isAligned
                      ? 'bg-[#21865B] text-white border-white scale-110 shadow-lg'
                      : 'bg-[#FAF3DF] text-[#C49A3A] border-[#E5BD58]'
                  }`}
                  title="Arah Ka'bah"
                >
                  <span className="text-[13px] font-black">🕋</span>
                </div>
                {/* Golden Target Line extending down to center */}
                <div className={`w-1 h-14 bg-gradient-to-b ${isAligned ? 'from-[#21865B]' : 'from-[#C49A3A]'} to-transparent mt-1`} />
              </div>
            </div>

            {/* Compass Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 flex items-start justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-0.5 ${deg % 90 === 0 ? 'h-3 bg-[#737373]' : 'h-1.5 bg-[#DDD]'}`} />
              </div>
            ))}
          </div>

          {/* Central Compass Pivot & Heading Readout in White Card */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-white border-2 border-[#EAEAEA] shadow-md flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">Arah</span>
            <span className="text-xl font-mono font-black text-[#222222]">
              {Math.round(effectiveHeading)}°
            </span>
            <span className="text-[9px] text-[#C49A3A] font-bold">
              Kiblat: {Math.round(qiblaResult.bearing)}°
            </span>
          </div>
        </div>

        {/* Manual Simulation or Adjustment Slider when sensors absent / user preference */}
        <div className="w-full max-w-md mt-6 pt-6 border-t border-[#EAEAEA] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#222222] font-semibold">
              <input
                type="checkbox"
                checked={useManualMode}
                onChange={(e) => setUseManualMode(e.target.checked)}
                className="rounded accent-[#C49A3A]"
              />
              <span>Mode Penunjuk Derajat Manual</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#737373] text-[11px]" title="Koreksi deklinasi magnetis bumi">
              <input
                type="checkbox"
                checked={useTrueNorthCorrection}
                onChange={(e) => setUseTrueNorthCorrection(e.target.checked)}
                className="rounded accent-[#C49A3A]"
              />
              <span>Koreksi Deklinasi ({qiblaResult.magneticDeclination > 0 ? `+${qiblaResult.magneticDeclination}°` : `${qiblaResult.magneticDeclination}°`})</span>
            </label>
          </div>

          {useManualMode && (
            <div className="space-y-1.5 bg-[#F8F8F8] p-4 rounded-2xl border border-[#EAEAEA]">
              <div className="flex justify-between text-xs text-[#222222]">
                <span className="font-semibold">Geser Arah Hadap Ponsel:</span>
                <span className="font-mono text-[#C49A3A] font-bold text-sm">{manualHeading}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={manualHeading}
                onChange={(e) => setManualHeading(parseInt(e.target.value, 10))}
                className="w-full accent-[#C49A3A] cursor-pointer"
              />
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Geser nilai derajat hingga Ka'bah (🕋) berada tepat di puncak penunjuk emas di atas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banten 8 Cities Quick Access */}
      <div className="bg-white border border-[#EAEAEA] p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                Arah Kiblat Wilayah Banten (8 Kabupaten & Kota)
              </h2>
              <p className="text-[11px] text-[#737373]">Klik daerah untuk melihat derajat akurat</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs text-[#C49A3A] font-bold hover:underline"
          >
            Pilih Kota Lain
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INDONESIA_REGIONS.find((p) => p.id === 'banten')?.cities.map((city) => {
            const isSelected = currentLocation.name === city.name;
            const bBearing = qiblaService.calculate(city.latitude, city.longitude).bearing;
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
                <div className="text-[11px] text-[#C49A3A] font-mono font-bold mt-0.5">
                  {bBearing}° <span className="text-[10px] text-[#737373] font-normal font-sans">Utara</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onLocationSelected={(loc) => {
          handleSelectLocation({
            name: loc.regencyName,
            type: loc.regencyName.includes('Kota') ? 'Kota' : 'Kabupaten',
            province: loc.provinceName,
            district: loc.districtName,
            latitude: loc.latitude,
            longitude: loc.longitude,
            timezone: loc.timezone,
            timezoneIana: loc.timezoneIana
          });
        }}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Calibration Guidance Modal */}
      {isCalibrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <h3 className="font-black text-[#222222] text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                  <Compass className="w-4 h-4" />
                </div>
                <span>Panduan Kalibrasi Kompas</span>
              </h3>
              <button
                onClick={() => setIsCalibrateModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#737373] leading-relaxed">
              <div className="p-3.5 bg-[#FAF3DF]/60 rounded-2xl border border-[#E5BD58]/50 flex items-center gap-3">
                <div className="text-3xl font-black text-[#C49A3A]">∞</div>
                <p className="text-[#222222]">
                  Gerakkan perangkat Anda perlahan membentuk <strong>pola angka 8 (delapan)</strong> di udara selama 5-10 detik.
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5 text-[#555] pl-1">
                <li>Jauhkan perangkat dari casing bermagnet, magnet mobil, speaker, atau logam tebal.</li>
                <li>Pegang perangkat secara mendatar (flat horizontal) sejajar dengan lantai.</li>
                <li>Jika browser di PC desktop tidak memiliki sensor magnetometer, gunakan mode derajat ({qiblaResult.bearing}°).</li>
              </ul>
            </div>

            <button
              onClick={() => setIsCalibrateModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-xs"
            >
              Mengerti & Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
