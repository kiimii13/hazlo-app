import * as Crypto from 'expo-crypto';

export type AuthUser = {
  id: string;
  username: string;
};

export type StoredUser = AuthUser & {
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateCredentials(username: string, password: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    throw new Error('El usuario debe tener entre 3 y 32 caracteres: letras, números, punto, guion o guion bajo.');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  return normalizedUsername;
}

export function createAuthId() {
  return Crypto.randomUUID();
}

export function createPasswordSalt() {
  return Crypto.randomUUID();
}

export async function hashPassword(password: string, salt: string) {
  // shortcut: SHA-256 con salt sirve para esta autenticación local básica; para cuentas remotas se necesita un KDF de contraseñas.
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
