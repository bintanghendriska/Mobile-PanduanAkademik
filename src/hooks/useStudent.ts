import { useStudentContext } from '../contexts/StudentContext';

export function useStudent() {
  return useStudentContext();
}
