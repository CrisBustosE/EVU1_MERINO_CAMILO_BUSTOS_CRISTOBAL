import type { Task } from '../types';

// Migra datos de la Unidad 1: completa createdAt con Number(id) y descarta entradas inválidas
export function migrateTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];
  const tasks: Task[] = [];
  for (const entry of raw as (Partial<Task> | null)[]) {
    if (typeof entry?.id !== 'string' || typeof entry.title !== 'string') continue;
    if (typeof entry.createdAt === 'number') {
      tasks.push(entry as Task);
      continue;
    }
    const fromId = Number(entry.id);
    tasks.push({ ...entry, createdAt: Number.isFinite(fromId) ? fromId : 0 } as Task);
  }
  return tasks;
}
