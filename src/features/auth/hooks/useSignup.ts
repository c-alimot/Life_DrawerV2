import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { authApi } from '../api/auth.api';
import type { SignupRequest, ApiError } from '@types';

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { setUser, setLoading } = useAuthStore();

  const signup = useCallback(async (credentials: SignupRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authApi.signup(credentials);

      if (!result.success || !result.data) {
        setError(result.error || { code: 'UNKNOWN_ERROR', message: 'Signup failed' });
        return false;
      }

      setUser(result.data.user);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Signup error:', apiError);
      return false;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    signup,
    isLoading,
    error,
  };
}