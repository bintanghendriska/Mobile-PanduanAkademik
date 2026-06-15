import { useMemo } from 'react';
import { useGradeContext } from '../contexts/GradeContext';
import { Course, GRADE_POINTS } from '../types';

export function useGrades() {
  return useGradeContext();
}

export function useIPK(courses: Course[]): string | null {
  const { grades } = useGradeContext();

  return useMemo(() => {
    let totalWeighted = 0;
    let totalSks = 0;

    courses.forEach((course) => {
      const entry = grades.find((g) => g.courseId === course.id);
      if (entry) {
        totalWeighted += course.sks * GRADE_POINTS[entry.grade];
        totalSks += course.sks;
      }
    });

    if (totalSks === 0) return null;
    return (totalWeighted / totalSks).toFixed(2);
  }, [courses, grades]);
}
