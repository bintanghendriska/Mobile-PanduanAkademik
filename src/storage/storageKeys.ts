export const STORAGE_KEYS = {
  COURSES: '@panduan_akademik/courses',
  STUDENT: '@panduan_akademik/student',
  SETTINGS: '@panduan_akademik/settings',
  GRADES: '@panduan_akademik/grades',
} as const;

export const MMKV_KEYS = {
  COURSES_CACHE: 'courses_cache',
  STUDENT_CACHE: 'student_cache',
  SETTINGS_CACHE: 'settings_cache',
  GRADES_CACHE: 'grades_cache',
} as const;
