/**
 * Unified Audio Manager for AA Dom Qur'an
 * - Manages playback of Adzan, Imsak, and Terbit (Syuruq) audio
 * - Coordinates with Murottal (audioService) to prevent audio clash
 * - Multi-tab broadcast channel to prevent duplicate playback across tabs
 * - Persistent event log with 7-day retention
 * - Autoplay detection and user unlock handling
 */

import { AUDIO_REMINDERS_CONFIG, AUDIO_TEST_PRESETS } from '../config/audioConfig';
import { audioService } from './audioService';
import { notificationService } from './notificationService';

export type PrayerEventType = 'imsak' | 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface AudioSettings {
  soundEnabled: boolean;
  volume: number; // 0.0 to 1.0
  allowCatchUp: boolean; // default false
  eventToggles: {
    imsak: boolean;
    subuh: boolean;
    terbit: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  notificationsEnabled: boolean;
}

export interface ActiveAudioAlert {
  eventId: string;
  eventType: PrayerEventType | 'test';
  title: string;
  subtitle: string;
  timeStr: string;
  locationName: string;
  isPlaying: boolean;
  isTest: boolean;
  error: string | null;
  startedAt: number;
}

const SETTINGS_STORAGE_KEY = 'aadom_prayer_audio_settings_v2';
const PROCESSED_EVENTS_KEY = 'aadom_processed_events_v2';
const BROADCAST_CHANNEL_NAME = 'aadom_audio_coordinator_v1';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEnabled: true,
  volume: 0.9,
  allowCatchUp: false,
  eventToggles: {
    imsak: true,
    subuh: true,
    terbit: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true
  },
  notificationsEnabled: true
};

