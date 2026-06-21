import { Course } from '../types';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { STORAGE_KEYS, MMKV_KEYS } from '../storage/storageKeys';
import { fetchRemoteCourses } from '../services/api/courseApi';
import { mergeCourses } from '../services/sync/mergeCourses';
import { notificationService } from '../services/notificationService';
import { MAX_SKS_THRESHOLD } from '../constants/theme';

const TASK_NAME = 'BACKGROUND_COURSE_SYNC';

// expo-task-manager / expo-background-fetch both need a native module that
// Expo Go does not ship (since SDK 51+) — they only work in a development
// build (`npx expo prebuild` / expo-dev-client). Lazy-require + try/catch lets
// the rest of the app keep working when they're unavailable, same defensive
// pattern already used by notificationService and mmkvStorage.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TaskManager: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let BackgroundFetch: any = null;
try {
  TaskManager = require('expo-task-manager');
  BackgroundFetch = require('expo-background-fetch');
} catch {
  console.warn(
    '[BackgroundSync] expo-task-manager / expo-background-fetch unavailable in this environment (Expo Go). ' +
    'Build a development client (npx expo prebuild + expo-dev-client) to test background sync for real.',
  );
}

// Runs with no React tree around it (may execute while the app is fully
// killed on Android), so it talks to storage and the API layer directly
// instead of going through CourseContext. Mirrors the same merge rule used
// by CourseContext.syncFromServer: local edits are never overwritten, only
// genuinely new server courses are appended.
async function runSync(): Promise<{ addedCount: number; totalSks: number }> {
  const local = (await asyncStorageService.get<Course[]>(STORAGE_KEYS.COURSES)) ?? [];
  const remote = await fetchRemoteCourses();
  const { merged, addedCount } = mergeCourses(local, remote);

  if (addedCount > 0) {
    mmkvStorage.set(MMKV_KEYS.COURSES_CACHE, merged);
    await asyncStorageService.set(STORAGE_KEYS.COURSES, merged);
  }

  const totalSks = merged.reduce((sum, c) => sum + c.sks, 0);
  return { addedCount, totalSks };
}

if (TaskManager) {
  TaskManager.defineTask(TASK_NAME, async () => {
    try {
      const { addedCount, totalSks } = await runSync();

      if (addedCount > 0) {
        await notificationService.notifyNewCourses(addedCount);
      }
      await notificationService.notifySksDeadline(totalSks, MAX_SKS_THRESHOLD);

      return addedCount > 0
        ? BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
      console.error('[BackgroundSync] task failed:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// 30 minutes. This is only a hint to the OS — iOS in particular schedules
// background fetch at its own discretion and may run it less often than
// requested (or not at all if the app is rarely used in the foreground).
const MIN_INTERVAL_SECONDS = 30 * 60;

export async function registerBackgroundSync(): Promise<boolean> {
  if (!TaskManager || !BackgroundFetch) {
    console.warn('[BackgroundSync] Registration skipped — native module unavailable (Expo Go).');
    return false;
  }
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: MIN_INTERVAL_SECONDS,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    return true;
  } catch (error) {
    console.error('[BackgroundSync] registerTaskAsync failed:', error);
    return false;
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  if (!TaskManager || !BackgroundFetch) return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    }
  } catch (error) {
    console.error('[BackgroundSync] unregisterTaskAsync failed:', error);
  }
}
