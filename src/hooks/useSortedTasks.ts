import { useMemo } from 'react';
import type { Task, SortOrder } from '../types';

// Los IDs se generan con Date.now(), por lo que sirven como fecha de creación
function compareByCreation(a: Task, b: Task): number {
  return Number(a.id) - Number(b.id);
}

export function useSortedTasks(tasks: Task[], order: SortOrder): Task[] {
  return useMemo(() => {
    const copy = [...tasks];
    switch (order) {
      case 'newest':
        return copy.sort((a, b) => compareByCreation(b, a));
      case 'oldest':
        return copy.sort(compareByCreation);
      case 'alphabetical':
        return copy.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
    }
  }, [tasks, order]);
}
