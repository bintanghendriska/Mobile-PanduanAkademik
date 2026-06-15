// react-native-mmkv requires a native build (expo prebuild / dev client).
// When unavailable (Expo Go), falls back transparently to an in-memory store
// so the rest of the app keeps working without changes.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mmkvInstance: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv') as { MMKV: new (config: { id: string }) => any };
  mmkvInstance = new MMKV({ id: 'panduan-akademik-cache' });
} catch {
  console.warn('[MMKV] Native module unavailable — using in-memory fallback');
}

const memFallback = new Map<string, string>();

export const mmkvStorage = {
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (mmkvInstance) {
        mmkvInstance.set(key, serialized);
      } else {
        memFallback.set(key, serialized);
      }
    } catch (error) {
      console.error(`[MMKV] set(${key}) failed:`, error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const raw: string | undefined = mmkvInstance
        ? mmkvInstance.getString(key)
        : memFallback.get(key);
      if (raw === undefined) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[MMKV] get(${key}) failed:`, error);
      return null;
    }
  },

  delete(key: string): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
      } else {
        memFallback.delete(key);
      }
    } catch (error) {
      console.error(`[MMKV] delete(${key}) failed:`, error);
    }
  },

  clearAll(): void {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
      } else {
        memFallback.clear();
      }
    } catch (error) {
      console.error('[MMKV] clearAll() failed:', error);
    }
  },
};
