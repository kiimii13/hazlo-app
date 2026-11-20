import { useCallback, useEffect, useState } from 'react';

import { deleteTask, insertTask, loadTasks, updateTask, type Task } from '@/lib/tasks';

type TaskAttachments = Pick<Task, 'photoUri' | 'latitude' | 'longitude'>;

function createTaskId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadTasks(userId)
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
  }, [userId]);

  const addTask = useCallback(
    async (title: string, description: string, attachments: TaskAttachments = {}) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: createTaskId(),
        userId,
        title,
        description,
        createdAt: now,
        updatedAt: now,
        ...attachments,
      };
      const nextTasks = [task, ...tasks];

      try {
        await insertTask(task);
        setTasks(nextTasks);
        setError(null);
        return true;
      } catch {
        setError('No se pudo guardar la tarea. Revisa el almacenamiento del dispositivo.');
        return false;
      }
    },
    [tasks, userId],
  );

  const editTask = useCallback(
    async (
      id: string,
      title: string,
      description: string,
      attachments: TaskAttachments = {},
    ) => {
      const currentTask = tasks.find((task) => task.id === id);
      if (!currentTask) {
        setError('No se encontró la tarea que quieres editar.');
        return false;
      }

      const task: Task = {
        ...currentTask,
        title,
        description,
        updatedAt: new Date().toISOString(),
        ...attachments,
      };
      const nextTasks = [task, ...tasks.filter((currentTask) => currentTask.id !== id)];

      try {
        await updateTask(task);
        setTasks(nextTasks);
        setError(null);
        return true;
      } catch {
        setError('No se pudo actualizar la tarea. Inténtalo de nuevo.');
        return false;
      }
    },
    [tasks],
  );

  const removeTask = useCallback(
    async (id: string) => {
      const nextTasks = tasks.filter((task) => task.id !== id);

      try {
        await deleteTask(id, userId);
        setTasks(nextTasks);
        setError(null);
        return true;
      } catch {
        setError('No se pudo eliminar la tarea. Inténtalo de nuevo.');
        return false;
      }
    },
    [tasks, userId],
  );

  return { tasks, isLoading, error, addTask, editTask, removeTask };
}
