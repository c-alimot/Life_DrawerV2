import { useAuthStore } from '@store';
import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import type { ApiError } from '@types';

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Initialize auth on app startup
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authApi.getSession();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    error,
    initializeAuth,
  };
}