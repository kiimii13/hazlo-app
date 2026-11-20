const mockUsers = new Map<string, Record<string, string>>();
const mockSession = { value: null as string | null };
let mockId = 0;

const mockDatabase = {
  execAsync: jest.fn(async () => undefined),
  getFirstAsync: jest.fn(async (query: string, params: string[] = []) => {
    if (query.includes('PRAGMA user_version')) return { user_version: 3 };

    if (query.includes('SELECT id FROM users WHERE username = ?')) {
      const user = [...mockUsers.values()].find((candidate) => candidate.username === params[0]);
      return user ? { id: user.id } : null;
    }

    if (query.includes('FROM users WHERE username = ?')) {
      return [...mockUsers.values()].find((candidate) => candidate.username === params[0]) ?? null;
    }

    if (query.includes('FROM users WHERE id = ?')) {
      return mockUsers.get(params[0]) ?? null;
    }

    return null;
  }),
  getAllAsync: jest.fn(async () => []),
  runAsync: jest.fn(async (query: string, params: string[] = []) => {
    if (query.includes('INSERT INTO users')) {
      const [id, username, passwordSalt, passwordHash, createdAt] = params;
      mockUsers.set(id, { id, username, passwordSalt, passwordHash, createdAt });
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

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (_key: string, value: string) => {
    mockSession.value = value;
  }),
  getItemAsync: jest.fn(async () => mockSession.value),
  deleteItemAsync: jest.fn(async () => {
    mockSession.value = null;
  }),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  randomUUID: jest.fn(() => `id-${++mockId}`),
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => `hash:${value}`),
}));

import { getCurrentUser, login, logout, register } from '@/lib/auth.native';

describe('autenticación nativa', () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
    mockUsers.clear();
    mockSession.value = null;
    mockId = 0;
    jest.clearAllMocks();
  });

  test('registra usuario, guarda hash y crea sesión', async () => {
    const user = await register(' Ana ', 'secreto123');

    expect(user.username).toBe('ana');
    expect(mockUsers.get(user.id)).toEqual(
      expect.objectContaining({
        username: 'ana',
        passwordHash: 'hash:id-2:secreto123',
      }),
    );
    expect(mockUsers.get(user.id)).not.toHaveProperty('password');
    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  test('rechaza usuario duplicado y contraseña incorrecta', async () => {
    await register('ana', 'secreto123');

    await expect(register('ANA', 'otra-clave')).rejects.toThrow('Ese usuario ya existe.');
    await expect(login('ana', 'incorrecta')).rejects.toThrow('Usuario o contraseña incorrectos.');
  });

  test('crea la cuenta demo admin solo en desarrollo', async () => {
    (globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;

    await expect(login('admin', 'admin123')).resolves.toEqual({
      id: 'hazlo-development-admin',
      username: 'admin',
    });

    expect(mockUsers.get('hazlo-development-admin')).toEqual(
      expect.objectContaining({
        username: 'admin',
        passwordHash: 'hash:id-1:admin123',
      }),
    );
    expect(mockUsers.get('hazlo-development-admin')).not.toHaveProperty('password');
    await expect(login('admin', 'incorrecta')).rejects.toThrow('Usuario o contraseña incorrectos.');
  });

  test('cierra sesión y deja de recuperar usuario', async () => {
    await register('ana', 'secreto123');
    await logout();

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
