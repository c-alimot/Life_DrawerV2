import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { tagsApi } from '../api/tags.api';
import type { Tag, ApiError } from '@types';

interface TagWithCount extends Tag {
  entryCount: number;
}

export function useTags() {
  const { user } = useAuthStore();
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTags = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await tagsApi.getTags(user.id);

      if (!result.success || !result.data) {
        setError(
          result.error || {
            code: 'UNKNOWN_ERROR',
            message: 'Failed to fetch tags',
          }
        );
        return;
      }

      setTags(result.data.tags);
      setTotal(result.data.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Fetch tags error:', apiError);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSingleTag = useCallback(
    async (tagId: string) => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);

      try {
        const result = await tagsApi.getTag(tagId, user.id);

        if (!result.success || !result.data) {
          setError(
            result.error || {
              code: 'UNKNOWN_ERROR',
              message: 'Failed to fetch tag',
            }
          );
          return null;
        }

        return result.data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        console.error('Fetch single tag error:', apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const searchTags = useCallback(
    async (query: string) => {
      if (!user) return [];

      setIsLoading(true);
      setError(null);

      try {
        const result = await tagsApi.searchTags(user.id, query);

        if (!result.success || !result.data) {
          setError(
            result.error || {
              code: 'UNKNOWN_ERROR',
              message: 'Failed to search tags',
            }
          );
          return [];
        }

        return result.data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        console.error('Search tags error:', apiError);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    tags,
    isLoading,
    error,
    total,
    fetchTags,
    fetchSingleTag,
    searchTags,
  };
}