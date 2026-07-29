import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { entriesService } from '@services/supabase/entries';
import { returnApi } from '@features/return/return.api';
import type { EntryWithRelations, ApiError } from '@types';

export function useEntryDetail(entryId: string) {
  const { user } = useAuthStore();
  const [entry, setEntry] = useState<EntryWithRelations | null>(null);
  const [reflectionChain, setReflectionChain] = useState<EntryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEntry = useCallback(async () => {
    if (!user || !entryId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await entriesService.getEntryById(entryId, user.id);
      setEntry(result);
      const chainResult = await returnApi.getReflectionChain(entryId, user.id);
      setReflectionChain(chainResult.success && chainResult.data ? chainResult.data : []);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Fetch entry error:', apiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, entryId]);

  const recordEntryView = useCallback(async () => {
    if (!user || !entryId) return false;

    try {
      const result = await returnApi.recordEntryView(entryId, user.id);
      if (!result.success || !result.data) {
        return false;
      }

      setEntry((current) =>
        current
          ? {
              ...current,
              lastViewedAt: result.data.lastViewedAt,
              revisitCount: result.data.revisitCount,
            }
          : current,
      );
      return true;
    } catch (err) {
      console.error('Record entry view error:', err);
      return false;
    }
  }, [entryId, user]);

  const setSavedForLater = useCallback(
    async (saved: boolean) => {
      if (!user || !entryId) return false;

      const result = await returnApi.setSavedForLater(entryId, saved, user.id);
      if (!result.success || result.data === null) {
        return false;
      }

      setEntry((current) => (current ? { ...current, savedForLater: result.data } : current));
      return true;
    },
    [entryId, user],
  );

  const setEntryResurfacing = useCallback(
    async (enabled: boolean) => {
      if (!user || !entryId) return false;

      const result = await returnApi.setEntryResurfacing(entryId, enabled, user.id);
      if (!result.success || result.data === null) {
        return false;
      }

      setEntry((current) =>
        current ? { ...current, resurfacingEnabled: result.data } : current,
      );
      return true;
    },
    [entryId, user],
  );

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
    reflectionChain,
    isLoading,
    error,
    fetchEntry,
    recordEntryView,
    setSavedForLater,
    setEntryResurfacing,
    deleteEntry,
    unlinkDrawer,
    unlinkTag,
  };
}
