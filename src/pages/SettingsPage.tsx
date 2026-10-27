import React, { useState, useEffect } from 'react';
import {
  Settings,
  Type,
  Eye,
  Target,
  Headphones,
  RotateCcw,
  Check,
  ShieldCheck,
  Smartphone,
  Info,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Square,
  AlertTriangle,
  Monitor,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { quranStorage, DEFAULT_SETTINGS } from '../storage/quranStorage';
import { UserSettings } from '../types/quran';
import { RECITERS, APP_CONFIG } from '../config';
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
    if (confirm('Kembalikan semua pengaturan Al-Qur\'an dan Audio ke standar awal?')) {
      const resetQuran = quranStorage.resetSettings();
      setQuranSettings(resetQuran);
      audioManager.saveSettings(DEFAULT_AUDIO_SETTINGS);
      setAudioSettings(DEFAULT_AUDIO_SETTINGS);
      showNotice();
    }
  };

  const eventLabels: { key: PrayerEventType; label: string; desc: string }[] = [
    { key: 'imsak', label: 'Pengingat Imsak', desc: '10 menit sebelum adzan Subuh untuk bersiap puasa' },
    { key: 'subuh', label: 'Adzan Subuh', desc: 'Lantunan adzan khusus Subuh (Ash-shalatu khairum minan naum)' },
    { key: 'terbit', label: 'Terbit Matahari (Syuruq)', desc: 'Suara alami ayam berkokok menandai fajar berakhir' },
    { key: 'dzuhur', label: 'Adzan Dzuhur', desc: 'Lantunan adzan berkumandang merdu' },
    { key: 'ashar', label: 'Adzan Ashar', desc: 'Lantunan adzan berkumandang merdu' },
    { key: 'maghrib', label: 'Adzan Maghrib', desc: 'Lantunan adzan tanda masuknya waktu berbuka & maghrib' },
    { key: 'isya', label: 'Adzan Isya', desc: 'Lantunan adzan waktu isya dan qiyamul lail' }
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#262626] flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Pengaturan Aplikasi</span>
            <Settings className="w-5 h-5 text-[#F6C646]" />
          </h1>
          <p className="text-xs text-[#B8B8B8] mt-1">
            Konfigurasi audio adzan & pengingat, notifikasi, tilawah Qur'an, serta arsitektur deployment aplikasi.
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6C646] text-black text-xs font-bold rounded-xl animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>Tersimpan</span>
          </div>
        )}
      </div>

      {/* 1. Pengaturan Audio Pengingat & Suara Adzan */}
      <section className="bg-[#151515] border border-[#262626] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <h2>Audio Pengingat & Suara Adzan</h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-white font-semibold">
              {audioSettings.soundEnabled ? 'Aktif' : 'Nonaktif'}
            </span>
            <input
              type="checkbox"
              checked={audioSettings.soundEnabled}
              onChange={(e) => updateAudioSetting({ soundEnabled: e.target.checked })}
              className="accent-[#F6C646] w-4 h-4"
            />
          </label>
        </div>

        {/* Browser Autoplay State Indicator */}
        <div className="p-3 bg-black/50 border border-[#262626] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAudioUnlocked ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[#CCC]">
              Status Izin Audio Browser: <strong className="text-white">{isAudioUnlocked ? 'Terbuka (Siap Putar)' : 'Terkunci (Butuh Sentuhan)'}</strong>
            </span>
          </div>
          {!isAudioUnlocked && (
            <button
              onClick={() => {
                audioManager.unlockAudio();
                setIsAudioUnlocked(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F6C646] text-black text-[11px] font-bold"
            >
              Buka Kunci
            </button>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-white font-medium">Volume Suara Pengingat & Adzan:</span>
            <span className="font-mono text-[#F6C646] font-bold">{Math.round(audioSettings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioSettings.volume}
            onChange={(e) => updateAudioSetting({ volume: parseFloat(e.target.value) })}
            className="w-full accent-[#F6C646] cursor-pointer"
          />
        </div>

        {/* Per-Event Toggles (Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya, Imsak) */}
        <div className="space-y-2 pt-2">
          <span className="text-xs text-[#888] font-bold uppercase tracking-wider block">
            Pilihan Peristiwa Suara:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {eventLabels.map((item) => {
              const isEnabled = audioSettings.eventToggles[item.key];
              return (
                <label
                  key={item.key}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isEnabled
                      ? 'bg-black/60 border-[#F6C646]/30 text-white'
                      : 'bg-black/30 border-[#222] text-[#777]'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {isEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#F6C646]" /> : <VolumeX className="w-3.5 h-3.5 text-[#666]" />}
                      <span>{item.label}</span>
                    </div>
                    <p className="text-[10px] text-[#888]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleEvent(item.key)}
                    className="accent-[#F6C646] w-4 h-4 shrink-0"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Test Audio Section */}
        <div className="pt-3 border-t border-[#222] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#888] font-bold uppercase tracking-wider block">
              Uji Coba Suara (4 Saluran Audio Resmi):
            </span>
            {activeAlert && (
              <button
                onClick={() => audioManager.stopAudio()}
                className="text-xs text-red-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Hentikan</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    isPlaying
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-black/60 text-[#F6C646] hover:bg-[#F6C646] hover:text-black border-[#F6C646]/30'
                  }`}
                >
                  {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span className="truncate">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Pengaturan Notifikasi Browser & PWA */}
      <section className="bg-[#151515] border border-[#262626] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <h2>Notifikasi Waktu Salat</h2>
          </div>

          <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
            notifPermission === 'granted'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
              : 'bg-[#222] text-[#888]'
          }`}>
            {notifPermission === 'granted' ? 'Diizinkan' : notifPermission === 'denied' ? 'Ditolak' : 'Belum Diminta'}
          </span>
        </div>

        <p className="text-xs text-[#B8B8B8] leading-relaxed">
          Notifikasi browser memunculkan banner pengingat visual saat waktu salat tiba ketika tab sedang aktif atau berjalan di latar belakang (background tab).
        </p>

        {notifPermission !== 'granted' ? (
          <button
            onClick={handleRequestNotifPermission}
            className="w-full py-2.5 rounded-xl bg-[#F6C646] text-black font-bold text-xs hover:bg-[#FFD455] transition shadow-md"
          >
            Aktifkan Izin Notifikasi Browser
          </button>
        ) : (
          <div className="flex items-center justify-between p-3 bg-black/40 border border-[#222] rounded-xl text-xs">
            <span className="text-white font-medium">Kirim Notifikasi saat Jadwal Tiba:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={audioSettings.notificationsEnabled}
                onChange={(e) => updateAudioSetting({ notificationsEnabled: e.target.checked })}
                className="accent-[#F6C646] w-4 h-4"
              />
            </label>
          </div>
        )}

        <div className="p-3 bg-black/40 border border-[#262626] rounded-xl text-[11px] text-[#888] space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Keterbatasan Lingkungan Browser:</span>
          </div>
          <p>
            Jika browser atau aplikasi ditutup sepenuhnya oleh sistem operasi (terutama pada iOS/Android hemat daya), timer JavaScript di browser otomatis dihentikan oleh OS. Untuk pemutaran audio adzan saat aplikasi tertutup total, diperlukan integrasi aplikasi native atau background push notification.
          </p>
        </div>
      </section>

      {/* 3. Tipografi & Ukuran Teks Al-Qur'an */}
      <section className="bg-[#151515] border border-[#262626] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
          <Type className="w-4 h-4" />
          <h2>Tipografi & Ukuran Teks Al-Qur'an</h2>
        </div>

        {/* Arabic Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-white font-medium">Ukuran Teks Arab:</span>
            <span className="font-mono text-[#F6C646] font-bold">{quranSettings.arabicFontSize}px</span>
          </div>
          <input
            type="range"
            min={22}
            max={48}
            step={2}
            value={quranSettings.arabicFontSize}
            onChange={(e) => updateQuranSetting('arabicFontSize', parseInt(e.target.value, 10))}
            className="w-full accent-[#F6C646] cursor-pointer"
          />
        </div>

        {/* Translation Font Size */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-white font-medium">Ukuran Terjemahan Indonesia:</span>
            <span className="font-mono text-[#F6C646] font-bold">{quranSettings.translationFontSize}px</span>
          </div>
          <input
            type="range"
            min={13}
            max={22}
            step={1}
            value={quranSettings.translationFontSize}
            onChange={(e) => updateQuranSetting('translationFontSize', parseInt(e.target.value, 10))}
            className="w-full accent-[#F6C646] cursor-pointer"
          />
        </div>

        {/* Font Family */}
        <div className="pt-2">
          <label className="text-xs text-white font-medium block mb-2">Pilihan Jenis Huruf Arab:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Amiri', name: 'Amiri (Mushaf Madinah Klasik)' },
              { id: 'Scheherazade New', name: 'Scheherazade New (Jelas & Luwes)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => updateQuranSetting('fontFamily', f.id as any)}
                className={`p-3 rounded-xl text-left border text-xs font-semibold transition ${
                  quranSettings.fontFamily === f.id
                    ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                    : 'bg-black border-[#262626] text-[#CCC] hover:border-[#444]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Qari Murottal Favorit */}
      <section className="bg-[#151515] border border-[#262626] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
          <Headphones className="w-4 h-4" />
          <h2>Qari Murottal Favorit</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RECITERS.map((qari) => {
            const isSelected = quranSettings.selectedQari === qari.id;
            return (
              <button
                key={qari.id}
                onClick={() => updateQuranSetting('selectedQari', qari.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-[#1e1a0b] border-[#F6C646] text-[#F6C646]'
                    : 'bg-black border-[#262626] text-[#CCC] hover:border-[#444]'
                }`}
              >
                <span>{qari.name}</span>
                {isSelected && <Check className="w-4 h-4 text-[#F6C646]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Panduan PWA & Jalur Deployment Multi-Platform */}
      <section className="bg-[#151515] border border-[#262626] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F6C646] uppercase tracking-wider">
          <Smartphone className="w-4 h-4" />
          <h2>Arsitektur PWA & Jalur Rilis Toko Aplikasi</h2>
        </div>

        <div className="space-y-3 text-xs text-[#CCC] leading-relaxed">
          <div className="p-3.5 bg-black/60 rounded-xl border border-[#262626] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#F6C646]" />
                <span>1. Android (Google Play Store)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#FFD455]">TWA / Bubblewrap</span>
            </div>
            <p className="text-[11px] text-[#AAA]">
              Dapat dibundel menggunakan <strong>Trusted Web Activity (TWA)</strong> via Google Bubblewrap CLI untuk menghasilkan berkas AAB/APK bertandatangan (signed).
            </p>
          </div>

          <div className="p-3.5 bg-black/60 rounded-xl border border-[#262626] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-[#F6C646]" />
                <span>2. Apple iOS (App Store)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#FFD455]">Capacitor / WebKit</span>
            </div>
            <p className="text-[11px] text-[#AAA]">
              Dapat dibungkus dengan <strong>Capacitor</strong> untuk akses Xcode, izin sensor kompas (Motion & Orientation), dan background audio permissions.
            </p>
          </div>

          <div className="p-3.5 bg-black/60 rounded-xl border border-[#262626] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[#F6C646]" />
                <span>3. Desktop (Windows / macOS / Linux)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#FFD455]">PWA / Tauri / Electron</span>
            </div>
            <p className="text-[11px] text-[#AAA]">
              Dapat langsung dipasang melalui browser (Chrome/Edge/Safari) sebagai PWA mandiri atau diekspor ke Tauri/Electron.
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
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl border border-red-900/40 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan Semua Pengaturan ke Awal</span>
        </button>
      </div>
    </div>
  );
};
