import React, { useState, useEffect } from 'react';
import {
  Settings,
  Type,
  Headphones,
  RotateCcw,
  Check,
  Smartphone,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Square,
  AlertTriangle,
  Monitor,
  Laptop
} from 'lucide-react';
import { quranStorage, DEFAULT_SETTINGS } from '../storage/quranStorage';
import { UserSettings } from '../types/quran';
import { RECITERS } from '../config';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  audioManager,
  AudioSettings,
  PrayerEventType,
  DEFAULT_AUDIO_SETTINGS
} from '../services/audioManager';
import { notificationService } from '../services/notificationService';
import { AUDIO_TEST_PRESETS } from '../config/audioConfig';

export const SettingsPage: React.FC = () => {
  // Quran reader settings
  const [quranSettings, setQuranSettings] = useState<UserSettings>(quranStorage.getSettings());
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Audio & Notification settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(audioManager.getSettings());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(audioManager.getIsUnlocked());
  const [activeAlert, setActiveAlert] = useState(audioManager.getActiveAlert());

  useEffect(() => {
    const unsub = audioManager.subscribe((alert) => {
      setActiveAlert(alert);
      setIsAudioUnlocked(audioManager.getIsUnlocked());
    });
    return unsub;
  }, []);

  const showNotice = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const updateQuranSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...quranSettings, [key]: value };
    setQuranSettings(updated);
    quranStorage.saveSettings(updated);
    showNotice();
  };

  const updateAudioSetting = (partial: Partial<AudioSettings>) => {
    const updated = { ...audioSettings, ...partial };
    setAudioSettings(updated);
    audioManager.saveSettings(updated);
    showNotice();
  };

  const handleToggleEvent = (key: PrayerEventType) => {
    const updatedToggles = {
      ...audioSettings.eventToggles,
      [key]: !audioSettings.eventToggles[key]
    };
    updateAudioSetting({ eventToggles: updatedToggles });
  };

  const handleRequestNotifPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(notificationService.getPermission());
    updateAudioSetting({ notificationsEnabled: granted });
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua preferensi Al-Qur\'an dan Audio ke standar awal?')) {
      const resetQuran = quranStorage.resetSettings();
      setQuranSettings(resetQuran);
      audioManager.saveSettings(DEFAULT_AUDIO_SETTINGS);
      setAudioSettings(DEFAULT_AUDIO_SETTINGS);
      showNotice();
    }
  };

  const eventLabels: { key: PrayerEventType; label: string; desc: string }[] = [
    { key: 'imsak', label: 'Pengingat Imsak', desc: '10 menit sebelum waktu Subuh untuk bersiap puasa' },
    { key: 'subuh', label: 'Adzan Subuh', desc: 'Lantunan adzan khusus Subuh (Ash-shalatu khairum minan naum)' },
    { key: 'terbit', label: 'Terbit Matahari (Syuruq)', desc: 'Suara alami ayam berkokok menandai fajar berakhir' },
    { key: 'dzuhur', label: 'Adzan Dzuhur', desc: 'Lantunan adzan berkumandang merdu' },
    { key: 'ashar', label: 'Adzan Ashar', desc: 'Lantunan adzan berkumandang merdu' },
    { key: 'maghrib', label: 'Adzan Maghrib', desc: 'Lantunan adzan tanda masuknya waktu maghrib & berbuka' },
    { key: 'isya', label: 'Adzan Isya', desc: 'Lantunan adzan waktu isya dan qiyamul lail' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A] shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
              Pengaturan Aplikasi
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Kelola suara adzan, notifikasi salat, preferensi mushaf, serta integrasi PWA
            </p>
          </div>
        </div>

        {saveToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF3DF] text-[#C49A3A] border border-[#E5BD58] text-xs font-bold rounded-xl animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>Tersimpan</span>
          </div>
        )}
      </div>

      {/* 1. Pengaturan Audio Pengingat & Suara Adzan */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#222222]">Audio Pengingat & Suara Adzan</h2>
              <p className="text-xs text-[#737373]">Aktifkan audio otomatis saat memasuki waktu salat</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-[#F8F8F8] px-3 py-1.5 rounded-xl border border-[#EAEAEA]">
            <span className="text-xs text-[#222222] font-semibold">
              {audioSettings.soundEnabled ? 'Aktif' : 'Nonaktif'}
            </span>
            <input
              type="checkbox"
              checked={audioSettings.soundEnabled}
              onChange={(e) => updateAudioSetting({ soundEnabled: e.target.checked })}
              className="accent-[#C49A3A] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Browser Autoplay State Indicator */}
        <div className="p-4 bg-[#F8F8F8] border border-[#EAEAEA] rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isAudioUnlocked ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[#555555]">
              Status Izin Audio Browser: <strong className="text-[#222222]">{isAudioUnlocked ? 'Terbuka (Siap Putar)' : 'Terkunci (Perlu Klik Sekali)'}</strong>
            </span>
          </div>
          {!isAudioUnlocked && (
            <button
              onClick={() => {
                audioManager.unlockAudio();
                setIsAudioUnlocked(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FAF3DF] text-[#C49A3A] border border-[#E5BD58] text-xs font-bold hover:bg-[#C49A3A] hover:text-white transition"
            >
              Buka Kunci Audio
            </button>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#222222] font-semibold">Volume Suara Pengingat & Adzan:</span>
            <span className="font-mono text-[#C49A3A] font-bold">{Math.round(audioSettings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioSettings.volume}
            onChange={(e) => updateAudioSetting({ volume: parseFloat(e.target.value) })}
            className="w-full h-2 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#C49A3A]"
          />
        </div>

        {/* Per-Event Toggles (Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya, Imsak) */}
        <div className="space-y-3 pt-2">
          <span className="text-xs text-[#737373] font-bold uppercase tracking-wider block">
            Pilihan Peristiwa Suara:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {eventLabels.map((item) => {
              const isEnabled = audioSettings.eventToggles[item.key];
              return (
                <label
                  key={item.key}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    isEnabled
                      ? 'bg-[#FAF3DF]/50 border-[#E5BD58] text-[#222222]'
                      : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-[#222222] flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        isEnabled ? 'bg-white border-[#E5BD58] text-[#C49A3A]' : 'bg-[#EAEAEA] border-[#D0D0D0] text-[#737373]'
                      }`}>
                        {isEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <p className="text-[11px] text-[#737373] pl-9">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleEvent(item.key)}
                    className="accent-[#C49A3A] w-4 h-4 shrink-0 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Test Audio Section */}
        <div className="pt-3 border-t border-[#EAEAEA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#737373] font-bold uppercase tracking-wider block">
              Uji Coba Suara (4 Saluran Audio Resmi):
            </span>
            {activeAlert && (
              <button
                onClick={() => audioManager.stopAudio()}
                className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Hentikan Suara</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {AUDIO_TEST_PRESETS.map((preset) => {
              const isPlaying = activeAlert?.isTest && activeAlert?.title.includes(preset.name) && activeAlert?.isPlaying;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (isPlaying) {
                      audioManager.stopAudio();
                    } else {
                      audioManager.playTestAudio(preset.id as any);
                    }
                  }}
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                    isPlaying
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-[#C49A3A] hover:bg-[#FAF3DF] border-[#EAEAEA] hover:border-[#E5BD58]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-rose-600 text-white' : 'bg-[#FAF3DF] text-[#C49A3A]'}`}>
                    {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  </div>
                  <span className="truncate">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Pengaturan Notifikasi Browser & PWA */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#222222]">Notifikasi Waktu Salat</h2>
              <p className="text-xs text-[#737373]">Pengingat pop-up saat waktu ibadah tiba</p>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase ${
            notifPermission === 'granted'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#F8F8F8] text-[#737373] border border-[#EAEAEA]'
          }`}>
            {notifPermission === 'granted' ? 'Diizinkan' : notifPermission === 'denied' ? 'Ditolak' : 'Belum Diminta'}
          </span>
        </div>

        <p className="text-xs text-[#737373] leading-relaxed">
          Notifikasi browser memunculkan pengingat visual saat waktu salat tiba ketika tab sedang aktif atau berjalan di latar belakang (background tab).
        </p>

        {notifPermission !== 'granted' ? (
          <button
            onClick={handleRequestNotifPermission}
            className="w-full py-3 rounded-xl bg-[#C49A3A] hover:bg-[#B3892B] text-white font-bold text-xs transition shadow-xs"
          >
            Aktifkan Izin Notifikasi Browser
          </button>
        ) : (
          <div className="flex items-center justify-between p-4 bg-[#F8F8F8] border border-[#EAEAEA] rounded-2xl text-xs">
            <span className="text-[#222222] font-semibold">Kirim Notifikasi saat Jadwal Tiba:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={audioSettings.notificationsEnabled}
                onChange={(e) => updateAudioSetting({ notificationsEnabled: e.target.checked })}
                className="accent-[#C49A3A] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        )}

        <div className="p-3.5 bg-[#FAF3DF]/60 border border-[#E5BD58]/30 rounded-2xl text-xs text-[#737373] space-y-1">
          <div className="flex items-center gap-1.5 text-[#C49A3A] font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Keterbatasan Lingkungan Browser:</span>
          </div>
          <p className="leading-relaxed">
            Jika tab browser ditutup oleh sistem operasi seluler (manajemen daya iOS/Android), timer audio browser akan ditahan oleh sistem. Untuk pengalaman terbaik, pasang aplikasi sebagai PWA ke layar utama.
          </p>
        </div>
      </section>

      {/* 3. Tipografi & Ukuran Teks Al-Qur'an */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-[#EAEAEA] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#222222]">Tipografi & Ukuran Teks Al-Qur'an</h2>
            <p className="text-xs text-[#737373]">Sesuaikan kenyamanan membaca ayat suci</p>
          </div>
        </div>

        {/* Arabic Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#222222] font-semibold">Ukuran Teks Arab:</span>
            <span className="font-mono text-[#C49A3A] font-bold">{quranSettings.arabicFontSize}px</span>
          </div>
          <input
            type="range"
            min={22}
            max={48}
            step={2}
            value={quranSettings.arabicFontSize}
            onChange={(e) => updateQuranSetting('arabicFontSize', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#C49A3A]"
          />
        </div>

        {/* Translation Font Size */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#222222] font-semibold">Ukuran Terjemahan Indonesia:</span>
            <span className="font-mono text-[#C49A3A] font-bold">{quranSettings.translationFontSize}px</span>
          </div>
          <input
            type="range"
            min={13}
            max={22}
            step={1}
            value={quranSettings.translationFontSize}
            onChange={(e) => updateQuranSetting('translationFontSize', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#EAEAEA] rounded-lg appearance-none cursor-pointer accent-[#C49A3A]"
          />
        </div>

        {/* Font Family */}
        <div className="pt-2">
          <label className="text-xs text-[#222222] font-bold block mb-2">Pilihan Jenis Huruf Arab:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'Amiri', name: 'Amiri (Mushaf Madinah Klasik)' },
              { id: 'Scheherazade New', name: 'Scheherazade New (Jelas & Luwes)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => updateQuranSetting('fontFamily', f.id as any)}
                className={`p-3.5 rounded-xl text-left border text-xs font-semibold transition flex items-center justify-between ${
                  quranSettings.fontFamily === f.id
                    ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A]'
                    : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373] hover:text-[#222222]'
                }`}
              >
                <span>{f.name}</span>
                {quranSettings.fontFamily === f.id && <Check className="w-4 h-4 text-[#C49A3A]" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Qari Murottal Favorit */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-[#EAEAEA] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#222222]">Qari Murottal Pilihan</h2>
            <p className="text-xs text-[#737373]">Pilih pelantun tilawah favorit Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {RECITERS.map((qari) => {
            const isSelected = quranSettings.selectedQari === qari.id;
            return (
              <button
                key={qari.id}
                onClick={() => updateQuranSetting('selectedQari', qari.id)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-[#FAF3DF] border-[#E5BD58] text-[#C49A3A]'
                    : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373] hover:text-[#222222]'
                }`}
              >
                <span>{qari.name}</span>
                {isSelected && <Check className="w-4 h-4 text-[#C49A3A]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Panduan PWA & Jalur Deployment Multi-Platform */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-[#EAEAEA] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#222222]">Akses Aplikasi di Seluruh Perangkat</h2>
            <p className="text-xs text-[#737373]">Gunakan My Dom Qur'an secara offline dan mandiri</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#555555] leading-relaxed">
          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#EAEAEA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#222222] flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span>1. Android & PWA</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-bold border border-[#E5BD58]/30">Instan / Offline</span>
            </div>
            <p className="text-[11px] text-[#737373] pl-9">
              Bisa dipasang langsung ke layar beranda HP melalui tombol "Pasang Aplikasi" di bawah.
            </p>
          </div>

          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#EAEAEA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#222222] flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <span>2. Apple iOS (iPhone & iPad)</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-bold border border-[#E5BD58]/30">Safari Share</span>
            </div>
            <p className="text-[11px] text-[#737373] pl-9">
              Buka di Safari &rarr; tekan tombol Bagikan (Share) &rarr; pilih <strong>"Tambahkan ke Layar Utama"</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#EAEAEA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#222222] flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF3DF] border border-[#E5BD58] flex items-center justify-center text-[#C49A3A]">
                  <Monitor className="w-3.5 h-3.5" />
                </div>
                <span>3. Desktop (Windows / macOS)</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FAF3DF] text-[#C49A3A] font-bold border border-[#E5BD58]/30">Chrome / Edge</span>
            </div>
            <p className="text-[11px] text-[#737373] pl-9">
              Klik ikon instalasi di kolom alamat URL browser untuk menjalankan seperti aplikasi komputer mandiri.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <PWAInstallButton />
        </div>
      </section>

      {/* 6. Tombol Reset */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan Semua Pengaturan ke Standar Awal</span>
        </button>
      </div>
    </div>
  );
};
