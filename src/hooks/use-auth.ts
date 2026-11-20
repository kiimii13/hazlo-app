import { useCallback, useEffect, useState } from 'react';

import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
  register as registerUser,
} from '@/lib/auth';
import type { AuthUser } from '@/lib/auth-utils';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser);
      })
      .catch(() => {
        if (isMounted) setError('No se pudo recuperar la sesión.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    try {
      const authenticatedUser = await loginUser(username, password);
      setUser(authenticatedUser);
      setError(null);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    try {
      const createdUser = await registerUser(username, password);
      setUser(createdUser);
      setError(null);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cerrar la sesión.');
    }
  }, []);

  return { user, isLoading, isSubmitting, error, login, register, logout };
}
