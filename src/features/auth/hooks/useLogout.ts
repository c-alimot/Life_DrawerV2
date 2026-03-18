import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { authApi } from '../api/auth.api';
import type { ApiError } from '@types';

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { logout: storeLogout } = useAuthStore();

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authApi.logout();

      if (!result.success) {
        setError(result.error || { code: 'UNKNOWN_ERROR', message: 'Logout failed' });
        return false;
      }

      // Clear store
      storeLogout();
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Logout error:', apiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  return {
    logout,
    isLoading,
    error,
  };
}