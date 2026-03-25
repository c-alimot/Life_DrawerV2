import { useAuthStore } from "@store";
import { useCallback, useState } from "react";
import { entriesApi } from "../api/entries.api";
import type { ApiError, UpdateEntryRequest } from "@types";

export function useEditEntry(entryId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { user } = useAuthStore();

  const updateEntry = useCallback(
    async (data: UpdateEntryRequest) => {
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
