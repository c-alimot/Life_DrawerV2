import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { authApi } from '../api/auth.api';
import type { LoginRequest, ApiError } from '@types';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { setUser, setLoading } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authApi.login(credentials);

      if (!result.success || !result.data) {
        setError(result.error || { code: 'UNKNOWN_ERROR', message: 'Login failed' });
        return false;
      }

      setUser(result.data.user);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Login error:', apiError);
      return false;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    login,
    isLoading,
    error,
  };
}