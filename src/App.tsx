import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SurahListPage } from './pages/SurahListPage';
import { QuranReaderPage } from './pages/QuranReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarkPage } from './pages/BookmarkPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { QiblaPage } from './pages/QiblaPage';
import { DoaPage } from './pages/DoaPage';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AdzanAlertModal } from './components/AdzanAlertModal';
import { DuaDhikrModal } from './components/DuaDhikrModal';
import { LocationModal } from './components/LocationModal';
import { quranApi } from './services/quranApi';
import { prayerTimeService, LocationInfo } from './services/prayerTimeService';
import { audioManager, ActiveAudioAlert } from './services/audioManager';
import { prayerScheduler } from './services/prayerScheduler';
import { getActiveLocation, saveActiveLocation, ActiveLocation } from './services/wilayahService';
import { SurahListItem } from './types/quran';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeSurahNomor, setActiveSurahNomor] = useState<number | null>(null);
  const [targetAyahNomor, setTargetAyahNomor] = useState<number | undefined>(undefined);

  // Global modals & Audio Alert
  const [activeAlert, setActiveAlert] = useState<ActiveAudioAlert | null>(null);
  const [isDuaModalOpen, setIsDuaModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Surah list cache
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState<boolean>(true);
  const [errorSurahs, setErrorSurahs] = useState<string | null>(null);

  // Load 114 surahs on initial mount
  const fetchSurahList = async () => {
    setLoadingSurahs(true);
    setErrorSurahs(null);
    try {
      const data = await quranApi.getAllSurahs();
      setSurahs(data);
    } catch (err: unknown) {
      setErrorSurahs(err instanceof Error ? err.message : 'Gagal memuat daftar 114 surat Al-Qur\'an.');
    } finally {
      setLoadingSurahs(false);
    }
  };

  useEffect(() => {
    fetchSurahList();

    // Subscribe to unified AudioManager
    const unsubscribeAudio = audioManager.subscribe((alert) => {
      setActiveAlert(alert);
    });

    // Initial sync for scheduler with saved region
    try {
      const loc = getActiveLocation();
      const locInfo: LocationInfo = {
        name: loc.regencyName,
        province: loc.provinceName,
        country: 'Indonesia',
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone
      };
      const pt = prayerTimeService.calculatePrayerTimes(locInfo, new Date());
      prayerScheduler.sync(locInfo, pt);
    } catch {
      // Safe fail
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration failed:', err);
        });
      });
    }

    return () => {
      unsubscribeAudio();
      prayerScheduler.stop();
    };
  }, []);

  const handleLocationSelected = (location: ActiveLocation) => {
    saveActiveLocation(location);
    const locInfo: LocationInfo = {
      name: location.regencyName,
      province: location.provinceName,
      country: 'Indonesia',
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone
    };
    const pt = prayerTimeService.calculatePrayerTimes(locInfo, new Date());
    prayerScheduler.sync(locInfo, pt);
    setIsLocationModalOpen(false);
  };

  // Navigation handlers
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab !== 'quran') {
      setActiveSurahNomor(null);
      setTargetAyahNomor(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSurah = (nomor: number, ayah?: number) => {
    setActiveSurahNomor(nomor);
    setTargetAyahNomor(ayah);
    setCurrentTab('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSurahList = () => {
    setActiveSurahNomor(null);
    setTargetAyahNomor(undefined);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#222222] flex flex-col selection:bg-[#FAF3DF] selection:text-[#C49A3A] transition-colors duration-150">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Navigation Bar (Desktop Left Sidebar + Mobile Bottom Nav) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenSearch={() => handleSelectTab('search')}
      />

      {/* Main Content Area (Offset for Desktop Left Sidebar lg:ml-64) */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 pb-28 landscape:pb-24 lg:pb-16 min-h-0">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={(tab, surah, ayah) => {
                if (surah) {
                  handleOpenSurah(surah, ayah);
                } else {
                  handleSelectTab(tab);
                }
              }}
              onOpenAudioSurah={(surah) => handleOpenSurah(surah)}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
            />
          )}

          {currentTab === 'quran' && (
            <>
              {activeSurahNomor ? (
                <QuranReaderPage
                  surahNomor={activeSurahNomor}
                  initialAyah={targetAyahNomor}
                  onBack={handleBackToSurahList}
                  onSelectSurah={(nextSurah, nextAyah) => handleOpenSurah(nextSurah, nextAyah)}
                />
              ) : (
                <SurahListPage
                  surahs={surahs}
                  loading={loadingSurahs}
                  error={errorSurahs}
                  onRetry={fetchSurahList}
                  onSelectSurah={(nomor) => handleOpenSurah(nomor)}
                />
              )}
            </>
          )}

          {currentTab === 'sholat' && (
            <PrayerTimesPage
              onOpenQibla={() => handleSelectTab('kiblat')}
              onOpenDua={() => handleSelectTab('doa')}
            />
          )}

          {currentTab === 'kiblat' && (
            <QiblaPage
              onOpenPrayerTimes={() => handleSelectTab('sholat')}
            />
          )}

          {currentTab === 'doa' && (
            <DoaPage />
          )}

          {currentTab === 'search' && (
            <SearchPage
              surahs={surahs}
              onSelectResult={(surahNomor, ayahNomor) => handleOpenSurah(surahNomor, ayahNomor)}
            />
          )}

          {currentTab === 'bookmark' && (
            <BookmarkPage
              onNavigateToAyah={(surahNomor, ayahNomor) => handleOpenSurah(surahNomor, ayahNomor)}
            />
          )}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Fixed Sticky Audio Player Bar (Offset on desktop for sidebar) */}
      <AudioPlayerBar />

      {/* Global Adzan / Prayer Reminder Alert Modal */}
      {activeAlert && (
        <AdzanAlertModal
          alert={activeAlert}
          onClose={() => audioManager.stopAudio()}
        />
      )}

      {/* Global Dua & Dhikr Modal */}
      <DuaDhikrModal
        isOpen={isDuaModalOpen}
        onClose={() => setIsDuaModalOpen(false)}
      />

      {/* Global Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelected={handleLocationSelected}
      />
    </div>
  );
}
