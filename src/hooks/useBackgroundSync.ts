import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { registerBackgroundSync, unregisterBackgroundSync } from '../tasks/backgroundSyncTask';

// Mirrors the existing notifikasi-toggle pattern: flips the native
// registration on/off whenever the user changes the setting.
export function useBackgroundSync() {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading) return; // wait for persisted settings so we don't register then immediately unregister
    if (settings.backgroundSync) {
      registerBackgroundSync();
    } else {
      unregisterBackgroundSync();
    }
  }, [settings.backgroundSync, loading]);
}
