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
import { quranApi } from './services/quranApi';
import { prayerTimeService, PRESET_LOCATIONS, LocationInfo } from './services/prayerTimeService';
import { audioManager, ActiveAudioAlert } from './services/audioManager';
import { prayerScheduler } from './services/prayerScheduler';
import { SurahListItem } from './types/quran';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeSurahNomor, setActiveSurahNomor] = useState<number | null>(null);
  const [targetAyahNomor, setTargetAyahNomor] = useState<number | undefined>(undefined);

  // Global modals & Audio Alert
  const [activeAlert, setActiveAlert] = useState<ActiveAudioAlert | null>(null);
  const [isDuaModalOpen, setIsDuaModalOpen] = useState<boolean>(false);

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

    // Initial sync for scheduler
    try {
      let loc: LocationInfo = PRESET_LOCATIONS[0];
      const saved = localStorage.getItem('aadom_saved_location');
      if (saved) {
        loc = JSON.parse(saved);
      }
      const pt = prayerTimeService.calculatePrayerTimes(loc, new Date());
      prayerScheduler.sync(loc, pt);
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
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-[#F6C646] selection:text-black">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Navigation Bar (Desktop Header + Mobile Bottom Nav for all 7 core features) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Area (Tailored for Portrait & Landscape Viewports) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 pb-28 landscape:pb-24 lg:pb-16 min-h-0">
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

      {/* Fixed Sticky Audio Player Bar */}
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
    </div>
  );
}
