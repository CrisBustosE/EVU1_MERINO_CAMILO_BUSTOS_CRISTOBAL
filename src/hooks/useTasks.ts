import { useReducer, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskReducer } from '../reducers/taskReducer';
import type { Task } from '../types';
import { STORAGE_KEYS } from '../constants';

export function useTasks() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tareas al montar
  useEffect(() => {
    async function loadTasks() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            dispatch({ type: 'LOAD', payload: parsed });
          } else {
            dispatch({ type: 'LOAD', payload: [] });
          }
        } else {
          dispatch({ type: 'LOAD', payload: [] });
        }
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
    dispatch({ type: 'DELETE', payload: id });
  }, []);

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
