/**
 * Notification Service for AA Dom Qur'an
 * Manages Web Notifications API and ServiceWorker notifications.
 */

export class NotificationService {
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  public async showNotification(title: string, options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
  }): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // Prefer ServiceWorker registration if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, {
            body: options.body,
            icon: options.icon || '/pwa-192x192.png',
            badge: options.badge || '/favicon.png',
            tag: options.tag || 'aadom-prayer-alert',
            data: options.data
          });
          return true;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        tag: options.tag || 'aadom-prayer-alert'
      });
      return true;
    } catch (err) {
      console.warn('Failed to display web notification:', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
