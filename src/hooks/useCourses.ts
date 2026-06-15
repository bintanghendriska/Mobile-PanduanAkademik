import { useMemo } from 'react';
import { useCourseContext } from '../contexts/CourseContext';
import { Course, SortOption } from '../types';

export function useCourses() {
  return useCourseContext();
}

export function useFilteredAndSortedCourses(
  searchQuery: string,
  sksFilter: number | null,
  sortOption: SortOption,
): Course[] {
  const { courses } = useCourseContext();

  return useMemo<Course[]>(() => {
    let result = courses;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.nama.toLowerCase().includes(q) ||
          c.kode.toLowerCase().includes(q) ||
          c.dosen.toLowerCase().includes(q),
      );
    }

    if (sksFilter !== null) {
      result = result.filter((c) => c.sks === sksFilter);
    }

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case 'nama_asc':
          return a.nama.localeCompare(b.nama, 'id');
        case 'nama_desc':
          return b.nama.localeCompare(a.nama, 'id');
        case 'sks_desc':
          return b.sks - a.sks;
        case 'sks_asc':
          return a.sks - b.sks;
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [courses, searchQuery, sksFilter, sortOption]);
}

export function useCourseStats() {
  const { courses } = useCourseContext();

  return useMemo(
    () => ({
      totalMataKuliah: courses.length,
      totalSks: courses.reduce((sum, c) => sum + c.sks, 0),
    }),
    [courses],
  );
}
