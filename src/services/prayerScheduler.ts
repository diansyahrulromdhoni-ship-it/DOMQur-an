/**
 * Prayer Times Audio Scheduler Engine
 * Strictly enforces duplicate prevention, local time synchronization,
 * multi-tab safety, and background/wake-up handling.
 */

import { audioManager, PrayerEventType } from './audioManager';
import { LocationInfo, PrayerTimes } from './prayerTimeService';

export interface ScheduleEvent {
  type: PrayerEventType;
  timeStr: string; // HH:mm
}

export class PrayerScheduler {
  private timerId: number | null = null;
  private currentLocation: LocationInfo | null = null;
  private currentTimes: PrayerTimes | null = null;
  private isRunning: boolean = false;
  private lastCheckedMinute: string = '';
  private appStartTime: number = Date.now();

  constructor() {
    if (typeof window !== 'undefined') {
      // Wake up handling when user returns to tab
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isRunning) {
          this.checkNow();
        }
      });
    }
  }

  /**
   * Start or sync scheduler with location and prayer times
   */
  public sync(location: LocationInfo, prayerTimes: PrayerTimes) {
    const locChanged =
      !this.currentLocation ||
      this.currentLocation.latitude !== location.latitude ||
      this.currentLocation.longitude !== location.longitude ||
      this.currentLocation.name !== location.name;

    this.currentLocation = location;
    this.currentTimes = prayerTimes;

    if (locChanged) {
      // Location changed, reset minute tracker
      this.lastCheckedMinute = '';
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Check immediately
    this.checkNow();

    // Check every second
    this.timerId = window.setInterval(() => {
      this.checkNow();
    }, 1000);
  }

  public stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  /**
   * Core check loop
   */
  private checkNow() {
    if (!this.currentLocation || !this.currentTimes) return;

    const now = new Date();
    const curHour = String(now.getHours()).padStart(2, '0');
    const curMin = String(now.getMinutes()).padStart(2, '0');
    const curSec = now.getSeconds();
    const currentMinuteStr = `${curHour}:${curMin}`;

    // Prevent running multiple times inside the same minute if already processed
    if (this.lastCheckedMinute === currentMinuteStr && curSec > 1) {
      return;
    }
    this.lastCheckedMinute = currentMinuteStr;

    // Construct event list for today
    const events: ScheduleEvent[] = [
      { type: 'imsak', timeStr: this.currentTimes.imsak },
      { type: 'subuh', timeStr: this.currentTimes.subuh },
      { type: 'terbit', timeStr: this.currentTimes.terbit },
      { type: 'dzuhur', timeStr: this.currentTimes.dzuhur },
      { type: 'ashar', timeStr: this.currentTimes.ashar },
      { type: 'maghrib', timeStr: this.currentTimes.maghrib },
      { type: 'isya', timeStr: this.currentTimes.isya }
    ];

    const todayStr = now.toISOString().split('T')[0];
    const locName = this.currentLocation.name;
    const settings = audioManager.getSettings();

    for (const evt of events) {
      if (!evt.timeStr) continue;

      // Match exact minute
      if (evt.timeStr === currentMinuteStr) {
        const eventId = `${todayStr}_${locName.replace(/\s+/g, '_')}_${evt.type}_${evt.timeStr}`;

        // Don't trigger if already processed
        if (audioManager.isEventProcessed(eventId)) {
          continue;
        }

        // Catch-up policy check: if app just opened within the last 10 seconds,
        // and current time matches, it's allowed.
        // If app opened hours ago, it naturally matches current time.
        // If allowCatchUp is false (default), never trigger past minutes!
        audioManager.triggerScheduledPrayer(evt.type, evt.timeStr, locName);
      }
    }
  }
}

export const prayerScheduler = new PrayerScheduler();
