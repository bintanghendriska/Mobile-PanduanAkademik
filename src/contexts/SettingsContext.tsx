import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppSettings } from '../types';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { STORAGE_KEYS, MMKV_KEYS } from '../storage/storageKeys';
import { DEFAULT_SETTINGS } from '../constants/theme';

interface SettingsContextType {
  settings: AppSettings;
  toggleDarkMode: () => void;
  toggleNotifikasi: () => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try MMKV cache first (sync, fast)
        const cached = mmkvStorage.get<AppSettings>(MMKV_KEYS.SETTINGS_CACHE);
        if (cached) {
          setSettings(cached);
          setLoading(false);
          return;
        }
        // Fallback to AsyncStorage
        const stored = await asyncStorageService.get<AppSettings>(STORAGE_KEYS.SETTINGS);
        if (stored) {
          setSettings(stored);
          mmkvStorage.set(MMKV_KEYS.SETTINGS_CACHE, stored);
        }
      } catch (error) {
        console.error('[SettingsContext] load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (next: AppSettings) => {
    setSettings(next);
    mmkvStorage.set(MMKV_KEYS.SETTINGS_CACHE, next);
    await asyncStorageService.set(STORAGE_KEYS.SETTINGS, next);
  }, []);

  const toggleDarkMode = useCallback(() => {
    persist({ ...settings, darkMode: !settings.darkMode });
  }, [settings, persist]);

  const toggleNotifikasi = useCallback(() => {
    persist({ ...settings, notifikasi: !settings.notifikasi });
  }, [settings, persist]);

  return (
    <SettingsContext.Provider value={{ settings, toggleDarkMode, toggleNotifikasi, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used inside SettingsProvider');
  return ctx;
}
