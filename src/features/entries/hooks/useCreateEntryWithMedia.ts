import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { entriesApi } from '../api/entries.api';
import { returnApi } from '@features/return/return.api';
import type {
  ApiError,
  CreateEntryRequest,
  ReflectionType,
} from '@types';

interface LinkedReflectionOptions {
  parentEntryId: string;
  reflectionType: ReflectionType;
}

export function useCreateEntryWithMedia() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createEntry = useCallback(
    async (data: CreateEntryRequest, linkedReflection?: LinkedReflectionOptions) => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const result = linkedReflection
          ? await returnApi.createLinkedReflection(user.id, {
              parentEntryId: linkedReflection.parentEntryId,
              reflectionType: linkedReflection.reflectionType,
              entryData: data,
            })
          : await entriesApi.createEntry(user.id, data);

        if (!result.success || !result.data) {
          setError(
            result.error || {
              code: 'UNKNOWN_ERROR',
              message: 'Failed to create entry',
            }
          );
          return null;
        }

        setUploadProgress(100);
        return result.data;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        console.error('Create entry error:', apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    createEntry,
    isLoading,
    error,
    uploadProgress,
  };
}
