import { Platform } from 'react-native';

// Lazy-load expo-notifications to handle the case where it isn't installed yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  console.warn('[Notifications] expo-notifications not installed — run: npx expo install expo-notifications');
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) return false;
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('akademik', {
          name: 'Pengingat Akademik',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleDaily(): Promise<void> {
    if (!Notifications) return;
    try {
      const granted = await this.requestPermissions();
      if (!granted) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Pengingat Akademik',
          body: 'Jangan lupa cek jadwal kuliah dan tugas hari ini!',
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
        },
      });
    } catch (error) {
      console.error('[Notifications] scheduleDaily failed:', error);
    }
  },

  async cancelAll(): Promise<void> {
    if (!Notifications) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[Notifications] cancelAll failed:', error);
    }
  },

  // Fires immediately (trigger: null) — used right after a sync detects
  // courses that weren't present locally before.
  async notifyNewCourses(count: number): Promise<void> {
    if (!Notifications || count <= 0) return;
    try {
      const granted = await this.requestPermissions();
      if (!granted) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🆕 Mata Kuliah Baru',
          body: `${count} mata kuliah baru ditemukan dari server.`,
          sound: false,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('[Notifications] notifyNewCourses failed:', error);
    }
  },

  // Fires immediately when total SKS exceeds the registration threshold.
  async notifySksDeadline(totalSks: number, threshold: number): Promise<void> {
    if (!Notifications || totalSks <= threshold) return;
    try {
      const granted = await this.requestPermissions();
      if (!granted) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Batas SKS Terlampaui',
          body: `Total ${totalSks} SKS melebihi batas ${threshold} SKS. Periksa KRS Anda.`,
          sound: false,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('[Notifications] notifySksDeadline failed:', error);
    }
  },
};
