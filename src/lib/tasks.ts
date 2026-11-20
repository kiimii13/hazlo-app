import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
};

type StoredTask = Omit<Task, 'userId'> & {
  userId?: string | null;
};

const TASKS_STORAGE_KEY = '@hazlo/tasks';

function isStoredTask(value: unknown): value is StoredTask {
  if (typeof value !== 'object' || value === null) return false;

  const task = value as Partial<StoredTask>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string' &&
    (task.userId === undefined || task.userId === null || typeof task.userId === 'string') &&
    (task.photoUri === undefined || typeof task.photoUri === 'string') &&
    (task.latitude === undefined || typeof task.latitude === 'number') &&
    (task.longitude === undefined || typeof task.longitude === 'number')
  );
}

async function readStoredTasks(): Promise<StoredTask[]> {
  const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) return [];

  const parsed: unknown = JSON.parse(storedTasks);
  if (!Array.isArray(parsed) || !parsed.every(isStoredTask)) {
    throw new Error('El contenido guardado no tiene un formato válido.');
  }

  return parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function writeTasks(tasks: StoredTask[]) {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export async function claimUnassignedTasks(userId: string) {
  const tasks = await readStoredTasks();
  const claimedTasks = tasks.map((task) => (task.userId ? task : { ...task, userId }));
  await writeTasks(claimedTasks);
}

export async function loadTasks(userId: string): Promise<Task[]> {
  const tasks = await readStoredTasks();
  return tasks.filter((task): task is Task => task.userId === userId);
}

export async function insertTask(task: Task) {
  const tasks = await readStoredTasks();
  await writeTasks([task, ...tasks]);
}

export async function deleteTask(id: string, userId: string) {
  const tasks = await readStoredTasks();
  await writeTasks(tasks.filter((task) => !(task.id === id && task.userId === userId)));
}

export async function updateTask(task: Task) {
  const tasks = await readStoredTasks();
  await writeTasks(
    tasks.map((currentTask) =>
      currentTask.id === task.id && currentTask.userId === task.userId ? task : currentTask,
    ),
  );
}
