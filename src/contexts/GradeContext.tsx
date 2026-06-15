import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { CourseGrade, GradeValue } from '../types';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { STORAGE_KEYS, MMKV_KEYS } from '../storage/storageKeys';
import { SEED_GRADES } from '../constants/seedData';

interface GradeContextType {
  grades: CourseGrade[];
  loading: boolean;
  getGrade: (courseId: string) => GradeValue | null;
  setGrade: (courseId: string, grade: GradeValue) => Promise<void>;
  removeGrade: (courseId: string) => Promise<void>;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export function GradeProvider({ children }: { children: React.ReactNode }) {
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = mmkvStorage.get<CourseGrade[]>(MMKV_KEYS.GRADES_CACHE);
        if (cached) {
          setGrades(cached);
          setLoading(false);
          return;
        }
        const stored = await asyncStorageService.get<CourseGrade[]>(STORAGE_KEYS.GRADES);
        if (stored && stored.length > 0) {
          setGrades(stored);
          mmkvStorage.set(MMKV_KEYS.GRADES_CACHE, stored);
        } else {
          // First launch — seed with sample grades
          setGrades(SEED_GRADES);
          mmkvStorage.set(MMKV_KEYS.GRADES_CACHE, SEED_GRADES);
          await asyncStorageService.set(STORAGE_KEYS.GRADES, SEED_GRADES);
        }
      } catch (error) {
        console.error('[GradeContext] load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (updated: CourseGrade[]) => {
    setGrades(updated);
    mmkvStorage.set(MMKV_KEYS.GRADES_CACHE, updated);
    await asyncStorageService.set(STORAGE_KEYS.GRADES, updated);
  }, []);

  const getGrade = useCallback(
    (courseId: string): GradeValue | null =>
      grades.find((g) => g.courseId === courseId)?.grade ?? null,
    [grades],
  );

  const setGrade = useCallback(
    async (courseId: string, grade: GradeValue) => {
      const idx = grades.findIndex((g) => g.courseId === courseId);
      const updated =
        idx >= 0
          ? grades.map((g) =>
              g.courseId === courseId
                ? { ...g, grade, updatedAt: new Date().toISOString() }
                : g,
            )
          : [
              ...grades,
              { courseId, grade, updatedAt: new Date().toISOString() },
            ];
      await persist(updated);
    },
    [grades, persist],
  );

  const removeGrade = useCallback(
    async (courseId: string) => {
      await persist(grades.filter((g) => g.courseId !== courseId));
    },
    [grades, persist],
  );

  return (
    <GradeContext.Provider value={{ grades, loading, getGrade, setGrade, removeGrade }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGradeContext(): GradeContextType {
  const ctx = useContext(GradeContext);
  if (!ctx) throw new Error('useGradeContext must be inside GradeProvider');
  return ctx;
}
