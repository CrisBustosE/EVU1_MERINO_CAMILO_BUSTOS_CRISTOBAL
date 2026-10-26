import type { Task } from './index';

export type RootStackParamList = {
  TaskList: undefined;
  TaskForm: { task?: Task };
};
