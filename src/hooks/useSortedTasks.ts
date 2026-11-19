import { useMemo } from 'react';
import type { Task, SortOrder } from '../types';

export function useSortedTasks(tasks: Task[], order: SortOrder): Task[] {
  return useMemo(() => {
    const copy = [...tasks];
    switch (order) {
      case 'newest':
        return copy.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return copy.sort((a, b) => a.createdAt - b.createdAt);
      case 'alphabetical':
        return copy.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
    }
  }, [tasks, order]);
}
