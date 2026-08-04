import { useAuthStore } from "@store";
import type { ApiError, ExcludedReturnContent } from "@types";
import { useCallback, useState } from "react";
import { returnApi } from "./return.api";

export function useExcludedReturnContent() {
  const { user } = useAuthStore();
  const [content, setContent] = useState<ExcludedReturnContent>({ entryCount: 0, drawerCount: 0, entries: [], drawers: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setContent({ entryCount: 0, drawerCount: 0, entries: [], drawers: [] });
      return null;
    }

    setIsLoading(true);
    setError(null);
    const result = await returnApi.getExcludedReturnContent(user.id);

    if (!result.success || !result.data) {
      setContent({ entryCount: 0, drawerCount: 0, entries: [], drawers: [] });
      setError(result.error || { code: "UNKNOWN_ERROR", message: "Unable to load excluded content" });
      setIsLoading(false);
      return null;
    }

    setContent(result.data);
    setIsLoading(false);
    return result.data;
  }, [user]);

  const restoreEntry = useCallback(async (entryId: string) => {
    if (!user) return false;

    const result = await returnApi.setEntryResurfacing(entryId, true, user.id);
    if (result.success) {
      setContent((current) => ({
        ...current,
        entryCount: Math.max(0, current.entryCount - 1),
        entries: current.entries.filter((entry) => entry.id !== entryId),
      }));
    }

    return result.success;
  }, [user]);

  const restoreDrawer = useCallback(async (drawerId: string) => {
    if (!user) return false;

    const result = await returnApi.setDrawerResurfacing(drawerId, true, user.id);
    if (result.success) {
      setContent((current) => ({
        ...current,
        drawerCount: Math.max(0, current.drawerCount - 1),
        drawers: current.drawers.filter((drawer) => drawer.id !== drawerId),
      }));
    }

    return result.success;
  }, [user]);

  return { content, isLoading, error, load, restoreEntry, restoreDrawer };
}