type AudioAlertSubscriber = (alert: ActiveAudioAlert | null) => void;

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  private activeAlert: ActiveAudioAlert | null = null;
  private subscribers: Set<AudioAlertSubscriber> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isUnlocked: boolean = false;
  private appStartTime: number = Date.now();

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.initBroadcastChannel();
      this.cleanOldEvents();

      // Listen for tab focus/visibility change
      document.addEventListener('visibilitychange', () => {
        // Tab became visible
      });
    }
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      this.settings = DEFAULT_AUDIO_SETTINGS;
    }
  }

  public saveSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings:', e);
    }
    if (this.audio) {
      this.audio.volume = this.settings.volume;
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          const data = event.data;
          if (data && data.action === 'PLAYING') {
            // Another tab is playing this event or test
            if (this.activeAlert && this.activeAlert.eventId === data.eventId) {
              // Stop local audio to prevent echo
              this.stopAudio(false);
            }
            // Mark event as processed locally as well
            this.markEventProcessed(data.eventId);
          } else if (data && data.action === 'STOPPED') {
            if (this.activeAlert && this.activeAlert.eventId === data.eventId) {
              this.stopAudio(false);
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization skipped:', err);
      }
    }
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.settings.volume;

      this.audio.addEventListener('ended', () => {
        if (this.activeAlert) {
          this.activeAlert = { ...this.activeAlert, isPlaying: false };
          this.notifySubscribers();
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        if (this.activeAlert) {
          this.activeAlert = {
            ...this.activeAlert,
            isPlaying: false,
            error: 'Gagal memuat file audio. Periksa koneksi internet.'
          };
          this.notifySubscribers();
        }
      });
    }
    this.audio.volume = this.settings.volume;
    return this.audio;
  }

  /**
   * Unlocks audio context on any user tap / click
   */
  public unlockAudio(): boolean {
    if (this.isUnlocked) return true;
    try {
      const audio = this.getAudio();
      audio.load();
      this.isUnlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public subscribe(callback: AudioAlertSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.activeAlert);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((fn) => fn(this.activeAlert));
  }

  /**
   * Prune processed events older than 7 days
   */
  private cleanOldEvents() {
    try {
      const stored = localStorage.getItem(PROCESSED_EVENTS_KEY);
      if (!stored) return;
      const parsed: Record<string, number> = JSON.parse(stored);
      const now = Date.now();
      const cleaned: Record<string, number> = {};

      for (const [key, timestamp] of Object.entries(parsed)) {
        if (now - timestamp < RETENTION_MS) {
          cleaned[key] = timestamp;
        }
      }
      localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(cleaned));
    } catch (e) {
      console.warn('Failed to prune old events:', e);
    }
  }

  public isEventProcessed(eventId: string): boolean {
    try {
      const stored = localStorage.getItem(PROCESSED_EVENTS_KEY);
      if (!stored) return false;
      const parsed: Record<string, number> = JSON.parse(stored);
      return Boolean(parsed[eventId]);
    } catch {
      return false;
    }
  }

  private markEventProcessed(eventId: string) {
    try {
      const stored = localStorage.getItem(PROCESSED_EVENTS_KEY);
      const parsed: Record<string, number> = stored ? JSON.parse(stored) : {};
      parsed[eventId] = Date.now();
      localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to mark event as processed:', e);
    }
  }

  /**
   * Stop any active audio reminder
   */
  public stopAudio(broadcast: boolean = true) {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (e) {
        console.warn('Audio pause error:', e);
      }
    }

    if (this.activeAlert) {
      const oldEventId = this.activeAlert.eventId;
      this.activeAlert = null;
      this.notifySubscribers();

      if (broadcast && this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({ action: 'STOPPED', eventId: oldEventId });
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * Pause/resume the current alert
   */
  public togglePlayPause() {
    if (!this.audio || !this.activeAlert) return;
    if (this.activeAlert.isPlaying) {
      this.audio.pause();
      this.activeAlert = { ...this.activeAlert, isPlaying: false };
      this.notifySubscribers();
    } else {
      this.audio.play().then(() => {
        if (this.activeAlert) {
          this.activeAlert = { ...this.activeAlert, isPlaying: true };
          this.notifySubscribers();
        }
      }).catch((err) => {
        console.warn('Resume error:', err);
      });
    }
  }

  /**
   * Test audio function with explicit test IDs
   */
  public async playTestAudio(testKey: 'test_subuh' | 'test_standar' | 'test_imsak' | 'test_terbit'): Promise<boolean> {
    const preset = AUDIO_TEST_PRESETS.find((p) => p.id === testKey);
    if (!preset) return false;

    this.unlockAudio();

    // 1. Pause Murottal to avoid audio clash
    audioService.pause();

    // 2. Stop existing reminder audio
    this.stopAudio(false);

    const eventId = `test_${Date.now()}`;
    const alert: ActiveAudioAlert = {
      eventId,
      eventType: 'test',
      title: `Uji Audio: ${preset.name}`,
      subtitle: preset.subtitle,
      timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      locationName: 'Uji Coba Sistem Audio',
      isPlaying: true,
      isTest: true,
      error: null,
      startedAt: Date.now()
    };

    this.activeAlert = alert;
    this.notifySubscribers();

    const audio = this.getAudio();
    audio.src = preset.url;
    audio.volume = this.settings.volume;
    audio.currentTime = 0;

    try {
      await audio.play();
      this.isUnlocked = true;
      return true;
    } catch (err: unknown) {
      const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
      const msg = isNotAllowed
        ? 'Autoplay diblokir oleh browser. Klik tombol Buka Kunci Audio untuk mengizinkan.'
        : 'Gagal memutar audio pengingat. Periksa koneksi internet Anda.';
      this.activeAlert = { ...alert, isPlaying: false, error: msg };
      this.notifySubscribers();
      return false;
    }
  }

  /**
   * Trigger prayer reminder (Adzan, Imsak, or Terbit)
   */
  public async triggerScheduledPrayer(
    eventType: PrayerEventType,
    scheduledTime: string,
    locationName: string
  ): Promise<boolean> {
    // 1. Check if sound is enabled globally and for this event
    if (!this.settings.soundEnabled || !this.settings.eventToggles[eventType]) {
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const eventId = `${todayStr}_${locationName.replace(/\s+/g, '_')}_${eventType}_${scheduledTime}`;

    // 2. Single play per event check
    if (this.isEventProcessed(eventId)) {
      return false;
    }

    const config = AUDIO_REMINDERS_CONFIG[eventType];
    if (!config) return false;

    // 3. Pause Murottal if currently playing
    audioService.pause();

    // 4. Stop any current audio alert
    this.stopAudio(false);

    const alert: ActiveAudioAlert = {
      eventId,
      eventType,
      title: eventType === 'imsak' ? 'Waktu Imsak Telah Tiba' :
             eventType === 'terbit' ? 'Waktu Terbit Matahari (Syuruq)' :
             `Waktu Sholat ${config.name}`,
      subtitle: config.description,
      timeStr: scheduledTime,
      locationName,
      isPlaying: true,
      isTest: false,
      error: null,
      startedAt: Date.now()
    };

    this.activeAlert = alert;
    this.notifySubscribers();

    // 5. Broadcast to other tabs so they don't trigger the same event
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ action: 'PLAYING', eventId });
      } catch {
        // ignore
      }
    }

    // 6. Push Web Notification if enabled
    if (this.settings.notificationsEnabled) {
      const notifTitle = alert.title;
      const notifBody = `${alert.subtitle} untuk wilayah ${locationName} (Pukul ${scheduledTime}).`;
      notificationService.showNotification(notifTitle, {
        body: notifBody,
        tag: `prayer-${eventType}`
      });
    }

    // 7. Play Audio
    const audio = this.getAudio();
    audio.src = config.url;
    audio.volume = this.settings.volume;
    audio.currentTime = 0;

    try {
      await audio.play();
      this.isUnlocked = true;
      // Mark as processed ONLY after successful play start!
      this.markEventProcessed(eventId);
      return true;
    } catch (err: unknown) {
      const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
      const msg = isNotAllowed
        ? 'Browser memblokir pemutaran otomatis. Sentuh layar untuk mengaktifkan audio.'
        : 'Gagal memutar audio pengingat dari server.';

      console.warn('Audio play failed:', err);
      this.activeAlert = { ...alert, isPlaying: false, error: msg };
      this.notifySubscribers();
      return false;
    }
  }

  public getActiveAlert(): ActiveAudioAlert | null {
    return this.activeAlert;
  }
}

export const audioManager = new AudioManager();
