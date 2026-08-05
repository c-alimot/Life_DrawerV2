import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { entriesService } from '@services/supabase/entries';
import { returnApi } from '@features/return/return.api';
import { entryStatusApi } from '../api/entryStatus.api';
import { entryDevelopmentTimelineApi } from '../api/entryDevelopmentTimeline.api';
import type { EntryDevelopmentTimeline } from '../entryDevelopmentTimeline';
import type { EntryStatusHistory, EntryStatusUpdateResult, EntryWithRelations, ReflectionChainEntry, ApiError } from '@types';

export function useEntryDetail(entryId: string) {
  const { user } = useAuthStore();
  const [entry, setEntry] = useState<EntryWithRelations | null>(null);
  const [reflectionChain, setReflectionChain] = useState<ReflectionChainEntry[]>([]);
  const [isReflectionChainLoading, setIsReflectionChainLoading] = useState(false);
  const [reflectionChainError, setReflectionChainError] = useState<ApiError | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [statusHistory, setStatusHistory] = useState<EntryStatusHistory[]>([]);
  const [isStatusHistoryLoading, setIsStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState<ApiError | null>(null);
  const [developmentTimeline, setDevelopmentTimeline] = useState<EntryDevelopmentTimeline | null>(null);

  const fetchStatusHistory = useCallback(async () => {
    if (!user || !entryId) return;

    setIsStatusHistoryLoading(true);
    setStatusHistoryError(null);
    const result = await entryStatusApi.getEntryStatusHistory(entryId, user.id);

    if (!result.success || !result.data) {
      setStatusHistory([]);
      setStatusHistoryError(result.error);
      setIsStatusHistoryLoading(false);
      return;
    }

    setStatusHistory(result.data);
    setIsStatusHistoryLoading(false);
  }, [entryId, user]);

  const fetchReflectionChain = useCallback(async () => {
    if (!user || !entryId) return;

    setIsReflectionChainLoading(true);
    setReflectionChainError(null);

    const timelineResult = await entryDevelopmentTimelineApi.getEntryDevelopmentTimeline(entryId, user.id);
    if (!timelineResult.success || !timelineResult.data) {
      setReflectionChain([]);
      setDevelopmentTimeline(null);
      setReflectionChainError(
        timelineResult.error || {
          code: "UNKNOWN_ERROR",
          message: "Failed to load Entry development history",
        },
      );
      setIsReflectionChainLoading(false);
      return;
    }

    setReflectionChain(timelineResult.data.reflectionChain);
    setDevelopmentTimeline(timelineResult.data);
    setIsReflectionChainLoading(false);
  }, [entryId, user]);

  const fetchEntry = useCallback(async () => {
    if (!user || !entryId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await entriesService.getEntryById(entryId, user.id);
      setEntry(result);
      void fetchReflectionChain();
      void fetchStatusHistory();
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Fetch entry error:', apiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [entryId, fetchReflectionChain, fetchStatusHistory, user]);

  const applyStatusUpdate = useCallback((result: EntryStatusUpdateResult) => {
    setEntry((current) => current ? { ...current, currentStatus: result.currentStatus } : current);
    setStatusHistory((current) => {
      const withoutRepeatedEvent = current.filter((event) => event.id !== result.historyEvent.id);
      return [...withoutRepeatedEvent, result.historyEvent];
    });
  }, []);

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

    setIsDeleting(true);
    try {
      await entriesService.deleteEntry(entryId, user.id);
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Delete entry error:', apiError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [user, entryId]);

  const getDirectChildReflections = useCallback(async () => {
    if (!user || !entryId) return null;

    const result = await returnApi.getLinkedReflections(entryId, user.id);
    return result.success && result.data ? result.data : null;
  }, [entryId, user]);

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
    isReflectionChainLoading,
    reflectionChainError,
    isDeleting,
    isLoading,
    error,
    statusHistory,
    isStatusHistoryLoading,
    statusHistoryError,
    developmentTimeline,
    fetchEntry,
    fetchStatusHistory,
    applyStatusUpdate,
    fetchReflectionChain,
    recordEntryView,
    setSavedForLater,
    setEntryResurfacing,
    deleteEntry,
    getDirectChildReflections,
    unlinkDrawer,
    unlinkTag,
  };
}
