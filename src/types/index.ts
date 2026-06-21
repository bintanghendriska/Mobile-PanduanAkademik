export interface Course {
  id: string;
  nama: string;
  kode: string;
  sks: number;
  dosen: string;
  hari: string;
  jam: string;
  ruangan: string;
  catatan: string;
  createdAt: string;
  // Sync metadata — undefined for courses created purely offline/local
  serverId?: number;
  syncedAt?: string;
}

export type GradeValue = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'E' | 'F';

export interface CourseGrade {
  courseId: string;
  grade: GradeValue;
  updatedAt: string;
}

export const GRADE_POINTS: Record<GradeValue, number> = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  D: 1.0,
  E: 0.0,
  F: 0.0,
};

export const GRADE_COLOR: Record<GradeValue, string> = {
  A: '#1B5E20',
  'A-': '#2E7D32',
  'B+': '#0D47A1',
  B: '#1565C0',
  'B-': '#1976D2',
  'C+': '#E65100',
  C: '#EF6C00',
  'C-': '#F57C00',
  D: '#B71C1C',
  E: '#7F0000',
  F: '#4A0000',
};

export interface Student {
  nama: string;
  nim: string;
  semester: string;
  jurusan: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifikasi: boolean;
  backgroundSync: boolean;
}

export interface CourseFormData {
  nama: string;
  kode: string;
  sks: string;
  dosen: string;
  hari: string;
  jam: string;
  ruangan: string;
  catatan: string;
}

export interface ValidationErrors {
  nama?: string;
  kode?: string;
  sks?: string;
  dosen?: string;
}

export type SortOption =
  | 'nama_asc'
  | 'nama_desc'
  | 'sks_desc'
  | 'sks_asc'
  | 'newest'
  | 'oldest';
