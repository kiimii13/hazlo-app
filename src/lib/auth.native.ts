import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createAuthId,
  createPasswordSalt,
  hashPassword,
  type AuthUser,
  type StoredUser,
  validateCredentials,
} from '@/lib/auth-utils';
import { claimUnassignedTasks, getDatabase } from '@/lib/tasks.native';

const SESSION_KEY = 'hazloSession';
const DEVELOPMENT_USER_ID = 'hazlo-development-admin';
const DEVELOPMENT_USERNAME = 'admin';
const DEVELOPMENT_PASSWORD = 'admin123';

async function ensureDevelopmentAccount(database: SQLiteDatabase) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  const existing = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM users WHERE username = ?',
    [DEVELOPMENT_USERNAME],
  );
  if (existing) return;

  const passwordSalt = createPasswordSalt();
  const passwordHash = await hashPassword(DEVELOPMENT_PASSWORD, passwordSalt);
  const createdAt = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO users (id, username, passwordSalt, passwordHash, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [DEVELOPMENT_USER_ID, DEVELOPMENT_USERNAME, passwordSalt, passwordHash, createdAt],
    );
    await database.runAsync('UPDATE tasks SET userId = ? WHERE userId IS NULL', [DEVELOPMENT_USER_ID]);
  });
}

async function ensureUsersTable() {
  const database = await getDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      passwordSalt TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  await ensureDevelopmentAccount(database);
  return database;
}

function toAuthUser(user: StoredUser): AuthUser {
  return { id: user.id, username: user.username };
}

export async function register(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const database = await ensureUsersTable();
  const existing = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM users WHERE username = ?',
    [normalizedUsername],
  );

  if (existing) throw new Error('Ese usuario ya existe.');

  const user: StoredUser = {
    id: createAuthId(),
    username: normalizedUsername,
    passwordSalt: createPasswordSalt(),
    passwordHash: '',
    createdAt: new Date().toISOString(),
  };
  user.passwordHash = await hashPassword(password, user.passwordSalt);

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO users (id, username, passwordSalt, passwordHash, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.username, user.passwordSalt, user.passwordHash, user.createdAt],
    );
    await database.runAsync('UPDATE tasks SET userId = ? WHERE userId IS NULL', [user.id]);
  });

  await SecureStore.setItemAsync(SESSION_KEY, user.id);
  return toAuthUser(user);
}

export async function login(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const database = await ensureUsersTable();
  const user = await database.getFirstAsync<StoredUser>(
    `SELECT id, username, passwordSalt, passwordHash, createdAt
     FROM users WHERE username = ?`,
    [normalizedUsername],
  );

  if (!user || (await hashPassword(password, user.passwordSalt)) !== user.passwordHash) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  await claimUnassignedTasks(user.id);
  await SecureStore.setItemAsync(SESSION_KEY, user.id);
  return toAuthUser(user);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await SecureStore.getItemAsync(SESSION_KEY);
  if (!userId) return null;

  const database = await ensureUsersTable();
  const user = await database.getFirstAsync<StoredUser>(
    `SELECT id, username, passwordSalt, passwordHash, createdAt
     FROM users WHERE id = ?`,
    [userId],
  );

  if (!user) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }

  return toAuthUser(user);
}

export async function logout() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
