/**
 * Adzan Service Bridge
 * Proxies calls to the unified audioManager and prayerScheduler
 */

import { audioManager, ActiveAudioAlert, PrayerEventType } from './audioManager';
import { prayerScheduler } from './prayerScheduler';

export type { ActiveAudioAlert as AdzanAlertEvent };

export const adzanService = {
  getSettings: () => audioManager.getSettings(),
  saveSettings: (settings: Parameters<typeof audioManager.saveSettings>[0]) => audioManager.saveSettings(settings),
  subscribe: (callback: Parameters<typeof audioManager.subscribe>[0]) => audioManager.subscribe(callback),
  unlockAudio: () => audioManager.unlockAudio(),
  getIsUnlocked: () => audioManager.getIsUnlocked(),
  stopAdzan: () => audioManager.stopAudio(),
  pauseAdzan: () => audioManager.togglePlayPause(),
  resumeAdzan: () => audioManager.togglePlayPause(),
  dismissAlert: () => audioManager.stopAudio(),
  getActiveAlert: () => audioManager.getActiveAlert(),
  checkAndTriggerAdzan: (prayerTimes: any, locationName: string) => {
    // Handled authoritatively by prayerScheduler
  }
};
