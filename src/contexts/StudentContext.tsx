import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Student } from '../types';
import { asyncStorageService } from '../storage/asyncStorage';
import { mmkvStorage } from '../storage/mmkvStorage';
import { STORAGE_KEYS, MMKV_KEYS } from '../storage/storageKeys';
import { DEFAULT_STUDENT } from '../constants/theme';

interface StudentContextType {
  student: Student;
  updateStudent: (data: Partial<Student>) => Promise<void>;
  loading: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student>(DEFAULT_STUDENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = mmkvStorage.get<Student>(MMKV_KEYS.STUDENT_CACHE);
        if (cached) {
          setStudent(cached);
          setLoading(false);
          return;
        }
        const stored = await asyncStorageService.get<Student>(STORAGE_KEYS.STUDENT);
        if (stored) {
          setStudent(stored);
          mmkvStorage.set(MMKV_KEYS.STUDENT_CACHE, stored);
        }
      } catch (error) {
        console.error('[StudentContext] load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStudent = useCallback(async (data: Partial<Student>) => {
    const updated: Student = { ...student, ...data };
    setStudent(updated);
    mmkvStorage.set(MMKV_KEYS.STUDENT_CACHE, updated);
    await asyncStorageService.set(STORAGE_KEYS.STUDENT, updated);
  }, [student]);

  return (
    <StudentContext.Provider value={{ student, updateStudent, loading }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudentContext(): StudentContextType {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudentContext must be used inside StudentProvider');
  return ctx;
}
