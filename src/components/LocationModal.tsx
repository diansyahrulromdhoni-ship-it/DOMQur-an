import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  X,
  Search,
  LocateFixed,
  Check,
  ChevronRight,
  AlertCircle,
  Building2,
  RefreshCw,
  Layers,
  ArrowLeft,
  Navigation
} from 'lucide-react';
import {
  wilayahService,
  ProvinceItem,
  RegencyItem,
  DistrictItem,
  VillageItem,
  ActiveLocation,
  getActiveLocation,
  saveActiveLocation,
  FALLBACK_PROVINCES,
  FALLBACK_BANTEN_REGENCIES
} from '../services/wilayahService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected?: (location: ActiveLocation) => void;
}

export const LocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLocationSelected
}) => {
  const currentLocation = getActiveLocation();

  // Hierarchy State
  const [provinces, setProvinces] = useState<ProvinceItem[]>(FALLBACK_PROVINCES);
  const [regencies, setRegencies] = useState<RegencyItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [villages, setVillages] = useState<VillageItem[]>([]);

  // Selection
  const [selectedProvId, setSelectedProvId] = useState<string>(currentLocation.provinceId || '36');
  const [selectedRegId, setSelectedRegId] = useState<string>(currentLocation.regencyId || '3674');
  const [selectedDistId, setSelectedDistId] = useState<string>(currentLocation.districtId || '');
  const [selectedVillId, setSelectedVillId] = useState<string>(currentLocation.villageId || '');

  // Loading & Error states
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingRegencies, setLoadingRegencies] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingVillages, setLoadingVillages] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & GPS
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Active step in modal: 1 = Provinsi, 2 = Kabupaten/Kota, 3 = Kecamatan, 4 = Ringkasan & Konfirmasi
  const [step, setStep] = useState<number>(1);

  // Load provinces on mount
  useEffect(() => {
    let mounted = true;
    async function loadProv() {
      setLoadingProvinces(true);
      try {
        const provs = await wilayahService.getProvinces();
        if (mounted && provs.length > 0) {
          setProvinces(provs);
        }
      } catch {
        // Fallback already assigned
      } finally {
        if (mounted) setLoadingProvinces(false);
      }
    }
    loadProv();
    return () => {
      mounted = false;
    };
  }, []);

  // When province changes, load regencies and clear lower levels
  useEffect(() => {
    if (!selectedProvId) {
      setRegencies([]);
      return;
    }

    let mounted = true;
    async function loadReg() {
      setLoadingRegencies(true);
      setFetchError(null);
      try {
        const data = await wilayahService.getRegencies(selectedProvId);
        if (mounted) {
          setRegencies(data);
          // If previous regency does not belong to new province, reset it
          if (!data.some((r) => r.id === selectedRegId)) {
            setSelectedRegId(data[0]?.id || '');
            setSelectedDistId('');
            setSelectedVillId('');
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setFetchError('Gagal memuat daftar kabupaten/kota. Menggunakan data tersimpan.');
          if (selectedProvId === '36') setRegencies(FALLBACK_BANTEN_REGENCIES);
        }
      } finally {
        if (mounted) setLoadingRegencies(false);
      }
    }
    loadReg();
    return () => {
      mounted = false;
    };
  }, [selectedProvId]);

  // When regency changes, load districts and clear village
  useEffect(() => {
    if (!selectedRegId) {
      setDistricts([]);
      return;
    }

    let mounted = true;
    async function loadDist() {
      setLoadingDistricts(true);
      try {
        const data = await wilayahService.getDistricts(selectedRegId);
        if (mounted) {
          setDistricts(data);
          if (!data.some((d) => d.id === selectedDistId)) {
            setSelectedDistId('');
            setSelectedVillId('');
          }
        }
      } catch {
        if (mounted) setDistricts([]);
      } finally {
        if (mounted) setLoadingDistricts(false);
      }
    }
    loadDist();
    return () => {
      mounted = false;
    };
  }, [selectedRegId]);

  // When district changes, load villages
  useEffect(() => {
    if (!selectedDistId) {
      setVillages([]);
      return;
    }

    let mounted = true;
    async function loadVill() {
      setLoadingVillages(true);
      try {
        const data = await wilayahService.getVillages(selectedDistId);
        if (mounted) {
          setVillages(data);
          if (!data.some((v) => v.id === selectedVillId)) {
            setSelectedVillId('');
          }
        }
      } catch {
        if (mounted) setVillages([]);
      } finally {
        if (mounted) setLoadingVillages(false);
      }
    }
    loadVill();
    return () => {
      mounted = false;
    };
  }, [selectedDistId]);

  // Selected names resolved
  const activeProvName = useMemo(() => {
    const found = provinces.find((p) => p.id === selectedProvId);
    return found ? wilayahService.toTitleCase(found.name) : 'Banten';
  }, [provinces, selectedProvId]);

  const activeRegName = useMemo(() => {
    const found = regencies.find((r) => r.id === selectedRegId);
    return found ? wilayahService.toTitleCase(found.name) : 'Kota Tangerang Selatan';
  }, [regencies, selectedRegId]);

  const activeDistName = useMemo(() => {
    const found = districts.find((d) => d.id === selectedDistId);
    return found ? wilayahService.toTitleCase(found.name) : '';
  }, [districts, selectedDistId]);

  const activeVillName = useMemo(() => {
    const found = villages.find((v) => v.id === selectedVillId);
    return found ? wilayahService.toTitleCase(found.name) : '';
  }, [villages, selectedVillId]);

  // Filtered lists by search query
  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return provinces;
    const q = searchQuery.toLowerCase();
    return provinces.filter((p) => p.name.toLowerCase().includes(q));
  }, [provinces, searchQuery]);

  const filteredRegencies = useMemo(() => {
    if (!searchQuery.trim()) return regencies;
    const q = searchQuery.toLowerCase();
    return regencies.filter((r) => r.name.toLowerCase().includes(q));
  }, [regencies, searchQuery]);

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return districts;
    const q = searchQuery.toLowerCase();
    return districts.filter((d) => d.name.toLowerCase().includes(q));
  }, [districts, searchQuery]);

  if (!isOpen) return null;

  // Handle GPS Auto-detect
  const handleUseGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Perangkat Anda tidak mendukung fitur geolokasi GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Attempt reverse geocode via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
          );

          let detectedCity = 'Kota Tangerang Selatan';
          let detectedState = 'Banten';
          let detectedDistrict = '';

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            detectedCity = addr.city || addr.town || addr.municipality || addr.county || 'Kota Tangerang Selatan';
            detectedState = addr.state || 'Banten';
            detectedDistrict = addr.suburb || addr.district || '';
          }

          // Match province
          const matchedProv = provinces.find((p) =>
            p.name.toLowerCase().includes(detectedState.toLowerCase()) ||
            detectedState.toLowerCase().includes(p.name.toLowerCase())
          );

          if (matchedProv) {
            setSelectedProvId(matchedProv.id);
          }

          const resolvedCoords = wilayahService.resolveCoordinates(
            matchedProv ? matchedProv.id : '36',
            '3674',
            { lat, lng }
          );

          const finalLoc: ActiveLocation = {
            provinceId: matchedProv ? matchedProv.id : '36',
            provinceName: detectedState,
            regencyId: 'gps',
            regencyName: detectedCity,
            districtName: detectedDistrict || undefined,
            displayName: detectedDistrict ? `Kec. ${detectedDistrict}, ${detectedCity}` : `${detectedCity}, ${detectedState}`,
            latitude: lat,
            longitude: lng,
            timezone: resolvedCoords.tz,
            timezoneIana: resolvedCoords.iana,
            isGps: true
          };

          saveActiveLocation(finalLoc);
          if (onLocationSelected) onLocationSelected(finalLoc);
          setGpsSuccess(`Lokasi GPS terdeteksi: ${finalLoc.displayName}`);
          setTimeout(() => {
            onClose();
          }, 1200);
        } catch {
          // Fallback coordinate save
          const finalLoc: ActiveLocation = {
            provinceId: '36',
            provinceName: 'Banten',
            regencyId: '3674',
            regencyName: 'Koordinat GPS Saya',
            displayName: `GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
            latitude: lat,
            longitude: lng,
            timezone: 7,
            timezoneIana: 'Asia/Jakarta',
            isGps: true
          };
          saveActiveLocation(finalLoc);
          if (onLocationSelected) onLocationSelected(finalLoc);
          setGpsSuccess(`Lokasi koordinat GPS (${lat.toFixed(3)}, ${lng.toFixed(3)}) berhasil disimpan!`);
          setTimeout(() => onClose(), 1200);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Izin akses lokasi GPS ditolak oleh browser. Anda dapat memilih wilayah secara manual di bawah.');
        } else if (err.code === 2) {
          setGpsError('Sinyal GPS tidak dapat ditemukan. Pastikan layanan lokasi di perangkat Anda aktif.');
        } else {
          setGpsError('Waktu pencarian GPS habis. Silakan pilih wilayah secara manual.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Confirm manual selection
  const handleSaveLocation = () => {
    const coords = wilayahService.resolveCoordinates(selectedProvId, selectedRegId);

    const displayName = activeDistName
      ? `Kec. ${activeDistName}, ${activeRegName}`
      : `${activeRegName}, ${activeProvName}`;

    const newLoc: ActiveLocation = {
      provinceId: selectedProvId,
      provinceName: activeProvName,
      regencyId: selectedRegId,
      regencyName: activeRegName,
      districtId: selectedDistId || undefined,
      districtName: activeDistName || undefined,
      villageId: selectedVillId || undefined,
      villageName: activeVillName || undefined,
      displayName,
      latitude: coords.lat,
      longitude: coords.lng,
      timezone: coords.tz,
      timezoneIana: coords.iana,
      isGps: false
    };

    saveActiveLocation(newLoc);
    if (onLocationSelected) onLocationSelected(newLoc);
    onClose();
  };

  // Quick select Banten 8 regencies
  const handleQuickSelectBanten = (regId: string) => {
    setSelectedProvId('36');
    setSelectedRegId(regId);
    setSelectedDistId('');
    setSelectedVillId('');
    setStep(3); // jump to districts
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white border border-[#EAEAEA] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-[#222222]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base sm:text-lg font-bold text-[#222222]">
                Pilih Wilayah Anda
              </h2>
              <p className="text-xs text-[#737373]">
                Seluruh 38 Provinsi di Indonesia • Akurasi Jadwal Salat & Kiblat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#EAEAEA] flex items-center justify-center transition"
            aria-label="Tutup pemilihan wilayah"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-5 py-2.5 bg-[#F8F8F8] border-b border-[#EAEAEA] flex items-center justify-between text-xs text-[#737373] shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="font-semibold text-[#222222]">Indonesia</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C49A3A]" />
            <button
              onClick={() => setStep(1)}
              className={`hover:underline font-semibold ${step === 1 ? 'text-[#C49A3A]' : 'text-[#737373]'}`}
            >
              {activeProvName || 'Provinsi'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C49A3A]" />
            <button
              onClick={() => setStep(2)}
              className={`hover:underline font-semibold ${step === 2 ? 'text-[#C49A3A]' : 'text-[#737373]'}`}
            >
              {activeRegName || 'Kab/Kota'}
            </button>
            {activeDistName && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#C49A3A]" />
                <button
                  onClick={() => setStep(3)}
                  className={`hover:underline font-semibold ${step === 3 ? 'text-[#C49A3A]' : 'text-[#737373]'}`}
                >
                  Kec. {activeDistName}
                </button>
              </>
            )}
          </div>

          <span className="text-[11px] font-mono text-[#C49A3A] font-bold shrink-0 ml-2">
            Langkah {step}/3
          </span>
        </div>

        {/* GPS Quick Action Bar */}
        <div className="p-4 border-b border-[#EAEAEA] bg-white space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              onClick={handleUseGPS}
              disabled={gpsLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF3DF] hover:bg-[#C49A3A] text-[#C49A3A] hover:text-white border border-[#E5BD58] text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <div className="w-5 h-5 rounded-md bg-white border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
                {gpsLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
              </div>
              <span>{gpsLoading ? 'Mendeteksi Koordinat GPS...' : 'Gunakan Lokasi Saya (GPS Otomatis)'}</span>
            </button>

            {step > 1 && (
              <button
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8F8F8] border border-[#EAEAEA] text-xs font-semibold text-[#737373] hover:text-[#222222] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            )}
          </div>

          {gpsSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{gpsSuccess}</span>
            </div>
          )}

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative pt-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-[#FAF3DF] text-[#C49A3A] flex items-center justify-center pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                step === 1
                  ? 'Cari nama provinsi (misal: Jawa Barat, Banten, Aceh)...'
                  : step === 2
                  ? `Cari kabupaten/kota di ${activeProvName}...`
                  : `Cari kecamatan di ${activeRegName}...`
              }
              className="w-full bg-[#FFFFFF] border border-[#EAEAEA] focus:border-[#C49A3A] focus:ring-2 focus:ring-[#FAF3DF] rounded-xl pl-11 pr-4 py-2 text-xs text-[#222222] placeholder:text-[#999999] focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Modal Scrollable Content based on Step */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* STEP 1: Pilih Provinsi */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
                  Pilih Provinsi ({filteredProvinces.length} Tersedia)
                </span>
                <span className="text-[11px] text-[#C49A3A]">Klik untuk melihat Kabupaten/Kota</span>
              </div>

              {/* Banten Quick Access Chips */}
              <div className="p-3 bg-[#FAF3DF]/60 border border-[#E5BD58]/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C49A3A]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Akses Cepat 8 Wilayah Banten:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {FALLBACK_BANTEN_REGENCIES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleQuickSelectBanten(r.id)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left truncate transition ${
                        selectedRegId === r.id && selectedProvId === '36'
                          ? 'bg-[#C49A3A] text-white border-[#C49A3A]'
                          : 'bg-white hover:bg-[#FAF3DF] text-[#222222] border-[#EAEAEA]'
                      }`}
                    >
                      {wilayahService.toTitleCase(r.name).replace('Kabupaten', 'Kab.').replace('Kota', 'Kota')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Province Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProvinces.map((p) => {
                  const isSelected = selectedProvId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProvId(p.id);
                        setStep(2); // advance to regencies
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A]'
                          : 'bg-white border-[#EAEAEA] hover:border-[#E5BD58] text-[#222222]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isSelected ? 'bg-[#C49A3A] text-white' : 'bg-[#F8F8F8] text-[#737373] border border-[#EAEAEA]'
                        }`}>
                          {p.id}
                        </div>
                        <span className="text-xs font-semibold">{wilayahService.toTitleCase(p.name)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#737373]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Pilih Kabupaten / Kota */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
                  Kabupaten & Kota di {activeProvName} ({filteredRegencies.length})
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#C49A3A] hover:underline font-semibold"
                >
                  Ganti Provinsi &rarr;
                </button>
              </div>

              {loadingRegencies ? (
                <div className="py-12 text-center text-xs text-[#737373] space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#C49A3A] animate-spin mx-auto" />
                  <p>Memuat daftar kabupaten dan kota...</p>
                </div>
              ) : filteredRegencies.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#EAEAEA] rounded-2xl text-xs text-[#737373]">
                  Tidak ada kabupaten/kota yang sesuai pencarian.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredRegencies.map((r) => {
                    const isSelected = selectedRegId === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRegId(r.id);
                          setStep(3); // advance to districts
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A]'
                            : 'bg-white border-[#EAEAEA] hover:border-[#E5BD58] text-[#222222]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                            isSelected ? 'bg-[#C49A3A] text-white' : 'bg-[#F8F8F8] text-[#737373] border border-[#EAEAEA]'
                          }`}>
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold">{wilayahService.toTitleCase(r.name)}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#737373]" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pilih Kecamatan (Opsional jika tersedia) */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
                    Kecamatan di {activeRegName}
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    Pilih kecamatan untuk akurasi ekstra, atau langsung simpan tingkat kota.
                  </span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#C49A3A] hover:underline font-semibold shrink-0"
                >
                  Ganti Kota
                </button>
              </div>

              {loadingDistricts ? (
                <div className="py-12 text-center text-xs text-[#737373] space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#C49A3A] animate-spin mx-auto" />
                  <p>Memuat daftar kecamatan...</p>
                </div>
              ) : filteredDistricts.length === 0 ? (
                <div className="p-6 text-center bg-[#F8F8F8] border border-[#EAEAEA] rounded-2xl text-xs text-[#737373] space-y-2">
                  <p>Kecamatan siap menggunakan koordinat resmi {activeRegName}.</p>
                  <button
                    onClick={handleSaveLocation}
                    className="px-4 py-2 bg-[#C49A3A] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Gunakan Lokasi Ini
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredDistricts.map((d) => {
                    const isSelected = selectedDistId === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDistId(isSelected ? '' : d.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A] shadow-2xs'
                            : 'bg-white border-[#EAEAEA] hover:border-[#E5BD58] text-[#222222]'
                        }`}
                      >
                        <span className="text-xs font-semibold truncate">{wilayahService.toTitleCase(d.name)}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C49A3A] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Selected Location Summary & Save Button */}
        <div className="p-4 sm:p-5 border-t border-[#EAEAEA] bg-[#F8F8F8] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#737373]">Lokasi Terpilih:</p>
              <p className="text-xs font-bold text-[#222222] truncate">
                {activeDistName ? `Kec. ${activeDistName}, ` : ''}{activeRegName}, {activeProvName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-xs font-semibold text-[#737373] hover:text-[#222222] transition"
            >
              Batal
            </button>
            <button
              onClick={handleSaveLocation}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Lokasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
