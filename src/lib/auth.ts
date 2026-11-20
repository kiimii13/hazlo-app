import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createAuthId,
  createPasswordSalt,
  hashPassword,
  type AuthUser,
  type StoredUser,
  validateCredentials,
} from '@/lib/auth-utils';
import { claimUnassignedTasks } from '@/lib/tasks';

const USERS_KEY = '@hazlo/users';
const SESSION_KEY = '@hazlo/session';

async function readUsers(): Promise<StoredUser[]> {
  const storedUsers = await AsyncStorage.getItem(USERS_KEY);
  if (!storedUsers) return [];

  const parsed: unknown = JSON.parse(storedUsers);
  if (!Array.isArray(parsed)) throw new Error('Los usuarios guardados no tienen un formato válido.');
  return parsed as StoredUser[];
}

async function writeUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toAuthUser(user: StoredUser): AuthUser {
  return { id: user.id, username: user.username };
}

export async function register(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const users = await readUsers();
  if (users.some((user) => user.username === normalizedUsername)) {
    throw new Error('Ese usuario ya existe.');
  }

  const passwordSalt = createPasswordSalt();
  const user: StoredUser = {
    id: createAuthId(),
    username: normalizedUsername,
    passwordSalt,
    passwordHash: await hashPassword(password, passwordSalt),
    createdAt: new Date().toISOString(),
  };

  await writeUsers([...users, user]);
  await claimUnassignedTasks(user.id);
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return toAuthUser(user);
}

export async function login(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const users = await readUsers();
  const user = users.find((candidate) => candidate.username === normalizedUsername);

  if (!user || (await hashPassword(password, user.passwordSalt)) !== user.passwordHash) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  await claimUnassignedTasks(user.id);
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return toAuthUser(user);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;

  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }

  return toAuthUser(user);
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
