import { useReducer, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskReducer } from '../reducers/taskReducer';
import type { Task } from '../types';
import { STORAGE_KEYS } from '../constants';
import { migrateTasks } from '../utils/migrateTasks';
import { deletePhoto } from '../services/photoStorage';

export function useTasks() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tareas al montar
  useEffect(() => {
    async function loadTasks() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
        dispatch({ type: 'LOAD', payload: migrateTasks(raw ? JSON.parse(raw) : []) });
      } catch {
        dispatch({ type: 'LOAD', payload: [] });
      } finally {
        setIsLoaded(true);
      }
    }

    loadTasks();
  }, []);

  // Persistir solo tras la carga inicial para evitar sobrescribir con el estado vacío
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)).catch(() => null);
  }, [tasks, isLoaded]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    deletePhoto(task?.photoUri);
    dispatch({ type: 'DELETE', payload: id });
  }, [tasks]);

  const saveTask = useCallback((task: Task) => {
    const exists = tasks.find((t) => t.id === task.id);
    dispatch({ type: exists ? 'EDIT' : 'ADD', payload: task });
  }, [tasks]);

  return {
    tasks,
    isLoaded,
    deleteTask,
    saveTask,
  };
}
