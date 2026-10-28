import { useCallback, useEffect, useState } from 'react';

import { loadTasks, saveTasks, type Task } from '@/lib/tasks';

function createTaskId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadTasks()
      .then((loadedTasks) => {
        if (isMounted) setTasks(loadedTasks);
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudieron cargar las tareas. Puedes crear una nueva para continuar.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addTask = useCallback(
    async (title: string, description: string) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: createTaskId(),
        title,
        description,
        createdAt: now,
        updatedAt: now,
      };
      const nextTasks = [task, ...tasks];

      try {
        await saveTasks(nextTasks);
        setTasks(nextTasks);
        setError(null);
        return true;
      } catch {
        setError('No se pudo guardar la tarea. Revisa el almacenamiento del dispositivo.');
        return false;
      }
    },
    [tasks],
  );

  const removeTask = useCallback(
    async (id: string) => {
      const nextTasks = tasks.filter((task) => task.id !== id);

      try {
        await saveTasks(nextTasks);
        setTasks(nextTasks);
        setError(null);
        return true;
      } catch {
        setError('No se pudo eliminar la tarea. Inténtalo de nuevo.');
        return false;
      }
    },
    [tasks],
  );

  return { tasks, isLoading, error, addTask, removeTask };
}
