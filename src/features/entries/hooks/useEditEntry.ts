import { useAuthStore } from "@store";
import { useCallback, useState } from "react";
import { entriesApi } from "../api/entries.api";
import { entryStatusApi } from "../api/entryStatus.api";
import type { ApiError, EntryStatus, UpdateEntryRequest } from "@types";

interface StatusChange {
  status: EntryStatus;
  isInitial: boolean;
}

export function useEditEntry(entryId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { user } = useAuthStore();

  const updateEntry = useCallback(
    async (data: UpdateEntryRequest, statusChange?: StatusChange) => {
      if (!user?.id || !entryId) return false;

      setIsLoading(true);
      setError(null);

      try {
        const result = await entriesApi.updateEntry(entryId, user.id, data);
        if (!result.success) {
          setError(
            result.error || {
              code: "UNKNOWN_ERROR",
              message: "Failed to update entry",
            },
          );
          return false;
        }

        if (statusChange) {
          const statusResult = statusChange.isInitial
            ? await entryStatusApi.setInitialEntryStatus(entryId, statusChange.status)
            : await entryStatusApi.updateEntryStatus({
                entryId,
                status: statusChange.status,
              });

          if (!statusResult.success) {
            setError(
              statusResult.error || {
                code: "UNKNOWN_ERROR",
                message: "Entry details saved, but Status could not be updated.",
              },
            );
            return false;
          }
        }

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, entryId],
  );

  return { isLoading, error, updateEntry };
}
