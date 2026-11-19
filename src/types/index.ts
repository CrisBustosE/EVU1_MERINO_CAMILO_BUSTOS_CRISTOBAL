export interface TaskLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  photoUri?: string;
  location?: TaskLocation;
  address?: string;
}

export type SortOrder = 'newest' | 'oldest' | 'alphabetical';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';
