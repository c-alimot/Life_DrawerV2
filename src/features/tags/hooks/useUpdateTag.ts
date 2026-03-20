import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { tagsApi } from '../api/tags.api';
import type { ApiError, Tag } from '@types';

export function useUpdateTag() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTag = useCallback(
    async (tagId: string, data: { name?: string; color?: string }): Promise<Tag | null> => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);

      try {
        const result = await tagsApi.updateTag(tagId, user.id, data);

        if (!result.success || !result.data) {
          setError(
            result.error || {
              code: 'UNKNOWN_ERROR',
              message: 'Failed to update tag',
            }
          );
          return null;
        }

        return result.data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        console.error('Update tag error:', apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    updateTag,
    isLoading,
    error,
  };
}