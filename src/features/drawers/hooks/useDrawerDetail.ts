import { useState, useCallback } from "react";
import { useAuthStore } from "@store";
import { drawersApi } from "../api/drawers.api";
import type { ApiError, DrawerWithRelations } from "@types";

export function useDrawerDetail(drawerId: string) {
  const { user } = useAuthStore();
  const [drawer, setDrawer] = useState<DrawerWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchDrawer = useCallback(async () => {
    if (!user || !drawerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await drawersApi.getDrawer(drawerId, user.id);

      if (!result.success || !result.data) {
        setError(
          result.error || {
            code: "UNKNOWN_ERROR",
            message: "Failed to fetch drawer",
          },
        );
        return;
      }

      setDrawer(result.data);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError);
      console.error("Error fetching drawer:", apiError);
    } finally {
      setIsLoading(false);
    }
  }, [user, drawerId]);

  const deleteDrawer = useCallback(async () => {
    if (!user || !drawerId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await drawersApi.deleteDrawer(drawerId, user.id);
      if (!result.success) {
        setError(
          result.error || {
            code: "UNKNOWN_ERROR",
            message: "Failed to delete drawer",
          },
        );
        return false;
      }

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError);
      console.error("Error deleting drawer:", apiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, drawerId]);

  return { drawer, isLoading, error, fetchDrawer, deleteDrawer };
}
