import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Course } from '../types';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { STORAGE_KEYS, MMKV_KEYS } from '../storage/storageKeys';
import { SEED_COURSES } from '../constants/seedData';

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  error: string | null;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<void>;
  updateCourse: (id: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (updated: Course[]) => {
    setCourses(updated);
    mmkvStorage.set(MMKV_KEYS.COURSES_CACHE, updated);
    const ok = await asyncStorageService.set(STORAGE_KEYS.COURSES, updated);
    if (!ok) setError('Gagal menyimpan data ke penyimpanan.');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = mmkvStorage.get<Course[]>(MMKV_KEYS.COURSES_CACHE);
      if (cached) {
        setCourses(cached);
        setLoading(false);
        // Still sync from AsyncStorage in background to ensure consistency
        const stored = await asyncStorageService.get<Course[]>(STORAGE_KEYS.COURSES);
        if (stored) {
          setCourses(stored);
          mmkvStorage.set(MMKV_KEYS.COURSES_CACHE, stored);
        }
        return;
      }
      const stored = await asyncStorageService.get<Course[]>(STORAGE_KEYS.COURSES);
      if (stored && stored.length > 0) {
        setCourses(stored);
        mmkvStorage.set(MMKV_KEYS.COURSES_CACHE, stored);
      } else {
        // First launch — seed with sample courses
        setCourses(SEED_COURSES);
        mmkvStorage.set(MMKV_KEYS.COURSES_CACHE, SEED_COURSES);
        await asyncStorageService.set(STORAGE_KEYS.COURSES, SEED_COURSES);
      }
    } catch (err) {
      console.error('[CourseContext] load failed:', err);
      setError('Gagal memuat data mata kuliah.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addCourse = useCallback(async (data: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await persist([...courses, newCourse]);
  }, [courses, persist]);

  const updateCourse = useCallback(async (
    id: string,
    data: Partial<Omit<Course, 'id' | 'createdAt'>>,
  ) => {
    const updated = courses.map((c) => (c.id === id ? { ...c, ...data } : c));
    await persist(updated);
  }, [courses, persist]);

  const deleteCourse = useCallback(async (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    await persist(updated);
  }, [courses, persist]);

  return (
    <CourseContext.Provider
      value={{ courses, loading, error, addCourse, updateCourse, deleteCourse, refreshCourses: load }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext(): CourseContextType {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseContext must be used inside CourseProvider');
  return ctx;
}
