import type { Task } from '../types';

export type TaskAction =
  | { type: 'LOAD'; payload: Task[] }
  | { type: 'ADD'; payload: Task }
  | { type: 'EDIT'; payload: Task }
  | { type: 'DELETE'; payload: string };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'ADD':
      return [...state, action.payload];
    case 'EDIT':
      return state.map((t) => (t.id === action.payload.id ? action.payload : t));
    case 'DELETE':
      return state.filter((t) => t.id !== action.payload);
  }
}
