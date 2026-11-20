import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

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

const DATABASE_NAME = 'hazlo.db';
const DATABASE_VERSION = 3;
const LEGACY_STORAGE_KEY = '@hazlo/tasks';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<void> | null = null;

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

async function loadLegacyTasks(): Promise<{ tasks: StoredTask[]; hasStoredValue: boolean }> {
  const storedTasks = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!storedTasks) return { tasks: [], hasStoredValue: false };

  const parsed: unknown = JSON.parse(storedTasks);
  if (!Array.isArray(parsed) || !parsed.every(isStoredTask)) {
    throw new Error('El contenido guardado no tiene un formato válido.');
  }

  return { tasks: parsed, hasStoredValue: true };
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  const version = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = version?.user_version ?? 0;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      photoUri TEXT,
      latitude REAL,
      longitude REAL
    );
  `);

  if (currentVersion >= DATABASE_VERSION) return;

  const legacy = currentVersion === 0 ? await loadLegacyTasks() : null;

  await database.withTransactionAsync(async () => {
    if (currentVersion === 1) {
      await database.execAsync(`
        ALTER TABLE tasks ADD COLUMN photoUri TEXT;
        ALTER TABLE tasks ADD COLUMN latitude REAL;
        ALTER TABLE tasks ADD COLUMN longitude REAL;
        ALTER TABLE tasks ADD COLUMN userId TEXT;
      `);
    }

    if (currentVersion === 2) {
      await database.execAsync('ALTER TABLE tasks ADD COLUMN userId TEXT;');
    }

    if (legacy) {
      for (const task of legacy.tasks) {
        await database.runAsync(
          `INSERT OR REPLACE INTO tasks
            (id, userId, title, description, createdAt, updatedAt, photoUri, latitude, longitude)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.id,
            task.userId ?? null,
            task.title,
            task.description,
            task.createdAt,
            task.updatedAt,
            task.photoUri ?? null,
            task.latitude ?? null,
            task.longitude ?? null,
          ],
        );
      }
    }

    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });

  if (legacy?.hasStoredValue) {
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export async function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME);
  const database = await databasePromise;

  initializationPromise ??= initializeDatabase(database);
  await initializationPromise;

  return database;
}

export async function claimUnassignedTasks(userId: string) {
  const database = await getDatabase();
  await database.runAsync('UPDATE tasks SET userId = ? WHERE userId IS NULL', [userId]);
}

export async function loadTasks(userId: string): Promise<Task[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    photoUri: string | null;
    latitude: number | null;
    longitude: number | null;
  }>(
    `SELECT id, userId, title, description, createdAt, updatedAt, photoUri, latitude, longitude
     FROM tasks
     WHERE userId = ?
     ORDER BY updatedAt DESC`,
    [userId],
  );

  return rows.map(({ photoUri, latitude, longitude, ...task }) => ({
    ...task,
    ...(photoUri === null ? {} : { photoUri }),
    ...(latitude === null ? {} : { latitude }),
    ...(longitude === null ? {} : { longitude }),
  }));
}

export async function insertTask(task: Task) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO tasks
      (id, userId, title, description, createdAt, updatedAt, photoUri, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.userId,
      task.title,
      task.description,
      task.createdAt,
      task.updatedAt,
      task.photoUri ?? null,
      task.latitude ?? null,
      task.longitude ?? null,
    ],
  );
}

export async function updateTask(task: Task) {
  const database = await getDatabase();
  const previousTask = await database.getFirstAsync<{ photoUri: string | null }>(
    'SELECT photoUri FROM tasks WHERE id = ? AND userId = ?',
    [task.id, task.userId],
  );

  await database.runAsync(
    `UPDATE tasks
     SET title = ?, description = ?, updatedAt = ?, photoUri = ?, latitude = ?, longitude = ?
     WHERE id = ? AND userId = ?`,
    [
      task.title,
      task.description,
      task.updatedAt,
      task.photoUri ?? null,
      task.latitude ?? null,
      task.longitude ?? null,
      task.id,
      task.userId,
    ],
  );

  if (previousTask?.photoUri && previousTask.photoUri !== task.photoUri) {
    try {
      const photo = new File(previousTask.photoUri);
      if (photo.exists) photo.delete();
    } catch {
      // The updated task is already persisted; a failed cleanup leaves an orphan file.
    }
  }
}

export async function deleteTask(id: string, userId: string) {
  const database = await getDatabase();
  const task = await database.getFirstAsync<{ photoUri: string | null }>(
    'SELECT photoUri FROM tasks WHERE id = ? AND userId = ?',
    [id, userId],
  );

  await database.runAsync('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, userId]);

  if (task?.photoUri) {
    try {
      const photo = new File(task.photoUri);
      if (photo.exists) photo.delete();
    } catch {
      // The task is already deleted; a failed cleanup must not restore it.
    }
  }
}
