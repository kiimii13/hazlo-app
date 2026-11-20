type FakeRow = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  photoUri: string | null;
  latitude: number | null;
  longitude: number | null;
};

const mockRows = new Map<string, FakeRow>();

const mockDatabase = {
  execAsync: jest.fn(async () => undefined),
  getFirstAsync: jest.fn(async (query: string, params: string[] = []) => {
    if (query.includes('PRAGMA user_version')) return { user_version: 3 };
    if (query.includes('SELECT photoUri FROM tasks')) {
      const row = mockRows.get(params[0]);
      return row?.userId === params[1] ? { photoUri: row.photoUri } : null;
    }
    return null;
  }),
  getAllAsync: jest.fn(async (_query: string, params: string[] = []) =>
    [...mockRows.values()].filter((row) => row.userId === params[0]),
  ),
  runAsync: jest.fn(async (query: string, params: Array<string | number | null> = []) => {
    if (query.includes('INSERT INTO tasks')) {
      const [id, userId, title, description, createdAt, updatedAt, photoUri, latitude, longitude] = params;
      mockRows.set(String(id), {
        id: String(id),
        userId: String(userId),
        title: String(title),
        description: String(description),
        createdAt: String(createdAt),
        updatedAt: String(updatedAt),
        photoUri: photoUri === null ? null : String(photoUri),
        latitude: latitude === null ? null : Number(latitude),
        longitude: longitude === null ? null : Number(longitude),
      });
    }

    if (query.startsWith('UPDATE tasks')) {
      const [title, description, updatedAt, photoUri, latitude, longitude, id, userId] = params;
      const row = mockRows.get(String(id));
      if (row?.userId === userId) {
        mockRows.set(String(id), {
          ...row,
          title: String(title),
          description: String(description),
          updatedAt: String(updatedAt),
          photoUri: photoUri === null ? null : String(photoUri),
          latitude: latitude === null ? null : Number(latitude),
          longitude: longitude === null ? null : Number(longitude),
        });
      }
    }

    if (query.startsWith('DELETE FROM tasks')) {
      const [id, userId] = params;
      const row = mockRows.get(String(id));
      if (row?.userId === userId) mockRows.delete(String(id));
    }
  }),
  withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => mockDatabase),
}));

jest.mock('expo-file-system', () => ({
  File: class {
    exists = true;
    delete = jest.fn();
    uri: string;

    constructor(...args: unknown[]) {
      this.uri = String(args[0] ?? '');
    }
  },
}));

import { deleteTask, insertTask, loadTasks, updateTask, type Task } from '@/lib/tasks.native';

const taskA: Task = {
  id: 'task-a',
  userId: 'user-a',
  title: 'Tarea A',
  description: 'Descripción A',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  photoUri: 'file:///task-a.jpg',
  latitude: -33.4489,
  longitude: -70.6693,
};

const taskB: Task = {
  ...taskA,
  id: 'task-b',
  userId: 'user-b',
  title: 'Tarea B',
  photoUri: undefined,
  latitude: undefined,
  longitude: undefined,
};

describe('persistencia nativa de tareas', () => {
  beforeEach(() => {
    mockRows.clear();
    jest.clearAllMocks();
  });

  test('recupera foto y coordenadas solo para su usuario', async () => {
    await insertTask(taskA);
    await insertTask(taskB);

    await expect(loadTasks('user-a')).resolves.toEqual([taskA]);
    await expect(loadTasks('user-b')).resolves.toEqual([taskB]);
  });

  test('impide editar o eliminar la tarea de otra cuenta', async () => {
    await insertTask(taskB);

    await updateTask({ ...taskB, userId: 'user-a', title: 'Cambio no autorizado' });
    await deleteTask(taskB.id, 'user-a');

    await expect(loadTasks('user-b')).resolves.toEqual([taskB]);
  });
});
