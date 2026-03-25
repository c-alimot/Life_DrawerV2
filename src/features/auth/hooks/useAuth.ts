import { useAuthStore } from '@store';
import { useCallback } from 'react';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();

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
    initializeAuth,
  };
}
