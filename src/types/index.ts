export interface Task {
  id: string;
  title: string;
  description: string;
}

export type SortOrder = 'newest' | 'oldest' | 'alphabetical';
