import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useCourses } from './useCourses';

const MIN_GAP_MS = 60 * 1000; // skip re-sync if we already synced less than a minute ago

// Re-syncs whenever the app returns to the foreground. Two steps, both
// silent (no Alert) — explicit feedback is reserved for the manual
// "Sync from Server" button and pull-to-refresh:
//   1. refreshCourses() re-reads AsyncStorage, picking up anything the
//      background task wrote while the app was backgrounded/killed.
//   2. syncFromServer() then checks the network for anything even newer.
export function useForegroundSync() {
  const { refreshCourses, syncFromServer } = useCourses();
  const lastSyncRef = useRef(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      const cameToForeground = appState.current.match(/inactive|background/) && next === 'active';
      appState.current = next;
      if (!cameToForeground) return;

      const now = Date.now();
      if (now - lastSyncRef.current < MIN_GAP_MS) return;
      lastSyncRef.current = now;

      refreshCourses()
        .then(() => syncFromServer())
        .catch(() => {});
    });

    return () => subscription.remove();
  }, [refreshCourses, syncFromServer]);
}
