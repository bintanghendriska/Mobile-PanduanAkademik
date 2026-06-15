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
};
