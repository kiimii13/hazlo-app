import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const TASKS_STORAGE_KEY = '@hazlo/tasks';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;

  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

export async function loadTasks(): Promise<Task[]> {
  const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) return [];

  const parsed: unknown = JSON.parse(storedTasks);
  if (!Array.isArray(parsed) || !parsed.every(isTask)) {
    throw new Error('El contenido guardado no tiene un formato válido.');
  }

  return parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveTasks(tasks: Task[]) {
  return AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
