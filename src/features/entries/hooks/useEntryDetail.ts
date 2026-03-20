import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { entriesService } from '@services/supabase/entries';
import type { EntryWithRelations, ApiError } from '@types';

export function useEntryDetail(entryId: string) {
  const { user } = useAuthStore();
  const [entry, setEntry] = useState<EntryWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!user || !entryId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await entriesService.getEntryById(entryId, user.id);
      setEntry(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Fetch entry error:', apiError);
    } finally {
      setIsLoading(false);
    }
  }, [user, entryId]);

  const deleteEntry = useCallback(async () => {
    if (!user || !entryId) return false;

    try {
      await entriesService.deleteEntry(entryId, user.id);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Delete entry error:', apiError);
      return false;
    }
  }, [user, entryId]);

  const unlinkDrawer = useCallback(
    async (drawerId: string) => {
      try {
        await entriesService.unlinkEntryFromDrawer(entryId, drawerId);
        setEntry((prev) =>
          prev
            ? {
                ...prev,
                drawers: prev.drawers?.filter((d) => d.id !== drawerId) || [],
              }
            : null
        );
        return true;
      } catch (err) {
        console.error('Unlink drawer error:', err);
        return false;
      }
    },
    [entryId]
  );

  const unlinkTag = useCallback(
    async (tagId: string) => {
      try {
        await entriesService.unlinkEntryFromTag(entryId, tagId);
        setEntry((prev) =>
          prev
            ? {
                ...prev,
                tags: prev.tags?.filter((t) => t.id !== tagId) || [],
              }
            : null
        );
        return true;
      } catch (err) {
        console.error('Unlink tag error:', err);
        return false;
      }
    },
    [entryId]
  );

  return {
    entry,
    isLoading,
    error,
    fetchEntry,
    deleteEntry,
    unlinkDrawer,
    unlinkTag,
  };
}