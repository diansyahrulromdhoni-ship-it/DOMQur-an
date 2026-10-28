import React, { useState, useMemo } from 'react';
import {
  MapPin,
  X,
  Search,
  LocateFixed,
  Check,
  ChevronRight,
  AlertCircle,
  Building2,
  RefreshCw
} from 'lucide-react';
import {
  INDONESIA_REGIONS,
  RegencyCity,
  ProvinceData,
  saveLocation,
  getSavedLocation
} from '../services/indonesiaRegions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: RegencyCity & { province: string; district?: string }) => void;
}

export const LocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLocationSelected
}) => {
  const currentLocation = getSavedLocation();

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(() => {
    const found = INDONESIA_REGIONS.find((p) => p.name.toLowerCase() === (currentLocation.province || '').toLowerCase());
    return found ? found.id : 'banten';
  });

  const [selectedCityName, setSelectedCityName] = useState<string>(currentLocation.name);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentLocation.district || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const selectedProvince = useMemo(() => {
    return INDONESIA_REGIONS.find((p) => p.id === selectedProvinceId) || INDONESIA_REGIONS[0];
  }, [selectedProvinceId]);

  const selectedCity = useMemo(() => {
    return selectedProvince.cities.find((c) => c.name === selectedCityName) || selectedProvince.cities[0];
  }, [selectedProvince, selectedCityName]);

  // Filtered search results across all regions
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      province: ProvinceData;
      city: RegencyCity;
      district?: string;
      displayName: string;
    }> = [];

    for (const prov of INDONESIA_REGIONS) {
      for (const city of prov.cities) {
        // Match city or province
        if (city.name.toLowerCase().includes(q) || prov.name.toLowerCase().includes(q)) {
          results.push({
            province: prov,
            city,
            displayName: `${city.name}, ${prov.name}`
          });
        }
        // Match districts
        if (city.districts) {
          for (const d of city.districts) {
            if (d.toLowerCase().includes(q)) {
              results.push({
                province: prov,
                city,
                district: d,
                displayName: `Kec. ${d}, ${city.name} (${prov.name})`
              });
            }
          }
        }
      }
    }
    return results.slice(0, 30);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleApply = (
    city: RegencyCity,
    provName: string,
    dist?: string
  ) => {
    const fullLoc = {
      ...city,
      province: provName,
      district: dist || undefined
    };
    saveLocation(fullLoc);
    onLocationSelected(fullLoc);
    onClose();
  };

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const tz = Math.round(-new Date().getTimezoneOffset() / 60);

        // Find closest city in database
        let bestCity: RegencyCity | null = null;
        let bestProv: ProvinceData = INDONESIA_REGIONS[0];
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

        setGpsLoading(false);
        handleApply(detected, detected.province);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Izin akses lokasi ditolak oleh browser. Silakan pilih provinsi dan kota secara manual.');
        } else {
          setGpsError('Gagal mendeteksi koordinat GPS. Pastikan GPS aktif atau pilih kota di bawah.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white border border-[#EAEAEA] rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EAEAEA] bg-[#F8F8F8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base font-extrabold text-[#222222]">
                Pilih Lokasi & Wilayah
              </h2>
              <p className="text-xs text-[#737373]">
                Seluruh wilayah Indonesia termasuk 8 Kabupaten/Kota di Banten
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] text-[#737373] hover:text-[#222222] hover:bg-[#F1F1F1] flex items-center justify-center transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* GPS Quick Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8F8F8] border border-[#EAEAEA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A] shrink-0">
                <LocateFixed className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#222222] block">Deteksi Otomatis via GPS</span>
                <span className="text-[#737373]">Gunakan koordinat presisi perangkat Anda</span>
              </div>
            </div>

            <button
              onClick={handleGPSDetect}
              disabled={gpsLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              {gpsLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              <span>{gpsLoading ? 'Mendeteksi...' : 'Gunakan GPS'}</span>
            </button>
          </div>

          {gpsError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#F8F8F8] border border-[#EAEAEA] flex items-center justify-center text-[#737373] pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari provinsi, kota, atau kecamatan (contoh: Lebak, Serang, Ciputat)..."
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] focus:bg-white rounded-2xl pl-12 pr-4 py-3 text-xs sm:text-sm text-[#222222] placeholder:text-[#999] focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#737373] hover:text-[#222222]"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Search Results if search query is present */}
          {searchQuery ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
                Hasil Pencarian ({searchResults.length})
              </span>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#737373]">
                  Tidak ditemukan wilayah dengan nama "{searchQuery}". Silakan coba kata kunci lain.
                </div>
              ) : (
                <div className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] rounded-2xl max-h-60 overflow-y-auto bg-white">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApply(item.city, item.province.name, item.district)}
                      className="w-full p-3 text-left hover:bg-[#FAF3DF]/60 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#F8F8F8] group-hover:bg-[#FAF3DF] border border-[#EAEAEA] flex items-center justify-center text-[#C49A3A]">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#222222] group-hover:text-[#C49A3A]">
                            {item.displayName}
                          </p>
                          <p className="text-[10px] text-[#737373]">
                            UTC+{item.province.timezone} • Lat: {item.city.latitude}, Lng: {item.city.longitude}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B8B8B8] group-hover:text-[#C49A3A]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Special Banten Quick Access Row */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FAF3DF] border border-[#E5BD58]/40 flex items-center justify-center text-[#C49A3A]">
                      <Building2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-[#222222]">
                      Wilayah Banten Lengkap (8 Daerah)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#C49A3A] bg-[#FAF3DF] px-2 py-0.5 rounded-full">
                    Akses Cepat
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INDONESIA_REGIONS.find((p) => p.id === 'banten')?.cities.map((bCity) => {
                    const isCurrent = currentLocation.name === bCity.name;
                    return (
                      <button
                        key={bCity.name}
                        onClick={() => {
                          setSelectedProvinceId('banten');
                          setSelectedCityName(bCity.name);
                          setSelectedDistrict(bCity.districts ? bCity.districts[0] : '');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          selectedCityName === bCity.name && selectedProvinceId === 'banten'
                            ? 'bg-[#FAF3DF] border-[#C49A3A] text-[#C49A3A] font-bold shadow-xs'
                            : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#222222] hover:border-[#C49A3A]/40'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="text-xs block truncate">{bCity.name}</span>
                          <span className="text-[10px] text-[#737373] block truncate">
                            {bCity.type === 'Kota' ? 'Kota' : 'Kab.'}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="w-4 h-4 rounded-full bg-[#21865B] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cascading Dropdowns: Provinsi -> Kabupaten/Kota -> Kecamatan */}
              <div className="space-y-3.5 pt-2 border-t border-[#EAEAEA]">
                <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
                  Pilih Berdasarkan Hirarki Wilayah
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Provinsi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#222222] block">
                      1. Provinsi
                    </label>
                    <select
                      value={selectedProvinceId}
                      onChange={(e) => {
                        const newProvId = e.target.value;
                        setSelectedProvinceId(newProvId);
                        const prov = INDONESIA_REGIONS.find((p) => p.id === newProvId);
                        if (prov && prov.cities.length > 0) {
                          setSelectedCityName(prov.cities[0].name);
                          setSelectedDistrict(prov.cities[0].districts ? prov.cities[0].districts[0] : '');
                        }
                      }}
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] rounded-xl px-3 py-2 text-xs font-semibold text-[#222222] focus:outline-none cursor-pointer"
                    >
                      {INDONESIA_REGIONS.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name} (UTC+{prov.timezone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Kabupaten / Kota */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#222222] block">
                      2. Kabupaten / Kota
                    </label>
                    <select
                      value={selectedCityName}
                      onChange={(e) => {
                        const cityName = e.target.value;
                        setSelectedCityName(cityName);
                        const city = selectedProvince.cities.find((c) => c.name === cityName);
                        if (city && city.districts && city.districts.length > 0) {
                          setSelectedDistrict(city.districts[0]);
                        } else {
                          setSelectedDistrict('');
                        }
                      }}
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] rounded-xl px-3 py-2 text-xs font-semibold text-[#222222] focus:outline-none cursor-pointer"
                    >
                      {selectedProvince.cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Kecamatan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#222222] block">
                      3. Kecamatan {selectedCity?.districts ? `(${selectedCity.districts.length})` : ''}
                    </label>
                    {selectedCity?.districts && selectedCity.districts.length > 0 ? (
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] focus:border-[#C49A3A] rounded-xl px-3 py-2 text-xs font-semibold text-[#222222] focus:outline-none cursor-pointer"
                      >
                        {selectedCity.districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[11px] text-[#737373] bg-[#F8F8F8] border border-[#EAEAEA] rounded-xl px-3 py-2 italic">
                        Kecamatan mengacu pada pusat kota
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Location Details Card */}
                <div className="p-3.5 rounded-2xl bg-[#FAF3DF]/60 border border-[#E5BD58]/50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#222222]">
                      <MapPin className="w-3.5 h-3.5 text-[#C49A3A]" />
                      <span>
                        {selectedDistrict ? `Kec. ${selectedDistrict}, ` : ''}{selectedCity.name}, {selectedProvince.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Zona: UTC+{selectedProvince.timezone} ({selectedCity.timezoneIana}) • Koordinat: {selectedCity.latitude}, {selectedCity.longitude}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApply(selectedCity, selectedProvince.name, selectedDistrict)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold rounded-xl transition shadow-sm shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Pilih Lokasi Ini</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#EAEAEA] bg-[#F8F8F8] flex items-center justify-between text-xs">
          <span className="text-[#737373]">
            Lokasi saat ini: <strong className="text-[#222222]">{currentLocation.district ? `${currentLocation.district}, ` : ''}{currentLocation.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#EAEAEA] hover:bg-[#F1F1F1] text-[#222222] font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
